/* Validações e máscaras usadas no cadastro, no perfil e na publicação de vagas. */

export const AREAS = ["Gastronomia", "Eventos", "Vendas e comércio", "Administrativo", "Design gráfico", "Criação de conteúdo", "Fotografia e vídeo", "Tecnologia e TI", "Estética/Beleza", "Manutenção/Obras", "Serviços Gerais", "Logística e entregas", "Motorista", "Cuidados (babá e idosos)", "Aulas e reforço", "Agro e campo"];

export const soDigitos = (s) => String(s ?? "").replace(/\D/g, "");

export function cpfValido(valor) {
  const cpf = soDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const d = cpf.split("").map(Number);
  const dv = (n) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += d[i] * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === d[9] && dv(10) === d[10];
}

export const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim()) && String(e).length <= 254;

/** Senha: 8+ caracteres com letra, número e caractere especial (@ # $ ! …). */
export const REGRAS_SENHA = [
  { id: "tam", texto: "8 caracteres ou mais", ok: (s) => s.length >= 8 && s.length <= 72 },
  { id: "letra", texto: "uma letra", ok: (s) => /[A-Za-zÀ-ÿ]/.test(s) },
  { id: "num", texto: "um número", ok: (s) => /\d/.test(s) },
  { id: "esp", texto: "um caractere especial (@ # $ !)", ok: (s) => /[^A-Za-zÀ-ÿ0-9\s]/.test(s) },
];
export const senhaValida = (s) => REGRAS_SENHA.every((r) => r.ok(s));

export function idade(iso) {
  if (!iso) return -1;
  const n = new Date(iso + "T00:00:00");
  if (Number.isNaN(n.getTime())) return -1;
  const h = new Date();
  let a = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) a--;
  return a;
}

export function dataMaxima18() {
  const h = new Date();
  return `${h.getFullYear() - 18}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
}

export function mascaraCPF(v) {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
export const cpfOculto = (cpf) => (cpf ? `***.***.${String(cpf).slice(6, 9)}-${String(cpf).slice(9)}` : "");

export function mascaraTelefone(v) {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Valida os dados do perfil. exigirSenha=false no login social e na edição. Retorna { campo: mensagem }. */
export function validarPerfil(d, { exigirSenha = true, exigirEmail = true } = {}) {
  const e = {};
  const nome = String(d.nome ?? "").trim().replace(/\s+/g, " ");
  if (nome.length < 3 || !nome.includes(" ")) e.nome = "Informe nome e sobrenome.";
  if (d.cpf !== undefined && !cpfValido(d.cpf)) e.cpf = "CPF inválido. Confira os números.";
  if (exigirEmail && !emailValido(d.email ?? "")) e.email = "Informe um e-mail válido.";
  if (d.nascimento !== undefined) {
    const anos = idade(d.nascimento);
    if (anos < 0) e.nascimento = "Informe sua data de nascimento.";
    else if (anos < 18) e.nascimento = "O EiFreela é apenas para maiores de 18 anos.";
    else if (anos > 110) e.nascimento = "Confira a data de nascimento.";
  }
  const tel = soDigitos(d.telefone);
  if (tel.length < 10 || tel.length > 11) e.telefone = "Informe o número com DDD.";
  if (!d.areas?.length) e.areas = "Escolha pelo menos uma área de atuação.";
  if (exigirSenha) {
    if (!senhaValida(d.senha ?? "")) e.senha = "A senha não atende aos requisitos.";
    if (d.confirmar !== d.senha) e.confirmar = "As senhas não são iguais.";
  }
  return e;
}

/** Recusa textos que pareçam endereço exato (rua + número, CEP) — privacidade da vaga. */
export const PARECE_ENDERECO =
  /\b(rua|r\.|av\.?|avenida|travessa|alameda|rodovia|quadra|lote)\s+[^\n,]{2,40},?\s*(n[ºo°.]?\s*)?\d{1,5}\b|\b\d{5}-?\d{3}\b/i;

/** Reduz a foto para no máx. 512 px (JPEG, recorte quadrado) antes do upload. */
export function reduzirImagem(arquivo, max = 512, qualidade = 0.85) {
  return new Promise((resolve, reject) => {
    if (!arquivo?.type?.startsWith("image/")) return reject(new Error("Escolha um arquivo de imagem."));
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      const lado = Math.min(img.width, img.height);
      const tam = Math.min(max, lado);
      const canvas = document.createElement("canvas");
      canvas.width = tam;
      canvas.height = tam;
      canvas.getContext("2d").drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, tam, tam);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao processar a imagem."))), "image/jpeg", qualidade);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler essa imagem."));
    };
    img.src = url;
  });
}

export const iniciais = (nome) =>
  String(nome || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
