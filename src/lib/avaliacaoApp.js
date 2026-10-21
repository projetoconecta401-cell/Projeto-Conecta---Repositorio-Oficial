import { mensagemDeErro, supabase } from "./supabase.js";

/*
 * Avaliação do próprio aplicativo: nota, se recomendaria, pontos a melhorar e sugestão.
 * As respostas ficam na tabela avaliacoes_app (cada pessoa só vê as suas).
 */

export const PONTOS_MELHORIA = [
  "Mais vagas na minha região",
  "Mais profissionais disponíveis",
  "Facilidade de uso",
  "Cadastro e login",
  "Chat e mensagens",
  "Notificações",
  "Segurança e confiança",
  "Velocidade do app",
  "Visual do app",
  "Informações das vagas",
  "Avaliações entre usuários",
  "Outro",
];

const CHAVE = "eifreela:avaliouApp";
const CHAVE_DEPOIS = "eifreela:avaliarDepois";
const ler = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sem armazenamento */ } };

export async function enviarAvaliacaoApp({ nota, recomendaria, melhorias, sugestao, modo }) {
  const { error } = await supabase.from("avaliacoes_app").insert({
    nota,
    recomendaria: recomendaria || null,
    melhorias: melhorias ?? [],
    sugestao: sugestao?.trim().slice(0, 1000) || null,
    modo: modo || null,
    versao_app: "2.8",
  });
  if (error) {
    if (error.code === "42501") throw new Error("Você já enviou várias avaliações hoje. Tente amanhã.");
    if (error.code === "42P01" || /avaliacoes_app/.test(error.message ?? "")) throw new Error("A avaliação ainda não está disponível. Tente mais tarde.");
    throw new Error(mensagemDeErro(error, "Não foi possível enviar sua avaliação."));
  }
  gravar(CHAVE, new Date().toISOString());
}

/** Mostrar o convite no mural? Só para quem usa há 1 dia ou mais e ainda não avaliou. */
export function deveConvidar(profile) {
  if (ler(CHAVE)) return false;
  const depois = ler(CHAVE_DEPOIS);
  if (depois && Date.now() - Number(depois) < 7 * 864e5) return false;
  const desde = profile?.criado_em ? new Date(profile.criado_em).getTime() : Date.now();
  return Date.now() - desde >= 864e5;
}

export const adiarConvite = () => gravar(CHAVE_DEPOIS, String(Date.now()));
export const jaAvaliouApp = () => !!ler(CHAVE);
