import { supabase } from "./supabase.js";
import { getChatKey, novoId } from "./identidade.js";

/*
 * Mensagens do chat no Supabase (tabela public.mensagens — veja supabase/migrations/).
 * Cada navegador só lê e grava as próprias mensagens (chave anônima no cabeçalho
 * x-chat-key; regra no banco). Só texto é salvo: áudios continuam apenas na tela.
 */

const TABELA = "mensagens";

const limparId = (id) => String(id).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);

/* Identificador da conversa no banco. */
export const conversaDaVaga = (jobId) => `vaga:${limparId(jobId)}`;
export const conversaDireta = (conversationId) => `direto:${limparId(conversationId)}`;

/* Linha do banco -> mensagem no formato das telas ({ id, from, text }). */
const paraMensagem = (row) => ({ id: row.id, from: row.remetente, text: row.texto, createdAt: row.criado_em });

/* Cria a mensagem com id já definido, para a tela mostrar na hora e o mesmo id
   ser usado no banco (sem duplicar ao recarregar o histórico). */
export function novaMensagem(texto) {
  return { id: novoId(), from: "me", text: texto };
}

/* Histórico de uma conversa (mais antigas primeiro). */
export async function listarMensagens(conversa) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABELA)
    .select("id, criado_em, remetente, texto")
    .eq("conversa", conversa)
    .order("criado_em", { ascending: true })
    .limit(500);
  if (error) throw traduzirErro(error);
  return data.map(paraMensagem);
}

/* Todas as conversas diretas deste navegador: { "prof-1": [mensagens], ... }. */
export async function listarConversasDiretas() {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from(TABELA)
    .select("id, criado_em, conversa, remetente, texto")
    .like("conversa", "direto:%")
    .order("criado_em", { ascending: true })
    .limit(1000);
  if (error) throw traduzirErro(error);
  const porConversa = {};
  for (const row of data) {
    const id = row.conversa.slice("direto:".length);
    (porConversa[id] ||= []).push(paraMensagem(row));
  }
  return porConversa;
}

/* Salva uma mensagem de texto criada com novaMensagem(). */
export async function salvarMensagem(conversa, mensagem) {
  if (!supabase) return;
  const { error } = await supabase.from(TABELA).insert({
    id: mensagem.id,
    chave: getChatKey(),
    conversa,
    remetente: "me",
    texto: mensagem.text,
  });
  if (error) throw traduzirErro(error);
}

/* Junta o histórico salvo com as mensagens já na tela, sem repetir ids. */
export function mesclarMensagens(atuais, salvas) {
  const ids = new Set(atuais.map((m) => m.id).filter(Boolean));
  return [...atuais, ...salvas.filter((m) => !ids.has(m.id))];
}

function traduzirErro(error) {
  console.error("Supabase (mensagens):", error);
  const msg = `${error.code ?? ""} ${error.message ?? ""}`;
  if (/PGRST205|42P01|Could not find the table/i.test(msg))
    return new Error("O chat ainda não está configurado no banco.");
  if (/23514|check constraint/i.test(msg)) return new Error("Mensagem vazia ou longa demais (máx. 2000 caracteres).");
  if (/Failed to fetch|NetworkError/i.test(msg)) return new Error("Sem conexão. A mensagem não foi salva.");
  return new Error("Não foi possível salvar a mensagem.");
}
