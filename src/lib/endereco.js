/*
 * Endereço (todos os usuários) e dados de contratante (CNPJ ou pessoa física).
 * O endereço completo fica visível só para o dono; os outros veem apenas cidade/UF.
 * A busca do CEP usa o ViaCEP (gratuito, sem chave) e, se falhar, a BrasilAPI.
 * Se as duas falharem, a pessoa preenche tudo à mão.
 */

export const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export const enderecoVazio = () => ({ cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" });

export const mascaraCEP = (v) => {
  const d = String(v ?? "").replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

const comPrazo = (url, ms = 6000) => {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  return fetch(url, { signal: ctl.signal }).finally(() => clearTimeout(t));
};

/** Busca o CEP. Retorna { logradouro, bairro, cidade, uf } ou null (não achou / sem internet). */
export async function buscarCep(cep) {
  const d = String(cep ?? "").replace(/\D/g, "");
  if (d.length !== 8) return null;
  try {
    const r = await comPrazo(`https://viacep.com.br/ws/${d}/json/`);
    if (r.ok) {
      const j = await r.json();
      if (!j.erro) return { logradouro: j.logradouro ?? "", bairro: j.bairro ?? "", cidade: j.localidade ?? "", uf: j.uf ?? "" };
      return { naoEncontrado: true };
    }
  } catch { /* tenta a próxima */ }
  try {
    const r = await comPrazo(`https://brasilapi.com.br/api/cep/v1/${d}`);
    if (r.ok) {
      const j = await r.json();
      return { logradouro: j.street ?? "", bairro: j.neighborhood ?? "", cidade: j.city ?? "", uf: j.state ?? "" };
    }
    if (r.status === 404) return { naoEncontrado: true };
  } catch { /* sem consulta: preenchimento manual */ }
  return null;
}

export const temEndereco = (p) => !!(p?.cep && p?.logradouro && p?.numero && p?.bairro && p?.cidade && p?.uf);

export const lerEndereco = (p) => ({
  ...enderecoVazio(),
  ...Object.fromEntries(Object.keys(enderecoVazio()).map((k) => [k, k === "cep" ? mascaraCEP(p?.cep ?? "") : p?.[k] ?? ""])),
});

/** Erros por campo ({} quando está tudo certo). */
export function validarEndereco(e) {
  const er = {};
  const t = (v) => String(v ?? "").trim();
  if (t(e.cep).replace(/\D/g, "").length !== 8) er.cep = "Informe um CEP com 8 números.";
  if (t(e.logradouro).length < 2) er.logradouro = "Informe a rua ou avenida.";
  if (!t(e.numero)) er.numero = "Informe o número (ou \"s/n\").";
  if (t(e.bairro).length < 2) er.bairro = "Informe o bairro.";
  if (t(e.cidade).length < 2) er.cidade = "Informe a cidade.";
  if (!UFS.includes(t(e.uf).toUpperCase())) er.uf = "Escolha o estado.";
  if (t(e.logradouro).length > 120) er.logradouro = "Use no máximo 120 caracteres.";
  if (t(e.complemento).length > 60) er.complemento = "Use no máximo 60 caracteres.";
  return er;
}

/** Formato do banco. */
export const enderecoParaBanco = (e) => ({
  cep: String(e.cep).replace(/\D/g, ""),
  logradouro: e.logradouro.trim(),
  numero: e.numero.trim(),
  complemento: e.complemento.trim() || null,
  bairro: e.bairro.trim(),
  cidade: e.cidade.trim(),
  uf: e.uf.trim().toUpperCase(),
});

/* ---------------------------------------------------------- CNPJ --------- */
/*
 * Confere formato e dígitos verificadores (CNPJ numérico e o novo alfanumérico).
 * NÃO diz se a empresa está ativa na Receita Federal.
 */
export const limparCNPJ = (v) => String(v ?? "").toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 14);

export function cnpjValido(v) {
  const c = limparCNPJ(v);
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(c) || /^(.)\1{13}$/.test(c)) return false;
  const val = (ch) => ch.charCodeAt(0) - 48;
  const dv = (base, pesos) => {
    const s = [...base].reduce((acc, ch, i) => acc + val(ch) * pesos[i], 0);
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = dv(c.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = dv(c.slice(0, 12) + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === val(c[12]) && d2 === val(c[13]);
}

export const mascaraCNPJ = (v) => {
  const c = limparCNPJ(v);
  return [c.slice(0, 2), c.slice(2, 5), c.slice(5, 8)].filter(Boolean).join(".") +
    (c.length > 8 ? `/${c.slice(8, 12)}` : "") + (c.length > 12 ? `-${c.slice(12)}` : "");
};

export const contratanteVazio = () => ({ quer: false, tipo: "pf", empresa: "", cnpj: "" });

export function validarContratante(c) {
  const er = {};
  if (!c.quer) return er;
  if (c.tipo === "pj") {
    if (!cnpjValido(c.cnpj)) er.cnpj = "CNPJ inválido. Confira os números.";
    if (c.empresa.trim().length < 2) er.empresa = "Informe o nome da empresa.";
  } else if (c.empresa.trim() && c.empresa.trim().length < 2) {
    er.empresa = "Nome muito curto.";
  }
  return er;
}

export const contratanteParaBanco = (c) =>
  !c.quer ? {} : { contratante_tipo: c.tipo, empresa: c.empresa.trim() || null, cnpj: c.tipo === "pj" ? limparCNPJ(c.cnpj) : null };
