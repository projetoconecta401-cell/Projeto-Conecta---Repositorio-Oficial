/*
 * Mini currículo do profissional: sobre mim, formação, experiências e cursos.
 * Tudo opcional e visível para quem está logado (contratantes veem antes de aceitar).
 */

export const ESCOLARIDADES = [
  "Ensino fundamental",
  "Ensino médio",
  "Curso técnico",
  "Graduação",
  "Pós-graduação",
];

export const SITUACOES = ["Cursando", "Concluído", "Incompleto"];

/* Níveis em que faz sentido informar o nome do curso. */
export const temCurso = (escolaridade) => ["Curso técnico", "Graduação", "Pós-graduação"].includes(escolaridade);

export const LIMITES = { sobre: 400, experiencias: 5, cursos: 8 };

export const curriculoVazio = () => ({
  sobre: "",
  formacao: { escolaridade: "", curso: "", instituicao: "", situacao: "", periodo: "" },
  experiencias: [],
  cursos: [],
});

export const experienciaVazia = () => ({ funcao: "", local: "", periodo: "", descricao: "" });

const txt = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/** Lê o que veio do banco (ou de um perfil antigo sem currículo). */
export function lerCurriculo(p) {
  const base = curriculoVazio();
  if (!p) return base;
  const f = p.formacao && typeof p.formacao === "object" ? p.formacao : {};
  return {
    sobre: p.sobre ?? "",
    formacao: { ...base.formacao, ...f },
    experiencias: Array.isArray(p.experiencias) ? p.experiencias.map((e) => ({ ...experienciaVazia(), ...e })) : [],
    cursos: Array.isArray(p.cursos) ? p.cursos.filter((c) => typeof c === "string") : [],
  };
}

/* Dados que não devem ir para o perfil público. */
const SENSIVEL = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}|@[\w-]+\.\w|\b(rua|avenida|av\.|travessa)\s/i;

/** Limpa e valida. Retorna { dados, erros }. */
export function prepararCurriculo(c) {
  const erros = {};
  const sobre = String(c.sobre ?? "").trim().slice(0, LIMITES.sobre);
  const formacao = {
    escolaridade: ESCOLARIDADES.includes(c.formacao?.escolaridade) ? c.formacao.escolaridade : "",
    curso: temCurso(c.formacao?.escolaridade) ? txt(c.formacao?.curso, 80) : "",
    instituicao: txt(c.formacao?.instituicao, 80),
    situacao: SITUACOES.includes(c.formacao?.situacao) ? c.formacao.situacao : "",
    periodo: c.formacao?.situacao === "Cursando" ? txt(c.formacao?.periodo, 60) : "",
  };
  const experiencias = (c.experiencias ?? [])
    .map((e) => ({ funcao: txt(e.funcao, 60), local: txt(e.local, 60), periodo: txt(e.periodo, 40), descricao: txt(e.descricao, 200) }))
    .filter((e) => e.funcao || e.local || e.descricao)
    .slice(0, LIMITES.experiencias);
  const cursos = (c.cursos ?? []).map((x) => txt(x, 80)).filter(Boolean).slice(0, LIMITES.cursos);

  if (experiencias.some((e) => !e.funcao)) erros.experiencias = "Informe a função em cada experiência.";
  if (temCurso(formacao.escolaridade) && !formacao.curso) erros.curso = "Informe o nome do curso.";
  const tudo = [sobre, formacao.instituicao, ...experiencias.map((e) => `${e.local} ${e.descricao}`), ...cursos].join(" ");
  if (SENSIVEL.test(tudo)) erros.sobre = "Não coloque CPF, telefone, e-mail ou endereço no currículo: ele fica visível para outros usuários.";

  return { dados: { sobre: sobre || null, formacao, experiencias, cursos }, erros };
}

/** "Graduação em Administração · Cursando (5º semestre) · UNIR" */
export function resumoFormacao(f) {
  if (!f?.escolaridade) return "";
  const nivel = f.curso ? `${f.escolaridade} em ${f.curso}` : f.escolaridade;
  const sit = f.situacao ? (f.situacao === "Cursando" && f.periodo ? `Cursando (${f.periodo})` : f.situacao) : "";
  return [nivel, sit, f.instituicao].filter(Boolean).join(" · ");
}

export const temCurriculo = (c) =>
  !!(c && (c.sobre || c.formacao?.escolaridade || c.experiencias?.length || c.cursos?.length));
