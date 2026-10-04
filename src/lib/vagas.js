import { supabase } from "./supabase.js";

/*
 * Vagas no Supabase (tabela public.vagas — veja supabase/migrations/).
 * Todos leem; publicar exige conta (usuario_id = conta logada); só o dono exclui.
 * Mudanças de status (candidatura, aceite, check-in…) continuam só em memória
 * neste protótipo.
 */

const TABELA = "vagas";

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
export function vagaParaJob(row, userId = null) {
  const valor = Number(row.valor);
  const dataLabel = row.data ? new Date(row.data + "T00:00:00").toLocaleDateString("pt-BR") : "A combinar";
  const minha = !!userId && row.usuario_id === userId;
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

/* Lista as vagas mais recentes. userId: conta logada (marca as vagas dela como "Você"). */
export async function listarVagas(userId = null) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABELA)
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(100);
  if (error) throw traduzirErro(error);
  return data.map((row) => vagaParaJob(row, userId));
}

/* Publica uma vaga a partir dos dados do formulário (o banco grava usuario_id = conta logada). */
export async function publicarVaga(form, userId) {
  if (!supabase) throw new Error("Supabase não configurado. Confira o arquivo .env.");
  const { dados, erro } = validarFormulario(form);
  if (erro) throw new Error(erro);
  const { data, error } = await supabase.from(TABELA).insert(dados).select().single();
  if (error) throw traduzirErro(error);
  return vagaParaJob(data, userId);
}

/* Exclui uma vaga da própria conta (regra no banco: só o dono). */
export async function excluirVaga(id) {
  if (!supabase) return;
  const { data, error } = await supabase.from(TABELA).delete().eq("id", id).select("id");
  if (error) throw traduzirErro(error);
  if (!data?.length) throw new Error("Só quem publicou a vaga pode excluí-la.");
}

function traduzirErro(error) {
  console.error("Supabase:", error);
  const msg = `${error.code ?? ""} ${error.message ?? ""}`;
  if (/PGRST205|42P01|does not exist|Could not find the table/i.test(msg))
    return new Error("A tabela de vagas ainda não foi criada no Supabase.");
  if (/42501|row-level security|permission denied/i.test(msg))
    return new Error("O banco recusou a vaga. Entre na sua conta e confira se a data não está no passado.");
  if (/23514|check constraint/i.test(msg))
    return new Error("Algum campo está fora do formato aceito. Revise os dados da vaga.");
  if (/Failed to fetch|NetworkError|fetch/i.test(msg))
    return new Error("Sem conexão com o servidor. Verifique sua internet e tente de novo.");
  return new Error("Não foi possível salvar agora. Tente novamente em instantes.");
}
