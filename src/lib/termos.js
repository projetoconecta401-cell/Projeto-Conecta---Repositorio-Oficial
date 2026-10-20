import { mensagemDeErro, supabase } from "./supabase.js";
import { VERSAO_TERMO } from "../data/termoLgpd.js";

/*
 * Aceite do Termo de Consentimento (LGPD). O banco guarda a versão aceita e a data no
 * perfil e mantém um histórico de aceites (tabela aceites_termos) como comprovante.
 */

const CHAVE_PENDENTE = "eifreela:aceite-pendente";

/** O perfil já aceitou a versão atual? (antes do banco ser atualizado, não bloqueia). */
export const precisaAceitarTermo = (perfil) =>
  !!perfil && Object.prototype.hasOwnProperty.call(perfil, "termos_versao") && perfil.termos_versao !== VERSAO_TERMO;

export async function aceitarTermo() {
  const { error } = await supabase.rpc("aceitar_termos", {
    p_versao: VERSAO_TERMO,
    p_origem: navigator.userAgent?.slice(0, 300) ?? null,
  });
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível registrar o aceite."));
  limparAceitePendente();
}

/* No cadastro a pessoa marca o aceite antes de a conta existir; o registro é feito no 1º acesso. */
const valorPendente = (email) => `${VERSAO_TERMO}|${String(email ?? "").trim().toLowerCase()}`;
export function marcarAceitePendente(email) {
  try {
    sessionStorage.setItem(CHAVE_PENDENTE, valorPendente(email));
  } catch {
    /* sem armazenamento */
  }
}
export function temAceitePendente(email) {
  try {
    return sessionStorage.getItem(CHAVE_PENDENTE) === valorPendente(email);
  } catch {
    return false;
  }
}
function limparAceitePendente() {
  try {
    sessionStorage.removeItem(CHAVE_PENDENTE);
  } catch {
    /* sem armazenamento */
  }
}
