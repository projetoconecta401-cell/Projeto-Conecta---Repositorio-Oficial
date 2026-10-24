import { mensagemDeErro, supabase } from "./supabase.js";
import { novoId } from "./identidade.js";

/*
 * Mural de serviços e disponibilidades (tabela public.disponibilidades).
 * - O profissional publica, edita, pausa, conclui e exclui as próprias publicações.
 * - Só contratantes válidos veem o mural (regra no banco: sou_contratante()).
 * - Publicações vencidas viram "expirada" sozinhas (gatilho + faxina diária) e nunca
 *   aparecem no mural, mesmo antes da faxina.
 * - Fotos ficam no bucket privado "portfolio" e são abertas com links temporários.
 * Preparado para o futuro: favoritos, propostas e destaque pago usam o id da publicação
 * (a coluna "destaque" já existe, mas só o administrador pode alterá-la).
 */

const COLS =
  "id, criado_em, atualizado_em, usuario_id, titulo, categoria, descricao, data_inicio, data_fim, dias_semana, horario_inicio, horario_fim, modalidades, cidade, uf, preco_tipo, preco, fotos, status, destaque";

export const DIAS = [
  { v: 1, curto: "Seg", nome: "segunda" },
  { v: 2, curto: "Ter", nome: "terça" },
  { v: 3, curto: "Qua", nome: "quarta" },
  { v: 4, curto: "Qui", nome: "quinta" },
  { v: 5, curto: "Sex", nome: "sexta" },
  { v: 6, curto: "Sáb", nome: "sábado" },
  { v: 0, curto: "Dom", nome: "domingo" },
];
export const MODALIDADES = [
  { v: "presencial", t: "Presencial" },
  { v: "domicilio", t: "A domicílio" },
  { v: "remoto", t: "Remoto" },
  { v: "outro", t: "Outra" },
];
export const PRECOS = [
  { v: "combinar", t: "A combinar" },
  { v: "fixo", t: "Preço fixo" },
  { v: "hora", t: "Por hora" },
  { v: "diaria", t: "Por diária" },
];
export const PERIODOS = [
  { v: "manha", t: "Manhã", de: "06:00", ate: "12:00" },
  { v: "tarde", t: "Tarde", de: "12:00", ate: "18:00" },
  { v: "noite", t: "Noite", de: "18:00", ate: "23:59" },
];
export const STATUS = {
  ativa: { t: "Ativa", tom: "green" },
  pausada: { t: "Pausada", tom: "orange" },
  expirada: { t: "Expirada", tom: "slate" },
  concluida: { t: "Concluída", tom: "slate" },
};

const reais = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "");
const hora = (t) => (t ? t.slice(0, 5).replace(":00", "h").replace(":", "h") : "");
export const hojeISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const textoPreco = (d) =>
  d.preco_tipo === "combinar" || d.preco == null
    ? "A combinar"
    : `${reais(d.preco)}${{ hora: "/hora", diaria: "/diária", fixo: "" }[d.preco_tipo] ?? ""}`;

export function textoDias(dias = []) {
  if (!dias.length) return "Todos os dias";
  const ord = DIAS.filter((x) => dias.includes(x.v));
  if (ord.length === 5 && ord.every((x) => x.v >= 1 && x.v <= 5)) return "Segunda a sexta";
  if (ord.length === 7) return "Todos os dias";
  return ord.map((x) => x.curto).join(", ");
}
export const textoHorario = (d) =>
  d.horario_inicio && d.horario_fim ? `${hora(d.horario_inicio)} às ${hora(d.horario_fim)}` : d.horario_inicio ? `A partir das ${hora(d.horario_inicio)}` : "Horário a combinar";
export const textoPeriodo = (d) =>
  d.data_fim ? (d.data_fim === d.data_inicio ? `Dia ${dataBR(d.data_inicio)}` : `${dataBR(d.data_inicio)} a ${dataBR(d.data_fim)}`) : d.data_inicio > hojeISO() ? `A partir de ${dataBR(d.data_inicio)}` : "Disponível agora";
export const textoModalidades = (m = []) => m.map((x) => MODALIDADES.find((o) => o.v === x)?.t).filter(Boolean).join(" · ");

/** Situação real (para o dono): mostra "Expirada" mesmo antes da faxina do banco. */
export const statusReal = (d) => (d.status === "ativa" && d.data_fim && d.data_fim < hojeISO() ? "expirada" : d.status);

/* ------------------------------------------------------------ fotos --- */
async function comLinks(lista) {
  const caminhos = [...new Set(lista.flatMap((d) => d.fotos ?? []))];
  if (!caminhos.length) return lista.map((d) => ({ ...d, fotosUrl: [] }));
  const { data } = await supabase.storage.from("portfolio").createSignedUrls(caminhos, 3600);
  const links = Object.fromEntries((data ?? []).filter((x) => x.signedUrl).map((x) => [x.path, x.signedUrl]));
  return lista.map((d) => ({ ...d, fotosUrl: (d.fotos ?? []).map((c) => links[c]).filter(Boolean) }));
}

export async function enviarFoto(usuarioId, blob) {
  const caminho = `${usuarioId}/${novoId()}.jpg`;
  const { error } = await supabase.storage.from("portfolio").upload(caminho, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error("Não foi possível enviar a foto.");
  return caminho;
}

export async function apagarFotos(caminhos) {
  if (caminhos?.length) await supabase.storage.from("portfolio").remove(caminhos).catch(() => {});
}

/* ------------------------------------------------------------ leitura --- */
/** Minhas publicações (todas as situações). */
export async function minhasDisponibilidades(usuarioId) {
  const { data, error } = await supabase.from("disponibilidades").select(COLS).eq("usuario_id", usuarioId).order("criado_em", { ascending: false }).limit(50);
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível carregar suas publicações."));
  return comLinks(data);
}

/*
 * Mural (contratantes). Os filtros são aplicados no banco:
 * { termo, categoria, cidade, uf, data, dias:[0-6], periodo, modalidade, precoMin, precoMax }
 */
export async function buscarMural(f = {}, meuId) {
  // Condições "ou" vão todas juntas num único and(...) — o PostgREST combina assim.
  const ou = [`or(data_fim.is.null,data_fim.gte.${hojeISO()})`];
  let q = supabase.from("disponibilidades").select(COLS).eq("status", "ativa");
  if (meuId) q = q.neq("usuario_id", meuId);
  if (f.categoria) q = q.eq("categoria", f.categoria);
  if (f.uf) q = q.eq("uf", f.uf);
  if (f.cidade?.trim()) q = q.ilike("cidade", `%${f.cidade.trim().replace(/[%_,()]/g, "")}%`);
  if (f.modalidade) q = q.contains("modalidades", [f.modalidade]);
  if (f.dias?.length) ou.push(`or(dias_semana.ov.{${f.dias.join(",")}},dias_semana.eq.{})`);
  if (f.data) {
    const dia = new Date(`${f.data}T12:00:00`).getDay();
    q = q.lte("data_inicio", f.data);
    ou.push(`or(data_fim.is.null,data_fim.gte.${f.data})`, `or(dias_semana.cs.{${dia}},dias_semana.eq.{})`);
  }
  const periodo = PERIODOS.find((p) => p.v === f.periodo);
  if (periodo) ou.push(`or(horario_inicio.is.null,horario_inicio.lt.${periodo.ate})`, `or(horario_fim.is.null,horario_fim.gt.${periodo.de})`);
  if (f.precoMin) q = q.gte("preco", Number(f.precoMin));
  if (f.precoMax) q = q.lte("preco", Number(f.precoMax));
  const termo = f.termo?.trim().replace(/[%_,()*.:"\\]/g, " ").replace(/\s+/g, " ").trim();
  if (termo) ou.push(`or(titulo.ilike.*${termo}*,descricao.ilike.*${termo}*,categoria.ilike.*${termo}*)`);
  q = q.or(`and(${ou.join(",")})`);
  const { data, error } = await q.order("destaque", { ascending: false }).order("criado_em", { ascending: false }).limit(60);
  if (error) {
    if (/42501|permission denied/i.test(`${error.code} ${error.message}`)) throw new Error("O mural é exclusivo para contratantes cadastrados.");
    throw new Error(mensagemDeErro(error, "Não foi possível carregar o mural."));
  }
  return comLinks(data);
}

export async function disponibilidadePorId(id) {
  const { data, error } = await supabase.from("disponibilidades").select(COLS).eq("id", id).maybeSingle();
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível abrir a publicação."));
  if (!data) return null;
  return (await comLinks([data]))[0];
}

/* ------------------------------------------------------------ escrita --- */
export function validarDisponibilidade(f) {
  const er = {};
  if (f.titulo.trim().length < 3) er.titulo = "Escreva um título (ex.: Faço faxinas durante a semana).";
  if (f.titulo.trim().length > 100) er.titulo = "Use no máximo 100 caracteres.";
  if (!f.categoria) er.categoria = "Escolha a categoria.";
  if (f.descricao.length > 1000) er.descricao = "Use no máximo 1000 caracteres.";
  if (!f.dataInicio) er.dataInicio = "Informe a partir de quando você está disponível.";
  if (f.dataFim && f.dataFim < f.dataInicio) er.dataFim = "O término precisa ser depois do início.";
  if (f.dataFim && f.dataFim < hojeISO()) er.dataFim = "O término já passou.";
  if (f.horarioInicio && f.horarioFim && f.horarioFim <= f.horarioInicio) er.horarioFim = "O horário final precisa ser depois do inicial.";
  if (f.cidade.trim().length < 2) er.cidade = "Informe a cidade.";
  if (!/^[A-Z]{2}$/.test(f.uf)) er.uf = "Escolha o estado.";
  if (f.precoTipo !== "combinar") {
    const v = Number(String(f.preco).replace(/\./g, "").replace(",", "."));
    if (!(v > 0 && v <= 100000)) er.preco = "Informe um valor válido ou escolha \"A combinar\".";
  }
  return er;
}

const paraBanco = (f, fotos) => ({
  titulo: f.titulo.trim(),
  categoria: f.categoria,
  descricao: f.descricao.trim() || null,
  data_inicio: f.dataInicio,
  data_fim: f.dataFim || null,
  dias_semana: f.dias,
  horario_inicio: f.horarioInicio || null,
  horario_fim: f.horarioFim || null,
  modalidades: f.modalidades,
  cidade: f.cidade.trim(),
  uf: f.uf,
  preco_tipo: f.precoTipo,
  preco: f.precoTipo === "combinar" ? null : Number(String(f.preco).replace(/\./g, "").replace(",", ".")),
  fotos,
});

export async function salvarDisponibilidade({ id, form, fotos }) {
  const dados = paraBanco(form, fotos);
  const r = id
    ? await supabase.from("disponibilidades").update(dados).eq("id", id).select("id").maybeSingle()
    : await supabase.from("disponibilidades").insert(dados).select("id").single();
  if (r.error) {
    if (/disponibilidades|42P01|PGRST205/.test(`${r.error.code} ${r.error.message}`) && /does not exist|PGRST205|42P01/.test(`${r.error.code} ${r.error.message}`)) {
      throw new Error("O mural de serviços ainda não foi ativado no banco. Avise o administrador.");
    }
    throw new Error(mensagemDeErro(r.error, "Não foi possível salvar a publicação."));
  }
  if (id && !r.data) throw new Error("Você só pode editar as suas publicações.");
  return r.data.id;
}

export async function mudarStatus(id, status) {
  const { data, error } = await supabase.from("disponibilidades").update({ status }).eq("id", id).select("id").maybeSingle();
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível atualizar a publicação."));
  if (!data) throw new Error("Você só pode alterar as suas publicações.");
}

export async function excluirDisponibilidade(d) {
  const { error } = await supabase.from("disponibilidades").delete().eq("id", d.id);
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível excluir a publicação."));
  await apagarFotos(d.fotos);
}

/** "Tenho interesse": abre (ou reaproveita) a conversa direta e envia uma primeira mensagem. */
export async function demonstrarInteresse(meuId, d) {
  const { abrirConversaDireta, enviarTexto } = await import("./conversas.js");
  const conversaId = await abrirConversaDireta(meuId, d.usuario_id);
  await enviarTexto(conversaId, `Olá! Vi sua publicação "${d.titulo}" no EiFreela e tenho interesse. Podemos conversar?`).catch(() => {});
  return conversaId;
}
