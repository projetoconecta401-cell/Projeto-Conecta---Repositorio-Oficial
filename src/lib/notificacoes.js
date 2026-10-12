import { mensagemDeErro, supabase } from "./supabase.js";

/*
 * Notificações (item 5). As linhas são criadas pelo próprio banco:
 *  - nova vaga numa área do seu perfil;
 *  - novo candidato na sua vaga; você foi selecionado; desistência; diária concluída.
 * O app escuta em tempo real e, se o aparelho estiver inscrito, o aviso também
 * chega por Web Push com o app fechado (veja lib/push.js e a função notificar-vaga).
 */

export async function listarNotificacoes() {
  const { data, error } = await supabase
    .from("notificacoes")
    .select("id, titulo, corpo, vaga_id, lida, criado_em")
    .order("criado_em", { ascending: false })
    .limit(60);
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível carregar as notificações."));
  return data;
}

export async function contarNaoLidas() {
  const { count } = await supabase.from("notificacoes").select("id", { count: "exact", head: true }).eq("lida", false);
  return count ?? 0;
}

export async function marcarTodasLidas(userId) {
  await supabase.from("notificacoes").update({ lida: true }).eq("usuario_id", userId).eq("lida", false);
}

export async function marcarLida(id) {
  await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
}
