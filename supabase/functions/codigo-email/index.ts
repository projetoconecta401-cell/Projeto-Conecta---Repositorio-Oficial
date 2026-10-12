// EiFreela — códigos de 6 dígitos por e-mail (cadastro e recuperação de senha).
//
// Ações (POST, corpo JSON):
//   { acao: "enviar",    email, finalidade: "cadastro" | "senha", cpf? }
//   { acao: "verificar", email, finalidade, codigo }           (confere sem consumir)
//   { acao: "redefinir", email, codigo, senha }                (recuperação de senha)
//
// No cadastro, o código só é pedido DEPOIS que a pessoa preencheu todos os dados
// (o app envia o CPF junto, para avisar antes se ele já está em uso).
//
// Envio pelo Gmail (smtp.gmail.com:465, TLS) com os secrets SMTP_USERNAME e SMTP_PASSWORD
// (senha de app do Google) — Edge Functions → Secrets no painel do Supabase.
// Proteções: código guardado só como hash, validade de 10 min, 5 tentativas,
// 1 envio por minuto e 5 por hora por e-mail; na recuperação de senha a resposta é
// sempre genérica (não revela se a conta existe).
import { withSupabase } from "npm:@supabase/server@1.9.0";
import nodemailer from "npm:nodemailer@10.0.14";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA = /^(?=.*[A-Za-zÀ-ÿ])(?=.*\d)(?=.*[^A-Za-zÀ-ÿ0-9\s]).{8,72}$/;
const VALIDADE_MIN = 10;
const MAX_TENTATIVAS = 5;

function smtpConfig() {
  const user = (Deno.env.get("SMTP_USERNAME") ?? Deno.env.get("SMTP_USER") ?? "").trim();
  const pass = (Deno.env.get("SMTP_PASSWORD") ?? Deno.env.get("SMTP_PASS") ?? "").replace(/\s+/g, "");
  return user && pass ? { user, pass } : null;
}

const resposta = (corpo: Record<string, unknown>, status = 200) => Response.json(corpo, { status });
const erro = (mensagem: string, status = 400) => resposta({ erro: mensagem }, status);

async function hash(finalidade: string, email: string, codigo: string) {
  const dados = new TextEncoder().encode(`${finalidade}:${email}:${codigo}`);
  const digest = await crypto.subtle.digest("SHA-256", dados);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function gerarCodigo() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}

// deno-lint-ignore no-explicit-any
type Admin = any;

async function conferir(admin: Admin, email: string, finalidade: string, codigo: string) {
  const { data: linha } = await admin
    .from("codigos_email")
    .select("id, codigo_hash, expira_em, tentativas")
    .eq("email", email)
    .eq("finalidade", finalidade)
    .is("usado_em", null)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!linha || new Date(linha.expira_em) < new Date()) {
    return { erro: "Código expirado ou inexistente. Peça um novo código." };
  }
  if (linha.tentativas >= MAX_TENTATIVAS) return { erro: "Muitas tentativas. Peça um novo código." };
  if (linha.codigo_hash !== (await hash(finalidade, email, codigo))) {
    await admin.from("codigos_email").update({ tentativas: linha.tentativas + 1 }).eq("id", linha.id);
    return { erro: "Código incorreto. Confira e tente novamente." };
  }
  return { id: linha.id as string };
}

async function enviarEmail(para: string, codigo: string, finalidade: string) {
  const smtp = smtpConfig()!;
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  const titulo = finalidade === "senha" ? "Recuperação de senha" : "Confirmação de e-mail";
  const motivo = finalidade === "senha" ? "redefinir sua senha" : "confirmar seu e-mail e concluir o cadastro";
  await transport.sendMail({
    from: `EiFreela <${smtp.user}>`,
    to: para,
    subject: `Seu código EiFreela: ${codigo}`,
    text:
      `${titulo}\n\nUse o código ${codigo} para ${motivo}.\nEle vale por ${VALIDADE_MIN} minutos.\n\n` +
      `Se você não pediu este código, ignore este e-mail.\n\nEiFreela`,
    html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;color:#1c1917">
      <h2 style="color:#ea580c;margin-bottom:4px">EiFreela</h2>
      <p style="margin-top:0;color:#78716c">${titulo}</p>
      <p>Use o código abaixo para ${motivo}:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;background:#fff7ed;color:#9a3412;padding:16px;text-align:center;border-radius:12px">${codigo}</p>
      <p style="color:#78716c;font-size:13px">O código vale por ${VALIDADE_MIN} minutos. Se você não pediu este código, ignore este e-mail.</p>
    </div>`,
  });
}

export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, ctx) => {
    if (req.method !== "POST") return erro("Método não permitido.", 405);
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return erro("Dados inválidos.");
    }

    const admin = ctx.supabaseAdmin;
    const acao = String(body.acao ?? "");
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!EMAIL.test(email) || email.length > 254) return erro("Informe um e-mail válido.");

    // ---- ENVIAR ----------------------------------------------------------------
    if (acao === "enviar") {
      const finalidade = body.finalidade === "senha" ? "senha" : "cadastro";
      if (!smtpConfig()) return erro("O envio de e-mails ainda não foi configurado.", 503);

      const umMinuto = new Date(Date.now() - 60_000).toISOString();
      const umaHora = new Date(Date.now() - 3_600_000).toISOString();
      const { count: recentes } = await admin.from("codigos_email")
        .select("id", { count: "exact", head: true })
        .eq("email", email).eq("finalidade", finalidade).gte("criado_em", umMinuto);
      if ((recentes ?? 0) > 0) return erro("Aguarde 1 minuto para pedir um novo código.", 429);
      const { count: naHora } = await admin.from("codigos_email")
        .select("id", { count: "exact", head: true })
        .eq("email", email).eq("finalidade", finalidade).gte("criado_em", umaHora);
      if ((naHora ?? 0) >= 5) return erro("Muitos códigos pedidos. Tente novamente em 1 hora.", 429);

      const { data: contaId } = await admin.rpc("conta_por_email", { p_email: email });
      if (finalidade === "cadastro" && contaId) return erro("Já existe uma conta com este e-mail. Faça login.", 409);
      if (finalidade === "senha" && !contaId) return resposta({ ok: true }); // resposta genérica

      if (finalidade === "cadastro") {
        const cpf = String(body.cpf ?? "").replace(/\D/g, "");
        if (cpf.length === 11) {
          const { data: cpfUsado } = await admin.from("profiles").select("id").eq("cpf", cpf).maybeSingle();
          if (cpfUsado) return erro("Este CPF já está cadastrado. Faça login.", 409);
        }
      }

      const codigo = gerarCodigo();
      const { data: linha, error } = await admin.from("codigos_email").insert({
        email,
        finalidade,
        codigo_hash: await hash(finalidade, email, codigo),
        expira_em: new Date(Date.now() + VALIDADE_MIN * 60_000).toISOString(),
      }).select("id").single();
      if (error) {
        console.error("insert codigo:", error.message);
        return erro("Não foi possível gerar o código agora.", 500);
      }
      try {
        await enviarEmail(email, codigo, finalidade);
      } catch (e) {
        console.error("sendMail:", (e as Error).message);
        await admin.from("codigos_email").delete().eq("id", linha.id);
        return erro("Não foi possível enviar o e-mail agora. Tente novamente.", 502);
      }
      return resposta({ ok: true });
    }

    // ---- VERIFICAR (confere sem consumir; no cadastro o consumo é feito em "cadastrar") ----
    if (acao === "verificar") {
      const finalidade = body.finalidade === "senha" ? "senha" : "cadastro";
      const codigo = String(body.codigo ?? "").replace(/\D/g, "");
      if (codigo.length !== 6) return erro("O código tem 6 dígitos.");
      const r = await conferir(admin, email, finalidade, codigo);
      return r.erro ? erro(r.erro) : resposta({ ok: true });
    }

    // ---- REDEFINIR SENHA -----------------------------------------------------------
    if (acao === "redefinir") {
      const codigo = String(body.codigo ?? "").replace(/\D/g, "");
      const senha = String(body.senha ?? "");
      if (codigo.length !== 6) return erro("O código tem 6 dígitos.");
      if (!SENHA.test(senha)) {
        return erro("A senha precisa de 8+ caracteres, com letra, número e caractere especial (ex.: @ # $ !).");
      }
      const r = await conferir(admin, email, "senha", codigo);
      if (r.erro) return erro(r.erro);
      const { data: contaId } = await admin.rpc("conta_por_email", { p_email: email });
      if (!contaId) return erro("Código expirado ou inexistente. Peça um novo código.");
      const { error } = await admin.auth.admin.updateUserById(contaId, { password: senha });
      if (error) {
        console.error("updateUserById:", error.message);
        return erro("Não foi possível alterar a senha agora.", 500);
      }
      await admin.from("codigos_email").update({ usado_em: new Date().toISOString() }).eq("id", r.id);
      return resposta({ ok: true });
    }

    return erro("Ação inválida.");
  }),
};
