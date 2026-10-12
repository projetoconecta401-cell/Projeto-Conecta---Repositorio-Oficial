import { mensagemDeErro, supabase } from "./supabase.js";

/*
 * Avaliações (item 6): nota de 1 a 5, critérios, "trabalharia novamente" e comentário.
 * Regra no banco: só avaliam entre si o dono da vaga e o profissional contratado,
 * depois que a diária é concluída — uma avaliação por pessoa por vaga.
 */

export async function avaliar({ vagaId, avaliadoId, nota, criterios, trabalhariaNovamente, comentario }) {
  const { error } = await supabase.from("avaliacoes").insert({
    vaga_id: vagaId,
    avaliado_id: avaliadoId,
    nota,
    criterios: criterios ?? null,
    trabalharia_novamente: trabalhariaNovamente ?? null,
    comentario: comentario?.trim() || null,
  });
  if (error) {
    if (error.code === "23505") throw new Error("Você já avaliou essa pessoa nesta diária.");
    throw new Error(mensagemDeErro(error, "Não foi possível enviar a avaliação."));
  }
}

/** Ids das vagas em que eu já avaliei a outra parte. */
export async function vagasJaAvaliadas(userId) {
  const { data } = await supabase.from("avaliacoes").select("vaga_id").eq("avaliador_id", userId).limit(500);
  return new Set((data ?? []).map((a) => a.vaga_id));
}

/** Avaliações que recebi, por vaga: { [vagaId]: { nota, comentario } }. */
export async function avaliacoesRecebidas(userId) {
  const { data } = await supabase
    .from("avaliacoes")
    .select("vaga_id, nota, comentario, criado_em")
    .eq("avaliado_id", userId)
    .limit(500);
  return Object.fromEntries((data ?? []).map((a) => [a.vaga_id, a]));
}
