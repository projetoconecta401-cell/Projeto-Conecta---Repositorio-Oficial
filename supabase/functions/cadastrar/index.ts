// Conexão Free — cria uma conta (Supabase Auth) já confirmada.
//
// Por quê: o envio de e-mails padrão do Supabase só entrega para membros da equipe do
// projeto, então a confirmação por e-mail travaria o cadastro de usuários comuns.
// Esta função cria o usuário com email_confirm = true usando a chave secreta, que só
// existe no ambiente das Edge Functions (nunca no navegador).
//
// Chamada pelo app com supabase.functions.invoke("cadastrar", { body }) — exige a chave
// publishable no cabeçalho apikey (verify_jwt = false; quem valida é o withSupabase).
// Validações repetidas aqui no servidor: e-mail, senha, nome e maioridade (18+).
import { withSupabase } from "npm:@supabase/server@1.9.0";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERFIS = ["contratar", "trabalhar"];

function idade(nascimentoISO: string): number {
  const nasc = new Date(nascimentoISO + "T00:00:00Z");
  if (Number.isNaN(nasc.getTime())) return -1;
  const hoje = new Date();
  let anos = hoje.getUTCFullYear() - nasc.getUTCFullYear();
  const m = hoje.getUTCMonth() - nasc.getUTCMonth();
  if (m < 0 || (m === 0 && hoje.getUTCDate() < nasc.getUTCDate())) anos--;
  return anos;
}

const erro = (mensagem: string, status = 400) => Response.json({ erro: mensagem }, { status });

export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, ctx) => {
    if (req.method !== "POST") return erro("Método não permitido.", 405);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return erro("Dados inválidos.");
    }

    const nome = String(body.nome ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const senha = String(body.senha ?? "");
    const telefone = String(body.telefone ?? "").trim().slice(0, 20);
    const nascimento = String(body.nascimento ?? "");
    const perfil = PERFIS.includes(String(body.perfil)) ? String(body.perfil) : "trabalhar";

    if (nome.length < 2 || nome.length > 80) return erro("Informe seu nome (2 a 80 caracteres).");
    if (!EMAIL.test(email) || email.length > 254) return erro("Informe um e-mail válido.");
    if (senha.length < 6 || senha.length > 72) return erro("A senha deve ter de 6 a 72 caracteres.");
    if (idade(nascimento) < 18) return erro("A Conexão Free é apenas para maiores de 18 anos.");

    const { data, error } = await ctx.supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome, telefone, nascimento, perfil },
    });

    if (error) {
      const code = (error as { code?: string }).code ?? "";
      if (code === "email_exists" || /already been registered|already exists/i.test(error.message)) {
        return erro("Já existe uma conta com este e-mail. Faça login.", 409);
      }
      if (code === "weak_password") return erro("Senha fraca. Use pelo menos 6 caracteres.");
      console.error("createUser:", code, error.message);
      return erro("Não foi possível criar a conta agora. Tente novamente.", 500);
    }

    return Response.json({ id: data.user?.id }, { status: 201 });
  }),
};
