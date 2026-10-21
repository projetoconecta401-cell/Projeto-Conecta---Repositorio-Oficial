/*
 * Resumo profissional do profissional: sobre mim, formação, experiências e cursos.
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

export const LIMITES = { sobre: 400, formacoes: 4, experiencias: 5, cursos: 8 };

export const formacaoVazia = () => ({ escolaridade: "", curso: "", instituicao: "", situacao: "", periodo: "" });

export const curriculoVazio = () => ({
  sobre: "",
  formacoes: [],
  experiencias: [],
  cursos: [],
});

/*
 * No banco, "formacao" é um objeto: { itens: [ {escolaridade, curso, ...}, ... ] }.
 * Perfis antigos têm uma formação só ({ escolaridade, curso, ... }); aqui vira lista.
 */
export function listaFormacoes(f) {
  if (!f || typeof f !== "object") return [];
  const itens = Array.isArray(f.itens) ? f.itens : f.escolaridade ? [f] : [];
  return itens.filter((x) => x && typeof x === "object").map((x) => ({ ...formacaoVazia(), ...x }));
}

export const experienciaVazia = () => ({ funcao: "", local: "", periodo: "", descricao: "" });

const txt = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/** Lê o que veio do banco (ou de um perfil antigo sem currículo). */
export function lerCurriculo(p) {
  if (!p) return curriculoVazio();
  return {
    sobre: p.sobre ?? "",
    formacoes: listaFormacoes(p.formacao),
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
  const formacoes = (c.formacoes ?? [])
    .map((f) => ({
      escolaridade: ESCOLARIDADES.includes(f.escolaridade) ? f.escolaridade : "",
      curso: temCurso(f.escolaridade) ? txt(f.curso, 80) : "",
      instituicao: txt(f.instituicao, 80),
      situacao: SITUACOES.includes(f.situacao) ? f.situacao : "",
      periodo: f.situacao === "Cursando" ? txt(f.periodo, 60) : "",
    }))
    .filter((f) => f.escolaridade)
    .slice(0, LIMITES.formacoes);
  if ((c.formacoes ?? []).some((f) => !f.escolaridade && (f.curso || f.instituicao))) erros.formacoes = "Escolha a escolaridade em cada formação.";
  const experiencias = (c.experiencias ?? [])
    .map((e) => ({ funcao: txt(e.funcao, 60), local: txt(e.local, 60), periodo: txt(e.periodo, 40), descricao: txt(e.descricao, 200) }))
    .filter((e) => e.funcao || e.local || e.descricao)
    .slice(0, LIMITES.experiencias);
  const cursos = (c.cursos ?? []).map((x) => txt(x, 80)).filter(Boolean).slice(0, LIMITES.cursos);

  if (experiencias.some((e) => !e.funcao)) erros.experiencias = "Informe a função em cada experiência.";
  if (formacoes.some((f) => temCurso(f.escolaridade) && !f.curso)) erros.formacoes = "Informe o nome do curso em cada formação.";
  const tudo = [sobre, ...formacoes.map((f) => f.instituicao), ...experiencias.map((e) => `${e.local} ${e.descricao}`), ...cursos].join(" ");
  if (SENSIVEL.test(tudo)) erros.sobre = "Não coloque CPF, telefone, e-mail ou endereço no currículo: ele fica visível para outros usuários.";

  // Sem campos vazios, para caber folgado no limite do banco.
  const enxuta = formacoes.map((f) => Object.fromEntries(Object.entries(f).filter(([, v]) => v)));
  return { dados: { sobre: sobre || null, formacao: { itens: enxuta }, experiencias, cursos }, erros };
}

/** "Graduação em Administração · Cursando (5º semestre) · UNIR" (aceita uma formação ou a lista do banco). */
export function resumoFormacao(f) {
  if (f && !f.escolaridade) {
    const lista = listaFormacoes(f);
    if (!lista.length) return "";
    return resumoFormacao(lista[0]) + (lista.length > 1 ? ` · +${lista.length - 1}` : "");
  }
  if (!f?.escolaridade) return "";
  const nivel = f.curso ? `${f.escolaridade} em ${f.curso}` : f.escolaridade;
  const sit = f.situacao ? (f.situacao === "Cursando" && f.periodo ? `Cursando (${f.periodo})` : f.situacao) : "";
  return [nivel, sit, f.instituicao].filter(Boolean).join(" · ");
}

export const temCurriculo = (c) =>
  !!(c && (c.sobre || c.formacoes?.length || listaFormacoes(c.formacao).length || c.experiencias?.length || c.cursos?.length));
