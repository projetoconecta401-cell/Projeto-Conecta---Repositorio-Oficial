import { mensagemDeErro, supabase } from "./supabase.js";
import { perfisPorId } from "./perfis.js";

/*
 * Segurança: denúncias, bloqueios e alertas anti-golpe.
 * - Denúncia: vai para a tabela "denuncias" (revisão no Supabase). Com 3 denúncias de
 *   pessoas diferentes a conta fica suspensa até a revisão.
 * - Bloqueio: o banco impede mensagens e candidaturas entre as duas pessoas.
 */

export const MOTIVOS = [
  { id: "golpe", label: "Golpe ou pedido de dinheiro" },
  { id: "assedio", label: "Assédio ou ameaça" },
  { id: "vaga_falsa", label: "Vaga falsa ou enganosa" },
  { id: "ofensa", label: "Ofensa ou discriminação" },
  { id: "perfil_falso", label: "Perfil falso" },
  { id: "outro", label: "Outro motivo" },
];

export async function denunciar({ denunciadoId, motivo, detalhes, vagaId = null, conversaId = null }) {
  const { error } = await supabase.from("denuncias").insert({
    denunciado_id: denunciadoId,
    motivo,
    detalhes: detalhes?.trim().slice(0, 1000) || null,
    vaga_id: vagaId,
    conversa_id: conversaId,
  });
  if (error) {
    if (/23505|duplicate/i.test(`${error.code} ${error.message}`)) {
      throw new Error("Você já denunciou esta pessoa. A denúncia está em análise.");
    }
    throw new Error(mensagemDeErro(error, "Não foi possível enviar a denúncia."));
  }
}

// ---------------------------------------------------------------- bloqueios --
let cache = new Set();
const ouvintes = new Set();
const avisar = () => ouvintes.forEach((f) => f(cache));

/** Ids que eu bloqueei (atualiza o cache usado pelas telas). */
export async function carregarBloqueados() {
  const { data, error } = await supabase.from("bloqueios").select("bloqueado_id");
  if (!error) {
    cache = new Set(data.map((b) => b.bloqueado_id));
    avisar();
  }
  return cache;
}

export const bloqueados = () => cache;

export function aoMudarBloqueados(f) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

export async function bloquear(id) {
  const { error } = await supabase.from("bloqueios").insert({ bloqueado_id: id });
  if (error && !/23505|duplicate/i.test(`${error.code} ${error.message}`)) {
    throw new Error(mensagemDeErro(error, "Não foi possível bloquear."));
  }
  cache = new Set(cache).add(id);
  avisar();
}

export async function desbloquear(id) {
  const { error } = await supabase.from("bloqueios").delete().eq("bloqueado_id", id);
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível desbloquear."));
  cache = new Set(cache);
  cache.delete(id);
  avisar();
}

/** Lista de pessoas que eu bloqueei, com nome e foto. */
export async function listarBloqueados() {
  const ids = [...(await carregarBloqueados())];
  const perfis = await perfisPorId(ids);
  return ids.map((id) => perfis[id] ?? { id, nome: "Usuário", avatar_url: null });
}

// --------------------------------------------------------------- anti-golpe --
/* Pedidos típicos de golpe em sites de vagas. */
const GOLPE =
  /\b(pix|chave\s*pix|transfer[eêi]|dep[oó]sit|adiantad|antecipad|taxa\s*(de|do|da)?\s*(cadastro|inscri|reserva|uniforme|material|libera|curso)|pague\s*(antes|primeiro)|pagar\s*(antes|primeiro)|boleto|cart[aã]o\s*de\s*cr[eé]dito|c[oó]digo\s*(de\s*)?(verifica|confirma|seguran|sms|whats)|me\s*(passa|manda|envia)\s*(o\s*)?c[oó]digo|senha|bit\.ly|tinyurl|encurtador)/i;
const LINK = /\bhttps?:\/\/|www\.|\.(com|net|org|xyz|top|site|online|br)\/\S+/i;

/** A mensagem (de outra pessoa) parece golpe? */
export const pareceGolpe = (texto) => !!texto && (GOLPE.test(texto) || LINK.test(texto));

/* Dados que não devem ir pelo chat (o próprio usuário digitando). */
const SENSIVEL = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|\b(?:\d[ -]?){13,19}\b|\bsenha\b|c[oó]digo\s*(de\s*)?(verifica|confirma|seguran|sms)/i;
export const dadoSensivel = (texto) => !!texto && SENSIVEL.test(texto);

/* Texto para "compartilhar minha diária" com alguém de confiança. */
export function textoCompartilharDiaria(job, { souDono, outroNome }) {
  const linhas = [
    souDono ? "Contratei uma diária pelo EiFreela:" : "Vou fazer uma diária pelo EiFreela:",
    `• Serviço: ${job.title}`,
    `• Quando: ${job.date}`,
    `• Região: ${job.neighborhood} – ${job.city}/${job.state}`,
    souDono ? `• Profissional: ${outroNome ?? "—"}` : `• Contratante: ${outroNome ?? job.contractorName}`,
    "Te aviso quando terminar. Se eu não der notícia, me procure.",
  ];
  return linhas.join("\n");
}
