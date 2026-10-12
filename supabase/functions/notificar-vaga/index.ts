// EiFreela — envia Web Push ("Nova vaga em …") para os aparelhos inscritos.
//
// Quem chama: o gatilho public.avisar_nova_vaga() (via pg_net) logo após uma vaga ser
// publicada. O próprio gatilho já escolhe as inscrições das pessoas que atuam na
// categoria da vaga, então esta função não precisa ler o banco.
//
// Segurança: verify_jwt = false, mas toda chamada precisa do cabeçalho
// x-eifreela-segredo igual ao secret NOTIFICAR_VAGA_SEGREDO (o mesmo valor guardado
// no Vault do banco com o nome "notificar_vaga_segredo").
//
// Secrets necessários (Edge Functions → Secrets):
//   NOTIFICAR_VAGA_SEGREDO, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (ex.: mailto:contato@eifreela.com.br)
import webpush from "npm:web-push@3.6.7";

type Inscricao = { endpoint: string; p256dh: string; auth: string };

function iguais(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Método não permitido.", { status: 405 });

  const segredo = Deno.env.get("NOTIFICAR_VAGA_SEGREDO") ?? "";
  const recebido = req.headers.get("x-eifreela-segredo") ?? "";
  if (!segredo || !iguais(segredo, recebido)) return new Response("Não autorizado.", { status: 401 });

  const publica = Deno.env.get("VAPID_PUBLIC_KEY");
  const privada = Deno.env.get("VAPID_PRIVATE_KEY");
  const assunto = Deno.env.get("VAPID_SUBJECT") ?? "mailto:projetoconecta401@gmail.com";
  if (!publica || !privada) return Response.json({ erro: "VAPID não configurado." }, { status: 503 });
  webpush.setVapidDetails(assunto, publica, privada);

  let body: { titulo?: string; corpo?: string; url?: string; inscricoes?: Inscricao[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const payload = JSON.stringify({
    title: String(body.titulo ?? "Nova vaga no EiFreela").slice(0, 120),
    body: String(body.corpo ?? "").slice(0, 240),
    url: String(body.url ?? "/").startsWith("/") ? String(body.url) : "/",
  });

  const inscricoes = (body.inscricoes ?? []).slice(0, 2000);
  let enviados = 0;
  const expirados: string[] = [];

  await Promise.all(
    inscricoes.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
          { TTL: 60 * 60 * 6, urgency: "normal" },
        );
        enviados++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) expirados.push(s.endpoint);
        else console.error("push:", status, (e as Error).message);
      }
    }),
  );

  return Response.json({ enviados, expirados: expirados.length });
});
