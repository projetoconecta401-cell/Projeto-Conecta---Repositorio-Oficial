// EiFreela — apaga as conversas de vagas já encerradas (mensagens E áudios).
//
// Regra (função do banco public.conversas_para_apagar):
//   - a vaga está "Concluída" e as duas partes já avaliaram, OU
//   - a vaga foi concluída há mais de 7 dias (alguém não avaliou);
//   - nunca apaga se houver denúncia "aberta" sobre a vaga ou a conversa.
// Também remove áudios "órfãos" (de conversas que já não existem: vaga excluída,
// conta excluída etc.).
//
// Quem chama: o gatilho de avaliações (logo após a 2ª avaliação) e um agendamento
// diário (pg_cron). Segurança: verify_jwt = false, mas exige o cabeçalho
// x-eifreela-segredo igual ao secret NOTIFICAR_VAGA_SEGREDO (mesmo valor do Vault).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const BUCKET = "chat-audios";

function iguais(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function chaveAdmin(): string {
  const legado = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legado) return legado;
  try {
    const chaves = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    return chaves.default ?? Object.values(chaves)[0] ?? "";
  } catch {
    return "";
  }
}

// deno-lint-ignore no-explicit-any
async function apagarPasta(admin: any, pasta: string) {
  let total = 0;
  for (;;) {
    const { data, error } = await admin.storage.from(BUCKET).list(pasta, { limit: 100 });
    if (error || !data?.length) break;
    const caminhos = data.filter((o: { id: string | null }) => o.id).map((o: { name: string }) => `${pasta}/${o.name}`);
    if (!caminhos.length) break;
    const { error: e2 } = await admin.storage.from(BUCKET).remove(caminhos);
    if (e2) { console.error("remove:", e2.message); break; }
    total += caminhos.length;
    if (data.length < 100) break;
  }
  return total;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Método não permitido.", { status: 405 });
  const segredo = Deno.env.get("NOTIFICAR_VAGA_SEGREDO") ?? "";
  if (!segredo || !iguais(segredo, req.headers.get("x-eifreela-segredo") ?? "")) {
    return new Response("Não autorizado.", { status: 401 });
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, chaveAdmin(), { auth: { persistSession: false } });

  // 1) Conversas que já podem ser apagadas.
  const { data: ids, error } = await admin.rpc("conversas_para_apagar");
  if (error) {
    console.error("conversas_para_apagar:", error.message);
    return Response.json({ erro: "Falha ao listar conversas." }, { status: 500 });
  }
  const conversas: string[] = (ids ?? []).map((x: unknown) => (typeof x === "string" ? x : (x as { id?: string }).id ?? String(x)));

  let audios = 0;
  for (const id of conversas) audios += await apagarPasta(admin, id);
  if (conversas.length) {
    const { error: e3 } = await admin.from("conversas").delete().in("id", conversas);
    if (e3) console.error("delete conversas:", e3.message);
  }

  // 2) Áudios órfãos (pasta sem conversa correspondente).
  let orfaos = 0;
  const { data: pastas } = await admin.storage.from(BUCKET).list("", { limit: 1000 });
  const nomes = (pastas ?? []).filter((p: { id: string | null }) => !p.id).map((p: { name: string }) => p.name);
  if (nomes.length) {
    const validos = nomes.filter((n: string) => /^[0-9a-f-]{36}$/i.test(n));
    const { data: existentes } = validos.length
      ? await admin.from("conversas").select("id").in("id", validos)
      : { data: [] };
    const vivos = new Set((existentes ?? []).map((c: { id: string }) => c.id));
    for (const n of nomes) if (!vivos.has(n)) orfaos += await apagarPasta(admin, n);
  }

  return Response.json({ conversas: conversas.length, audios, orfaos });
});
