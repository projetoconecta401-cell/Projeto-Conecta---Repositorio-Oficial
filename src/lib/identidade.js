/*
 * Identificadores anônimos deste navegador (sem login).
 *
 * - autor_id: marca as vagas publicadas aqui como "Você". Fica visível na tabela
 *   de vagas (não é segredo).
 * - chave do chat: identifica as conversas deste navegador. É enviada no cabeçalho
 *   "x-chat-key" e a regra do banco (RLS) só devolve mensagens com essa chave.
 *   Funciona como uma senha anônima: nunca é exibida nem gravada em outra tabela.
 *   Apagar os dados do site no navegador = perder o acesso às conversas.
 */

export const novoId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (c ^ (Math.random() * 16) >> (c / 4)).toString(16)
      );

const emMemoria = {};

function idPersistente(chave) {
  try {
    let id = localStorage.getItem(chave);
    if (!id) {
      id = novoId();
      localStorage.setItem(chave, id);
    }
    return id;
  } catch {
    emMemoria[chave] ||= novoId();
    return emMemoria[chave];
  }
}

export const getAutorId = () => idPersistente("conexaofree:autor_id");
export const getChatKey = () => idPersistente("conexaofree:chat_key");
