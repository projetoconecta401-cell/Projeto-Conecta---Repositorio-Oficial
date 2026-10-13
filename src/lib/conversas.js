import { mensagemDeErro, supabase } from "./supabase.js";
import { perfisPorId } from "./perfis.js";
import { novoId } from "./identidade.js";

/*
 * Chat entre as partes (tabelas conversas e chat_mensagens) — item 6.
 * - Candidatura: o profissional abre a conversa da vaga ("Tenho interesse").
 * - Conversa direta: a partir do perfil de um profissional ("Enviar mensagem").
 * - Texto e ÁUDIO: o áudio vai para o bucket privado "chat-audios" e só os dois
 *   participantes conseguem ouvir (link assinado, válido por 1 hora).
 * - "Visualizada" (✓✓): cada lado grava quando leu a conversa (marcar_conversa_lida).
 * O banco só entrega a cada conta as conversas de que ela participa.
 */

const COLS_MSG = "id, conversa_id, autor_id, texto, tipo, audio_path, duracao_seg, criado_em";

// ---------------------------------------------------------------- não lidas --
const chaveLido = (id) => `eifreela:lido:${id}`;
const lidoEm = (id) => {
  try {
    return Number(localStorage.getItem(chaveLido(id)) || 0);
  } catch {
    return 0;
  }
};
/** Marca a conversa como lida: no aparelho e no banco (a outra pessoa vê "Visualizada"). */
export function marcarLido(id) {
  try {
    localStorage.setItem(chaveLido(id), String(Date.now()));
  } catch {
    /* armazenamento indisponível */
  }
  return supabase.rpc("marcar_conversa_lida", { p_conversa: id }).then(() => {}, () => {});
}

/* Quando cada lado leu a conversa (colunas novas; se ainda não existirem, segue sem elas). */
const COLS_LIDO = "id, contratante_id, freelancer_id, lido_contratante_em, lido_freelancer_em";
export const leituras = (c, meuId) => {
  const souContratante = c.contratante_id === meuId;
  return {
    meuLidoEm: (souContratante ? c.lido_contratante_em : c.lido_freelancer_em) ?? null,
    outroLidoEm: (souContratante ? c.lido_freelancer_em : c.lido_contratante_em) ?? null,
  };
};
async function buscarLeituras(ids) {
  if (!ids.length) return {};
  const { data, error } = await supabase.from("conversas").select(COLS_LIDO).in("id", ids);
  if (error) return {};
  return Object.fromEntries(data.map((c) => [c.id, c]));
}

/** "Visto por último" de um perfil (coluna nova; sem ela, null). */
export async function vistoEmDe(perfilId) {
  const { data, error } = await supabase.from("profiles").select("visto_em").eq("id", perfilId).maybeSingle();
  return error ? null : data?.visto_em ?? null;
}

const previa = (m) => (!m ? "" : m.tipo === "audio" ? "🎤 Mensagem de voz" : m.texto);

/** Lista as conversas da conta com a outra pessoa, a vaga e a última mensagem. */
export async function listarConversas(meuId) {
  const { data: conversas, error } = await supabase
    .from("conversas")
    .select("id, vaga_id, contratante_id, freelancer_id, atualizado_em, vagas(titulo, status)")
    .order("atualizado_em", { ascending: false })
    .limit(100);
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível carregar as conversas."));
  if (!conversas.length) return [];

  const outroDe = (c) => (c.contratante_id === meuId ? c.freelancer_id : c.contratante_id);
  const [perfis, { data: msgs }, lidos] = await Promise.all([
    perfisPorId(conversas.map(outroDe)),
    supabase
      .from("chat_mensagens")
      .select(COLS_MSG)
      .in("conversa_id", conversas.map((c) => c.id))
      .order("criado_em", { ascending: false })
      .limit(500),
    buscarLeituras(conversas.map((c) => c.id)),
  ]);

  return conversas.map((c) => {
    const ultima = (msgs ?? []).find((m) => m.conversa_id === c.id);
    const { meuLidoEm, outroLidoEm } = lidos[c.id] ? leituras(lidos[c.id], meuId) : {};
    const lidoAte = Math.max(lidoEm(c.id), meuLidoEm ? new Date(meuLidoEm).getTime() : 0);
    const ultimaMinha = !!ultima && ultima.autor_id === meuId;
    const outro = perfis[outroDe(c)] ?? { id: outroDe(c), nome: "Usuário", avatar_url: null };
    return {
      id: c.id,
      vagaId: c.vaga_id,
      vagaTitulo: c.vagas?.titulo ?? null,
      vagaStatus: c.vagas?.status ?? null,
      outro,
      name: outro.nome,
      lastMessage: previa(ultima) || (c.vaga_id ? "Candidatura enviada" : "Conversa iniciada"),
      lastTime: new Date(ultima?.criado_em ?? c.atualizado_em),
      unread: ultima && !ultimaMinha && new Date(ultima.criado_em).getTime() > lidoAte ? 1 : 0,
      // Minha última mensagem: "enviada" ou "visualizada" pela outra pessoa.
      ultimaMinha,
      ultimaVista: ultimaMinha && !!outroLidoEm && new Date(outroLidoEm) >= new Date(ultima.criado_em),
    };
  });
}

/** Uma conversa com a vaga e a outra pessoa. */
export async function obterConversa(id, meuId) {
  const { data: c, error } = await supabase
    .from("conversas")
    .select("id, vaga_id, contratante_id, freelancer_id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível abrir a conversa."));
  if (!c) return null;
  const outroId = c.contratante_id === meuId ? c.freelancer_id : c.contratante_id;
  const [perfis, lidos, vistoEm] = await Promise.all([perfisPorId([outroId]), buscarLeituras([c.id]), vistoEmDe(outroId)]);
  const outro = perfis[outroId] ?? { id: outroId, nome: "Usuário", avatar_url: null };
  return {
    ...c,
    outro: { ...outro, visto_em: vistoEm },
    outroLidoEm: lidos[c.id] ? leituras(lidos[c.id], meuId).outroLidoEm : null,
  };
}

/** "Tenho interesse": abre a conversa da vaga (candidatura) e manda a 1ª mensagem. */
export async function candidatar(job, meuId) {
  if (job.candidaturaId) return job.candidaturaId;
  const { data, error } = await supabase
    .from("conversas")
    .insert({ vaga_id: job.id, contratante_id: job.ownerId, freelancer_id: meuId })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") {
      const { data: existente } = await supabase
        .from("conversas")
        .select("id")
        .eq("vaga_id", job.id)
        .eq("freelancer_id", meuId)
        .maybeSingle();
      if (existente) return existente.id;
    }
    throw new Error(mensagemDeErro(error, "Não foi possível se candidatar. A vaga pode não estar mais aberta."));
  }
  await enviarTexto(data.id, `Olá! Tenho interesse na vaga "${job.title}". Podemos conversar?`).catch(() => {});
  return data.id;
}

/** Conversa direta com um profissional (reaproveita a existente). */
export async function abrirConversaDireta(meuId, outroId) {
  const procurar = () =>
    supabase
      .from("conversas")
      .select("id")
      .is("vaga_id", null)
      .or(
        `and(contratante_id.eq.${meuId},freelancer_id.eq.${outroId}),and(contratante_id.eq.${outroId},freelancer_id.eq.${meuId})`
      )
      .limit(1)
      .maybeSingle();
  const { data: existente } = await procurar();
  if (existente) return existente.id;
  const { data, error } = await supabase
    .from("conversas")
    .insert({ vaga_id: null, contratante_id: meuId, freelancer_id: outroId })
    .select("id")
    .single();
  if (error) {
    const { data: deNovo } = await procurar();
    if (deNovo) return deNovo.id;
    throw new Error(mensagemDeErro(error, "Não foi possível iniciar a conversa."));
  }
  return data.id;
}

/** Links assinados (1 h) para tocar os áudios. */
async function comLinksDeAudio(mensagens) {
  const caminhos = mensagens.filter((m) => m.tipo === "audio" && m.audio_path).map((m) => m.audio_path);
  if (!caminhos.length) return mensagens;
  const { data } = await supabase.storage.from("chat-audios").createSignedUrls(caminhos, 3600);
  const links = Object.fromEntries((data ?? []).filter((d) => d.signedUrl).map((d) => [d.path, d.signedUrl]));
  return mensagens.map((m) => (m.tipo === "audio" ? { ...m, audioUrl: links[m.audio_path] ?? null } : m));
}

export async function listarMensagens(conversaId) {
  const { data, error } = await supabase
    .from("chat_mensagens")
    .select(COLS_MSG)
    .eq("conversa_id", conversaId)
    .order("criado_em", { ascending: true })
    .limit(500);
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível carregar as mensagens."));
  return comLinksDeAudio(data);
}

/** Mensagem recebida em tempo real (gera o link se for áudio). */
export async function prepararMensagem(m) {
  const [pronta] = await comLinksDeAudio([m]);
  return pronta;
}

export async function enviarTexto(conversaId, texto) {
  const { data, error } = await supabase
    .from("chat_mensagens")
    .insert({ conversa_id: conversaId, tipo: "texto", texto: texto.trim() })
    .select(COLS_MSG)
    .single();
  if (error) throw new Error(mensagemDeErro(error, "Mensagem não enviada."));
  return data;
}

const EXTENSOES = { "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "m4a", "audio/mpeg": "mp3", "audio/aac": "aac", "audio/x-m4a": "m4a", "audio/wav": "wav" };

/** Envia um áudio gravado no chat. blob: Blob do MediaRecorder; duracao em segundos. */
export async function enviarAudio(conversaId, blob, duracao) {
  const tipo = (blob.type || "audio/webm").split(";")[0];
  const ext = EXTENSOES[tipo] ?? "webm";
  const caminho = `${conversaId}/${novoId()}.${ext}`;
  const { error: erroUpload } = await supabase.storage.from("chat-audios").upload(caminho, blob, { contentType: tipo });
  if (erroUpload) throw new Error("Não foi possível enviar o áudio.");
  const { data, error } = await supabase
    .from("chat_mensagens")
    .insert({ conversa_id: conversaId, tipo: "audio", audio_path: caminho, duracao_seg: Math.min(600, Math.max(1, Math.round(duracao))) })
    .select(COLS_MSG)
    .single();
  if (error) throw new Error(mensagemDeErro(error, "Não foi possível enviar o áudio."));
  return prepararMensagem(data);
}
