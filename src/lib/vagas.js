import { supabase } from "./supabase.js";

/*
 * Vagas no Supabase (tabela public.vagas — veja supabase/migrations/).
 * Sem login: qualquer pessoa lê e publica. Alterar/excluir vagas pela API não é
 * permitido; mudanças de status (candidatura, aceite, check-in…) continuam só
 * em memória neste protótipo.
 */

const TABELA = "vagas";
const AUTOR_KEY = "conexaofree:autor_id";

const novoId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (c ^ (Math.random() * 16) >> (c / 4)).toString(16)
      );

let autorIdEmMemoria = null;

/* Identificador anônimo deste navegador (não é login nem segredo): marca as vagas
   publicadas aqui como "Você", para aparecerem em "Minhas Vagas Criadas". */
export function getAutorId() {
  try {
    let id = localStorage.getItem(AUTOR_KEY);
    if (!id) {
      id = novoId();
      localStorage.setItem(AUTOR_KEY, id);
    }
    return id;
  } catch {
    autorIdEmMemoria ||= novoId();
    return autorIdEmMemoria;
  }
}

/* "R$ 1.200,50" / "180" / "180,5" -> número (ou NaN). */
export function parseValor(texto) {
  const limpo = String(texto ?? "").replace(/[^\d,.]/g, "");
  if (!limpo) return NaN;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  return Number(normalizado);
}


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
  const contratante = form.contractor?.trim() || null;
  const detalhes = form.details?.trim() || null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (titulo.length < 3) return { erro: "Informe um título com pelo menos 3 letras." };
  if (titulo.length > 120) return { erro: "O título pode ter no máximo 120 caracteres." };
  if (!Number.isFinite(valor) || valor <= 0) return { erro: "Informe um valor válido em reais (ex.: 180 ou 180,50)." };
  if (valor > 100000) return { erro: "O valor máximo por diária é R$ 100.000." };
  if (!form.dateISO) return { erro: "Escolha a data do serviço." };
  if (new Date(form.dateISO + "T00:00:00") < hoje) return { erro: "A data do serviço não pode estar no passado." };
  if (bairro.length < 2) return { erro: "Informe o bairro ou região." };
  if (cidade.length < 2) return { erro: "Informe a cidade." };
  if (whatsapp && !/^[0-9()+ .-]{8,20}$/.test(whatsapp)) return { erro: "WhatsApp inválido. Use só números, espaços, ( ) e -." };
  if (contratante && (contratante.length < 2 || contratante.length > 80)) return { erro: "O nome do contratante deve ter de 2 a 80 caracteres." };
  if (detalhes && detalhes.length > 1000) return { erro: "Os detalhes podem ter no máximo 1000 caracteres." };

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
      whatsapp,
      contratante,
      detalhes,
    },
  };
}

/* Linha do banco -> objeto de vaga no formato usado pelas telas. */
export function vagaParaJob(row, autorId = getAutorId()) {
  const valor = Number(row.valor);
  const dataLabel = row.data ? new Date(row.data + "T00:00:00").toLocaleDateString("pt-BR") : "A combinar";
  const minha = row.autor_id && row.autor_id === autorId;
  return {
    id: row.id,
    title: row.titulo,
    category: row.categoria,
    value: valor, // número: o filtro "valor mínimo" compara numericamente
    date: row.horario ? `${dataLabel} · ${row.horario}` : dataLabel,
    dateISO: row.data,
    period: periodoDoHorario(row.horario),
    neighborhood: row.bairro,
    address: `${row.bairro} (endereço a confirmar)`,
    city: row.cidade,
    state: row.uf,
    verified: false,
    status: row.status || "Disponível",
    contractor: minha ? "Você" : row.contratante || "Contratante",
    contractorPhone: row.whatsapp || null,
    details: row.detalhes || "",
    candidate: null,
    urgent: false,
    experience: "Experiência a combinar",
    candidatesCount: 0,
    createdAt: row.criado_em,
    source: "supabase",
  };
}

/* Lista as vagas mais recentes. */
export async function listarVagas() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABELA)
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(100);
  if (error) throw traduzirErro(error);
  const autorId = getAutorId();
  return data.map((row) => vagaParaJob(row, autorId));
}

/* Publica uma vaga a partir dos dados do formulário. */
export async function publicarVaga(form) {
  if (!supabase) throw new Error("Supabase não configurado. Confira o arquivo .env.");
  const { dados, erro } = validarFormulario(form);
  if (erro) throw new Error(erro);
  const autorId = getAutorId();
  const { data, error } = await supabase
    .from(TABELA)
    .insert({ ...dados, autor_id: autorId })
    .select()
    .single();
  if (error) throw traduzirErro(error);
  return vagaParaJob(data, autorId);
}

function traduzirErro(error) {
  console.error("Supabase:", error);
  const msg = `${error.code ?? ""} ${error.message ?? ""}`;
  if (/PGRST205|42P01|does not exist|Could not find the table/i.test(msg))
    return new Error("A tabela de vagas ainda não foi criada no Supabase.");
  if (/42501|row-level security|permission denied/i.test(msg))
    return new Error("O banco recusou a vaga. Confira se a data não está no passado.");
  if (/23514|check constraint/i.test(msg))
    return new Error("Algum campo está fora do formato aceito. Revise os dados da vaga.");
  if (/Failed to fetch|NetworkError|fetch/i.test(msg))
    return new Error("Sem conexão com o servidor. Verifique sua internet e tente de novo.");
  return new Error("Não foi possível salvar agora. Tente novamente em instantes.");
}
