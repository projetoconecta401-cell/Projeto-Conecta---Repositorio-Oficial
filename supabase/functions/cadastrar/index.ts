// EiFreela — conclui o cadastro DEPOIS do pré-cadastro e da verificação do e-mail.
//
// Fluxo novo (Erro 4):
//   1. O app coleta TODOS os dados básicos (nome, CPF, e-mail, nascimento, telefone,
//      áreas, senha e foto) e valida no navegador.
//   2. Só então pede o código por e-mail (função "codigo-email", acao "enviar").
//   3. A pessoa digita o código e o app chama ESTA função, que confere o código,
//      cria a conta já confirmada no Supabase Auth e grava a linha em public.profiles.
//   4. O app faz login com e-mail + senha e envia a foto para o Storage (bucket avatars).
//
// Nenhum dado bancário (conta, PIX, cartão) é aceito ou gravado.
import { withSupabase } from "npm:@supabase/server@1.9.0";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Mínimo 8 caracteres, com letra, número e caractere especial (@ # $ ! etc.).
const SENHA = /^(?=.*[A-Za-zÀ-ÿ])(?=.*\d)(?=.*[^A-Za-zÀ-ÿ0-9\s]).{8,72}$/;
const AREAS = ["Gastronomia", "Eventos", "Vendas e comércio", "Administrativo", "Design gráfico", "Criação de conteúdo", "Fotografia e vídeo", "Tecnologia e TI", "Estética/Beleza", "Manutenção/Obras", "Serviços Gerais", "Logística e entregas", "Motorista", "Cuidados (babá e idosos)", "Aulas e reforço", "Agro e campo"];
const MAX_TENTATIVAS = 5;

const erro = (mensagem: string, status = 400) => Response.json({ erro: mensagem }, { status });

function cpfValido(cpf: string) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const d = cpf.split("").map(Number);
  const dv = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += d[i] * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === d[9] && dv(10) === d[10];
}

function idade(nascimentoISO: string): number {
  const nasc = new Date(nascimentoISO + "T00:00:00Z");
  if (Number.isNaN(nasc.getTime())) return -1;
  const hoje = new Date();
  let anos = hoje.getUTCFullYear() - nasc.getUTCFullYear();
  const m = hoje.getUTCMonth() - nasc.getUTCMonth();
  if (m < 0 || (m === 0 && hoje.getUTCDate() < nasc.getUTCDate())) anos--;
  return anos;
}

async function hash(finalidade: string, email: string, codigo: string) {
  const dados = new TextEncoder().encode(`${finalidade}:${email}:${codigo}`);
  const digest = await crypto.subtle.digest("SHA-256", dados);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// deno-lint-ignore no-explicit-any
async function conferirCodigo(admin: any, email: string, codigo: string) {
  const { data: linha } = await admin
    .from("codigos_email")
    .select("id, codigo_hash, expira_em, tentativas")
    .eq("email", email)
    .eq("finalidade", "cadastro")
    .is("usado_em", null)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!linha || new Date(linha.expira_em) < new Date()) {
    return { erro: "Código expirado. Peça um novo código." };
  }
  if (linha.tentativas >= MAX_TENTATIVAS) return { erro: "Muitas tentativas. Peça um novo código." };
  if (linha.codigo_hash !== (await hash("cadastro", email, codigo))) {
    await admin.from("codigos_email").update({ tentativas: linha.tentativas + 1 }).eq("id", linha.id);
    return { erro: "Código incorreto. Confira e tente novamente." };
  }
  return { id: linha.id as string };
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

    const nome = String(body.nome ?? "").trim().replace(/\s+/g, " ");
    const cpf = String(body.cpf ?? "").replace(/\D/g, "");
    const email = String(body.email ?? "").trim().toLowerCase();
    const nascimento = String(body.nascimento ?? "");
    const telefone = String(body.telefone ?? "").replace(/\D/g, "");
    const senha = String(body.senha ?? "");
    const codigo = String(body.codigo ?? "").replace(/\D/g, "");
    const areas = Array.isArray(body.areas) ? [...new Set(body.areas.map(String))] : [];

    if (nome.length < 3 || nome.length > 100 || !nome.includes(" ")) return erro("Informe seu nome completo.");
    if (!cpfValido(cpf)) return erro("CPF inválido.");
    if (!EMAIL.test(email) || email.length > 254) return erro("Informe um e-mail válido.");
    if (idade(nascimento) < 18) return erro("O EiFreela é apenas para maiores de 18 anos.");
    if (telefone.length < 10 || telefone.length > 13) return erro("Informe um telefone/WhatsApp com DDD.");
    if (areas.length < 1 || areas.length > 6 || !areas.every((a) => AREAS.includes(a))) {
      return erro("Escolha pelo menos uma área de atuação.");
    }
    if (!SENHA.test(senha)) {
      return erro("A senha precisa de 8+ caracteres, com letra, número e caractere especial (ex.: @ # $ !).");
    }
    if (codigo.length !== 6) return erro("Digite o código de 6 dígitos enviado ao seu e-mail.");

    const admin = ctx.supabaseAdmin;

    const { data: cpfUsado } = await admin.rpc("cpf_em_uso", { p_cpf: cpf }); // CPF guardado só como hash
    if (cpfUsado) return erro("Este CPF já está cadastrado. Faça login.", 409);

    const conferido = await conferirCodigo(admin, email, codigo);
    if (conferido.erro) return erro(conferido.erro);

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome },
    });
    if (error || !data.user) {
      const code = (error as { code?: string } | null)?.code ?? "";
      if (code === "email_exists" || /already been registered|already exists/i.test(error?.message ?? "")) {
        return erro("Já existe uma conta com este e-mail. Faça login.", 409);
      }
      if (code === "weak_password") return erro("Senha fraca. Escolha outra senha.");
      console.error("createUser:", code, error?.message);
      return erro("Não foi possível criar a conta agora. Tente novamente.", 500);
    }

    const { error: erroPerfil } = await admin.from("profiles").insert({
      id: data.user.id,
      nome,
      cpf,
      email,
      data_nascimento: nascimento,
      telefone,
      areas,
    });
    if (erroPerfil) {
      // Sem perfil, a conta não fica pela metade: desfaz a criação.
      await admin.auth.admin.deleteUser(data.user.id);
      if (erroPerfil.code === "23505") return erro("Este CPF já está cadastrado. Faça login.", 409);
      console.error("insert profile:", erroPerfil.message);
      return erro("Não foi possível salvar seu perfil. Tente novamente.", 500);
    }

    await admin.from("codigos_email").update({ usado_em: new Date().toISOString() }).eq("id", conferido.id);
    return Response.json({ id: data.user.id }, { status: 201 });
  }),
};
