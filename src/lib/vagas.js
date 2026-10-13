import { mensagemDeErro, supabase } from "./supabase.js";
import { PARECE_ENDERECO } from "./validacao.js";

/*
 * Vagas no Supabase (tabela public.vagas). Nada de vagas de exemplo: o mural mostra
 * apenas o que está no banco.
 * Privacidade (item 4): a vaga guarda só bairro, cidade, UF e coordenadas arredondadas
 * (~1 km). O endereço exato é combinado pelo chat, depois da contratação.
 * O WhatsApp opcional fica em "vagas_contato": só o dono e o profissional contratado leem.
 * Ciclo da diária: Disponível → Em Negociação (alguém se candidatou) → Em Atendimento
 * (o dono aceitou um candidato) → check-in → check-out → Concluída (libera avaliações).
 */

const TABELA = "vagas";
const COLUNAS =
  "id, criado_em, titulo, categoria, valor, data, horario, bairro, cidade, uf, status, usuario_id, contratante, detalhes, lat_aprox, lng_aprox, contratado_id, check_in_em, check_out_em";

export const hojeISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/* "R$ 1.200,50" / "180" / "180,5" -> número (ou NaN). */
export function parseValor(texto) {
  const limpo = String(texto ?? "").replace(/[^\d,.]/g, "");
  if (!limpo) return NaN;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  return Number(normalizado);
}

export const reais = (v) =>
  Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

/* Período do dia a partir do horário digitado ("18h às 23h" -> "Noite"). */
export function periodoDoHorario(horario) {
  const m = String(horario ?? "").match(/(\d{1,2})\s*(h|:)/i);
  if (!m) return null;
  const hora = Number(m[1]);
  if (hora < 12) return "Manhã";
  if (hora < 18) return "Tarde";
  return "Noite";
}

/* Valida e normaliza os dados do formulário. Retorna { dados } ou { erro }. */
export function validarFormulario(form) {
  const titulo = form.title?.trim() ?? "";
  const valor = parseValor(form.value);
  const bairro = form.neighborhood?.trim() ?? "";
  const cidade = form.city?.trim() ?? "";
  const whatsapp = form.phone?.trim() || null;
  const detalhes = form.details?.trim() || null;

  if (titulo.length < 3) return { erro: "Informe um título com pelo menos 3 letras." };
  if (titulo.length > 120) return { erro: "O título pode ter no máximo 120 caracteres." };
  if (!Number.isFinite(valor) || valor <= 0) return { erro: "Informe um valor válido em reais (ex.: 180 ou 180,50)." };
  if (valor > 100000) return { erro: "O valor máximo por diária é R$ 100.000." };
  if (!form.dateISO) return { erro: "Escolha a data do serviço." };
  if (form.dateISO < hojeISO()) return { erro: "A data do serviço não pode estar no passado." };
  if (bairro.length < 2) return { erro: "Informe o bairro ou região (sem rua e número)." };
  if (cidade.length < 2) return { erro: "Informe a cidade." };
  if (whatsapp && !/^[0-9()+ .-]{8,20}$/.test(whatsapp)) return { erro: "WhatsApp inválido. Use só números, espaços, ( ) e -." };
  if (detalhes && detalhes.length > 1000) return { erro: "Os detalhes podem ter no máximo 1000 caracteres." };
  if (PARECE_ENDERECO.test(`${bairro} ${detalhes ?? ""}`)) {
    return { erro: "Não coloque o endereço exato na vaga. Informe só o bairro; o endereço é combinado pelo chat." };
  }

  return {
    dados: {
      titulo,
      categoria: form.category,
      valor: Math.round(valor * 100) / 100,
      data: form.dateISO,
      horario: form.timeLabel?.trim() || null,
      bairro,
      cidade,
      uf: form.state,
      detalhes,
    },
    whatsapp,
  };
}

/* Situação da MINHA candidatura nessa vaga (visão do profissional). */
function statusDaCandidatura(row, userId, candidatou) {
  if (!userId) return null;
  if (row.contratado_id === userId) {
    if (row.status === "Concluída" || row.check_out_em) return "Finalizada";
    if (row.check_in_em) return "Em andamento";
    return "Diária agendada";
  }
  if (!candidatou) return null;
  if (row.contratado_id || row.status === "Concluída") return "Não selecionado";
  return "Em análise";
}

/* Linha do banco -> objeto de vaga no formato usado pelas telas. */
export function vagaParaJob(row, userId = null, extras = {}) {
  const dataLabel = row.data ? new Date(row.data + "T00:00:00").toLocaleDateString("pt-BR") : "A combinar";
  const isOwner = !!userId && row.usuario_id === userId;
  const isHired = !!userId && row.contratado_id === userId;
  const candidaturaId = extras.candidaturaId ?? null;
  return {
    id: row.id,
    title: row.titulo,
    category: row.categoria,
    value: Number(row.valor),
    date: row.horario ? `${dataLabel} · ${row.horario}` : dataLabel,
    dateLabel: dataLabel,
    timeLabel: row.horario || "Horário a combinar",
    dateISO: row.data,
    period: periodoDoHorario(row.horario),
    neighborhood: row.bairro,
    city: row.cidade,
    state: row.uf,
    lat: row.lat_aprox != null ? Number(row.lat_aprox) : null,
    lng: row.lng_aprox != null ? Number(row.lng_aprox) : null,
    status: row.status || "Disponível",
    ownerId: row.usuario_id,
    contractor: isOwner ? "Você" : row.contratante || "Contratante",
    contractorName: row.contratante || "Contratante",
    details: row.detalhes || "",
    contratadoId: row.contratado_id,
    checkInAt: row.check_in_em,
    checkOutAt: row.check_out_em,
    isOwner,
    isHired,
    candidaturaId, // conversa que abri ao me candidatar
    candidatos: extras.candidatos ?? [], // só para o dono: [{ conversaId, freelancerId }]
    candidatesCount: (extras.candidatos ?? []).length,
    applicationStatus: statusDaCandidatura(row, userId, !!candidaturaId),
    createdAt: row.criado_em,
  };
}

/** Carrega o mural + tudo o que envolve a conta (vagas minhas, contratações e candidaturas). */
export async function listarVagas(userId = null) {
  const recentes = supabase.from(TABELA).select(COLUNAS).order("criado_em", { ascending: false }).limit(200);
  const minhas = userId
    ? supabase.from(TABELA).select(COLUNAS).or(`usuario_id.eq.${userId},contratado_id.eq.${userId}`).limit(200)
    : Promise.resolve({ data: [] });
  const conversas = userId
    ? supabase.from("conversas").select("id, vaga_id, contratante_id, freelancer_id").not("vaga_id", "is", null).limit(500)
    : Promise.resolve({ data: [] });

  const [r1, r2, r3] = await Promise.all([recentes, minhas, conversas]);
  if (r1.error) throw new Error(mensagemDeErro(r1.error, "Não foi possível carregar as vagas."));

  const porId = new Map();
  for (const row of [...(r1.data ?? []), ...(r2.data ?? [])]) porId.set(row.id, row);

  const minhasCandidaturas = new Map(); // vagaId -> conversaId
  const candidatosPorVaga = new Map(); // vagaId -> [{ conversaId, freelancerId }]
  for (const c of r3.data ?? []) {
    if (c.freelancer_id === userId) minhasCandidaturas.set(c.vaga_id, c.id);
    if (c.contratante_id === userId) {
      const lista = candidatosPorVaga.get(c.vaga_id) ?? [];
      lista.push({ conversaId: c.id, freelancerId: c.freelancer_id });
      candidatosPorVaga.set(c.vaga_id, lista);
    }
  }

  // Vagas em que me candidatei mas que não vieram nas consultas acima.
  const faltando = [...minhasCandidaturas.keys()].filter((id) => !porId.has(id));
  if (faltando.length) {
    const { data } = await supabase.from(TABELA).select(COLUNAS).in("id", faltando);
    for (const row of data ?? []) porId.set(row.id, row);
  }

  return [...porId.values()]
    .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
    .map((row) =>
      vagaParaJob(row, userId, {
        candidaturaId: minhasCandidaturas.get(row.id),
        candidatos: candidatosPorVaga.get(row.id),
      })
    );
}

/* Publica a vaga. contratante: nome do perfil; posicao: { lat, lng } já arredondados (opcional). */
export async function publicarVaga(form, userId, { contratante, posicao } = {}) {
  const { dados, whatsapp, erro } = validarFormulario(form);
  if (erro) throw new Error(erro);
  const { data, error } = await supabase
    .from(TABELA)
    .insert({
      ...dados,
      usuario_id: userId,
      contratante: contratante?.slice(0, 80) || null,
      lat_aprox: posicao?.lat ?? null,
      lng_aprox: posicao?.lng ?? null,
    })
    .select(COLUNAS)
    .single();
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível publicar a vaga."));
  if (whatsapp) await supabase.from("vagas_contato").insert({ vaga_id: data.id, whatsapp }).then(() => {}, () => {});
  return vagaParaJob(data, userId);
}

/** WhatsApp da vaga: o banco só entrega ao dono e ao profissional contratado. */
export async function contatoDaVaga(vagaId) {
  const { data, error } = await supabase.from("vagas_contato").select("whatsapp").eq("vaga_id", vagaId).maybeSingle();
  return error ? null : data?.whatsapp ?? null;
}

export async function excluirVaga(id) {
  const { data, error } = await supabase.from(TABELA).delete().eq("id", id).select("id");
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível excluir a vaga."));
  if (!data?.length) throw new Error("Só quem publicou a vaga pode excluí-la.");
}

async function atualizarVaga(id, campos, padrao) {
  const { error } = await supabase.from(TABELA).update(campos).eq("id", id);
  if (error) throw new Error(mensagemDeErro(error, padrao));
}

/** Dono aceita um candidato: a vaga sai do mural ("Em Atendimento"). */
export const aceitarCandidato = (vagaId, freelancerId) =>
  atualizarVaga(vagaId, { contratado_id: freelancerId, status: "Em Atendimento" }, "Não foi possível aceitar o candidato.");

/** Dono cancela a contratação: a vaga volta ao mural. */
export const cancelarContratacao = (vagaId) =>
  atualizarVaga(vagaId, { contratado_id: null, status: "Disponível" }, "Não foi possível cancelar.");

/** Dono marca a diária como concluída (libera as avaliações). */
export const concluirVaga = (vagaId) => atualizarVaga(vagaId, { status: "Concluída" }, "Não foi possível concluir.");

/** Profissional contratado desiste da diária. */
export async function desistirDaVaga(vagaId, motivo) {
  const { error } = await supabase.rpc("desistir_da_vaga", { p_vaga: vagaId, p_motivo: motivo || null });
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível cancelar."));
}

/** Check-in ("entrada") e check-out ("saida") do profissional contratado. */
export async function registrarPresenca(vagaId, tipo) {
  const { error } = await supabase.rpc("registrar_presenca", { p_vaga: vagaId, p_tipo: tipo });
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível registrar."));
}
