import { supabase } from "./supabase.js";

/*
 * Contas reais com Supabase Auth.
 * - Cadastro (Erro 4): a pessoa preenche TODOS os dados primeiro; só então o app pede o
 *   código por e-mail (Edge Function "codigo-email") e, com o código, a função "cadastrar"
 *   cria a conta já confirmada e grava o perfil (tabela profiles).
 * - Google/Facebook (Erro 5): supabase.auth.signInWithOAuth, sem dados falsos. Quem entra
 *   assim completa o perfil (CPF, nascimento, telefone, áreas) na tela "Complete seu perfil".
 * - Login/sair: SDK do Supabase (sessão renovada sozinha).
 */

export async function sessaoAtual() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

/* Avisa a cada login/logout. Retorna a função para parar de ouvir. */
export function aoMudarSessao(callback) {
  const { data } = supabase.auth.onAuthStateChange((_evento, session) => callback(session ?? null));
  return () => data.subscription.unsubscribe();
}

export async function entrar(email, senha) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
  if (error) throw traduzirErro(error);
}

/** Login social real. O navegador vai para o Google/Facebook e volta para /app/. */
export async function entrarComProvedor(provider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: new URL("/app/", window.location.origin).href,
      scopes: provider === "facebook" ? "email public_profile" : undefined,
      queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
    },
  });
  if (error) {
    const nome = provider === "google" ? "Google" : "Facebook";
    if (/not enabled|Unsupported provider/i.test(error.message)) {
      throw new Error(`O login com ${nome} ainda não foi ativado no Supabase.`);
    }
    throw new Error(`Não foi possível abrir o login com ${nome}.`);
  }
}

/*
 * Google pelo botão oficial (Google Identity Services). A janela do Google mostra
 * "eifreela.com.br" em vez do endereço técnico do Supabase. O ID do cliente é público.
 */
export const GOOGLE_CLIENT_ID = "488976676928-9m2vknagc2gsgtu0q2836nvu25ihipjo.apps.googleusercontent.com";

let gsiPromessa = null;
export function carregarGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  gsiPromessa ??= new Promise((ok, falha) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => (window.google?.accounts?.id ? ok(window.google) : falha(new Error("gsi")));
    s.onerror = () => { gsiPromessa = null; falha(new Error("gsi")); };
    document.head.appendChild(s);
    setTimeout(() => falha(new Error("gsi timeout")), 8000);
  });
  return gsiPromessa;
}

async function sha256Hex(texto) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Desenha o botão do Google em `elemento`. Ao escolher a conta, entra no Supabase. */
export async function montarBotaoGoogle(elemento, { largura, texto = "continue_with", onErro }) {
  const google = await carregarGoogle();
  const nonce = crypto.randomUUID();
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    nonce: await sha256Hex(nonce),
    use_fedcm_for_button: true,
    callback: async ({ credential }) => {
      const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token: credential, nonce });
      if (error) onErro?.("Não foi possível entrar com o Google. Tente de novo.");
    },
  });
  elemento.innerHTML = "";
  google.accounts.id.renderButton(elemento, {
    type: "standard", theme: "outline", size: "large", shape: "rectangular",
    text: texto, logo_alignment: "center", locale: "pt-BR", width: Math.min(400, Math.max(200, Math.round(largura))),
  });
}

/* Envia o código de 6 dígitos. finalidade: "cadastro" | "senha". cpf: avisa antes se já está em uso. */
export async function enviarCodigo(email, finalidade, cpf) {
  const { error } = await supabase.functions.invoke("codigo-email", {
    body: { acao: "enviar", email: email.trim().toLowerCase(), finalidade, cpf },
  });
  if (error) throw await erroDaFuncao(error, "Não foi possível enviar o código agora.");
}

/* Recuperação de senha: troca a senha com o código recebido por e-mail. */
export async function redefinirSenha(email, codigo, senha) {
  const { error } = await supabase.functions.invoke("codigo-email", {
    body: { acao: "redefinir", email: email.trim().toLowerCase(), codigo, senha },
  });
  if (error) throw await erroDaFuncao(error, "Não foi possível alterar a senha agora.");
}

/* dados: { nome, cpf, email, nascimento, telefone, areas, senha, codigo }. Cria a conta e já entra. */
export async function cadastrar(dados) {
  const { error } = await supabase.functions.invoke("cadastrar", { body: dados });
  if (error) throw await erroDaFuncao(error, "Não foi possível criar a conta agora.");
  await entrar(dados.email, dados.senha);
}

/** A conta tem senha própria? (quem entrou só com Google/Facebook não tem). */
export const temSenhaPropria = (user) =>
  !!user && ((user.app_metadata?.providers ?? []).includes("email") || (user.identities ?? []).some((i) => i.provider === "email"));

/*
 * Configurações → Alterar senha. Confere a senha atual (quando existe) e troca pela nova.
 * Erros de campo vêm com .campo ("atual" | "nova") para a tela marcar o campo certo.
 */
export async function alterarSenha({ email, atual, nova }) {
  const comCampo = (campo, msg) => Object.assign(new Error(msg), { campo });
  if (atual !== null) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: atual });
    if (error) {
      if (/invalid_credentials|Invalid login credentials/i.test(`${error.code} ${error.message}`)) throw comCampo("atual", "Senha atual incorreta.");
      throw traduzirErro(error);
    }
  }
  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) {
    const msg = `${error.code ?? ""} ${error.message ?? ""}`;
    if (/same_password|different from the old/i.test(msg)) throw comCampo("nova", "A nova senha precisa ser diferente da atual.");
    if (/weak_password|Password should/i.test(msg)) throw comCampo("nova", "Senha fraca. Use letras, números e um símbolo.");
    if (/reauthentication|session_not_found|AuthSessionMissing/i.test(msg)) {
      throw new Error("Por segurança, saia e entre de novo na conta antes de trocar a senha.");
    }
    if (/over_request_rate_limit|rate limit/i.test(msg)) throw new Error("Muitas tentativas. Aguarde um pouco e tente de novo.");
    throw new Error("Não foi possível alterar a senha agora. Tente novamente.");
  }
}

export async function sair() {
  await supabase.auth.signOut();
}

export async function excluirConta() {
  const { error } = await supabase.functions.invoke("excluir-conta", { method: "POST" });
  if (error) throw await erroDaFuncao(error, "Não foi possível excluir a conta agora.");
  await supabase.auth.signOut();
}

/* A Edge Function responde { erro: "mensagem" }; usa a mensagem quando existir. */
async function erroDaFuncao(error, padrao) {
  try {
    const corpo = await error.context?.json?.();
    if (corpo?.erro) return new Error(corpo.erro);
  } catch {
    /* sem corpo legível */
  }
  if (/Failed to fetch|NetworkError/i.test(error.message)) return new Error("Sem conexão. Tente novamente.");
  return new Error(padrao);
}

function traduzirErro(error) {
  const msg = `${error.code ?? ""} ${error.message ?? ""}`;
  if (/invalid_credentials|Invalid login credentials/i.test(msg)) return new Error("E-mail ou senha incorretos.");
  if (/email_not_confirmed|Email not confirmed/i.test(msg)) return new Error("Confirme seu e-mail antes de entrar.");
  if (/over_request_rate_limit|rate limit|too many/i.test(msg)) return new Error("Muitas tentativas. Aguarde um pouco e tente de novo.");
  if (/Failed to fetch|NetworkError/i.test(msg)) return new Error("Sem conexão. Tente novamente.");
  return new Error("Não foi possível entrar agora. Tente novamente.");
}
