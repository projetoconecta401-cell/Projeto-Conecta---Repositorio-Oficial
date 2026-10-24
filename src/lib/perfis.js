import { mensagemDeErro, supabase } from "./supabase.js";

/*
 * Perfis (tabela profiles). Campos: nome, CPF, e-mail, nascimento, telefone/WhatsApp,
 * avatar e áreas de atuação. Nenhum dado bancário.
 * CPF (só hash + 2 últimos dígitos), e-mail e telefone só o dono lê (função meu_perfil); para os outros
 * usuários o banco libera apenas nome, foto, áreas e o resumo profissional (opcional).
 */

const PUBLICO = "id, nome, avatar_url, areas, criado_em";
const CURRICULO = "id, sobre, formacao, experiencias, cursos";

/* Resumo profissional de vários perfis (colunas novas: se o banco ainda não tiver, segue sem). */
export async function curriculos(ids, colunas = CURRICULO) {
  const unicos = [...new Set(ids.filter(Boolean))];
  if (!unicos.length) return {};
  const { data, error } = await supabase.from("profiles").select(colunas).in("id", unicos);
  if (error) return {};
  return Object.fromEntries(data.map((c) => [c.id, c]));
}

export async function meuPerfil() {
  const { data, error } = await supabase.rpc("meu_perfil");
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível carregar seu perfil."));
  return data?.[0] ?? null;
}

/** Completa o perfil (login com Google/Facebook ou contas antigas). */
export async function criarPerfil(usuario, dados) {
  const base = {
    id: usuario.id,
    email: usuario.email.toLowerCase(),
    nome: dados.nome,
    cpf: dados.cpf,
    data_nascimento: dados.nascimento,
    telefone: dados.telefone,
    areas: dados.areas,
    avatar_url: dados.avatar_url ?? null,
  };
  let { error } = await supabase.from("profiles").insert({ ...base, ...(dados.endereco ?? {}), ...(dados.contratante ?? {}) });
  // Banco ainda sem as colunas de endereço: grava o básico (o endereço é pedido depois).
  if (error && (error.code === "PGRST204" || error.code === "42703")) ({ error } = await supabase.from("profiles").insert(base));
  if (error) {
    if (error.code === "23505") {
      throw new Error(/cnpj/i.test(error.message ?? "") ? "Este CNPJ já está cadastrado em outra conta." : "Este CPF já está cadastrado em outra conta.");
    }
    throw new Error(mensagemDeErro(error, "Não foi possível salvar seu perfil. Confira os dados."));
  }
}

export async function atualizarPerfil(id, campos) {
  const { error } = await supabase.from("profiles").update(campos).eq("id", id);
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível salvar as alterações."));
}

/** Envia a foto (bucket público "avatars", pasta do usuário) e grava a URL no perfil. */
export async function enviarAvatar(usuarioId, blob) {
  const caminho = `${usuarioId}/avatar-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("avatars").upload(caminho, blob, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error("Não foi possível enviar a foto.");
  const { data } = supabase.storage.from("avatars").getPublicUrl(caminho);
  await atualizarPerfil(usuarioId, { avatar_url: data.publicUrl });
  return data.publicUrl;
}

/** Notas médias por perfil: { [perfilId]: { media, total } }. */
export async function notasDosPerfis() {
  const { data, error } = await supabase.from("notas_perfis").select("perfil_id, media, total");
  if (error) return {};
  return Object.fromEntries(data.map((n) => [n.perfil_id, { media: Number(n.media), total: n.total }]));
}

/** Profissionais cadastrados (exceto eu), com nota média. */
export async function listarProfissionais(meuId) {
  const consulta = (cols) => supabase.from("profiles").select(cols).neq("id", meuId).order("criado_em", { ascending: false }).limit(200);
  let [{ data, error }, notas] = await Promise.all([consulta(`${PUBLICO}, cidade, uf`), notasDosPerfis()]);
  if (error && /42703|PGRST204|cidade/.test(`${error.code} ${error.message}`)) ({ data, error } = await consulta(PUBLICO));
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível carregar os profissionais."));
  const cvs = await curriculos(data.map((p) => p.id), "id, sobre, formacao");
  return data.map((p) => ({ ...p, ...(cvs[p.id] ?? {}), nota: notas[p.id] ?? null }));
}

export async function perfisPorId(ids) {
  const unicos = [...new Set(ids.filter(Boolean))];
  if (!unicos.length) return {};
  const { data } = await supabase.from("profiles").select(PUBLICO).in("id", unicos);
  return Object.fromEntries((data ?? []).map((p) => [p.id, p]));
}

/** Perfil público + avaliações recebidas (anônimas: sem quem avaliou nem a vaga). */
export async function perfilPublico(id) {
  const [{ data: perfil }, notas, { data: avals }, cvs] = await Promise.all([
    supabase.from("profiles").select(`${PUBLICO}, cidade, uf`).eq("id", id).maybeSingle()
      .then((r) => (r.error && /42703|PGRST204/.test(String(r.error.code)) ? supabase.from("profiles").select(PUBLICO).eq("id", id).maybeSingle() : r)),
    notasDosPerfis(),
    supabase
      .from("avaliacoes")
      .select("id, nota, comentario, criado_em")
      .eq("avaliado_id", id)
      .order("criado_em", { ascending: false })
      .limit(50),
    curriculos([id]),
  ]);
  if (!perfil) return null;
  return {
    ...perfil,
    ...(cvs[id] ?? {}),
    nota: notas[id] ?? null,
    avaliacoes: avals ?? [],
  };
}

/*
 * Foto escolhida no cadastro: a conta só existe depois do código do e-mail, e o envio
 * ao Storage exige estar logado. A foto fica guardada aqui até o App abrir já logado.
 */
let avatarPendente = null;
export const guardarAvatarPendente = (blob) => {
  avatarPendente = blob;
};
export async function enviarAvatarPendente(usuarioId) {
  if (!avatarPendente) return null;
  const blob = avatarPendente;
  avatarPendente = null;
  return enviarAvatar(usuarioId, blob);
}
