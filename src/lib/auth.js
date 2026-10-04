import { supabase } from "./supabase.js";

/*
 * Contas reais com Supabase Auth (e-mail e senha).
 * - Cadastro: Edge Function "cadastrar" (supabase/functions/cadastrar) cria a conta já
 *   confirmada — o envio de e-mails padrão do Supabase não entrega para usuários comuns.
 * - Login/sair: SDK do Supabase (sessão guardada no navegador, renovada sozinha).
 * - Excluir conta: Edge Function "excluir-conta" (apaga vagas e mensagens junto).
 * Google/Facebook reais exigem chaves OAuth configuradas no painel do Supabase; até lá
 * os botões levam ao cadastro com e-mail e senha.
 */

export const authDisponivel = () => !!supabase;

export async function sessaoAtual() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

/* Avisa a cada login/logout. Retorna a função para parar de ouvir. */
export function aoMudarSessao(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_evento, session) => callback(session ?? null));
  return () => data.subscription.unsubscribe();
}

export async function entrar(email, senha) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
  if (error) throw traduzirErro(error);
}

/* dados: { nome, email, senha, telefone, nascimento, perfil } */
export async function cadastrar(dados) {
  const { error } = await supabase.functions.invoke("cadastrar", { body: dados });
  if (error) throw await erroDaFuncao(error, "Não foi possível criar a conta agora.");
  await entrar(dados.email, dados.senha);
}

export async function sair() {
  if (supabase) await supabase.auth.signOut();
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
