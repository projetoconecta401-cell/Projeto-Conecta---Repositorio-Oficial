import { Send, Smile, AlertTriangle, ChevronRight, ArrowLeft, Check, CheckCheck, EllipsisVertical, Ban, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AudioMessageBubble } from "../../components/chat/AudioMessageBubble.jsx";
import { EmojiPickerPopover } from "../../components/chat/EmojiPickerPopover.jsx";
import { VoiceRecorderButton } from "../../components/chat/VoiceRecorderButton.jsx";
import { Avatar, Carregando, Pill, toneDoStatus } from "../../components/ui.jsx";
import { enviarAudio, enviarTexto, leituras, listarMensagens, marcarLido, obterConversa, prepararMensagem } from "../../lib/conversas.js";
import { textoVistoEm, useOnline } from "../../lib/presenca.js";
import { dadoSensivel, pareceGolpe } from "../../lib/seguranca.js";
import { AcoesPessoaSheet, AlertaGolpe, DicasSeguranca, useBloqueados } from "../../components/Seguranca.jsx";
import { supabase } from "../../lib/supabase.js";
import { reais } from "../../lib/vagas.js";

const hora = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dia = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });

/*
 * Chat entre contratante e profissional (item 6): texto, emoji e áudio, em tempo real.
 * A tela ocupa a altura do aparelho: as mensagens rolam por dentro e o campo de texto
 * fica sempre visível embaixo.
 * Mostra se a outra pessoa está online (ou quando foi vista) e, nas minhas mensagens,
 * ✓ enviada / ✓✓ visualizada.
 */
export function ConversationChatScreen({ conversaId, userId, jobs, onBack, onRead, onOpenJob, onOpenProfile, onAccept, onAviso }) {
  const [conversa, setConversa] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [outroLidoEm, setOutroLidoEm] = useState(null);
  const endRef = useRef(null);
  const onlineAgora = useOnline();
  const bloqueados = useBloqueados();
  const [menu, setMenu] = useState(false);
  const visivel = () => document.visibilityState === "visible";

  const job = conversa?.vaga_id ? jobs.find((j) => j.id === conversa.vaga_id) : null;

  const carregar = useCallback(async () => {
    try {
      const c = await obterConversa(conversaId, userId);
      setConversa(c);
      setOutroLidoEm(c?.outroLidoEm ?? null);
      if (c) setMessages(await listarMensagens(conversaId));
      marcarLido(conversaId);
      onRead?.();
    } catch (err) {
      setError(err.message);
      setConversa(null);
    }
  }, [conversaId, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    carregar();
    const canal = supabase
      .channel(`chat-${conversaId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_mensagens", filter: `conversa_id=eq.${conversaId}` }, async ({ new: m }) => {
        const pronta = await prepararMensagem(m);
        setMessages((l) => (l.some((x) => x.id === pronta.id) ? l : [...l, pronta]));
        if (m.autor_id !== userId && visivel()) marcarLido(conversaId);
      })
      // A outra pessoa abriu a conversa: minhas mensagens viram "visualizadas".
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversas", filter: `id=eq.${conversaId}` }, ({ new: c }) => {
        const { outroLidoEm: lido } = leituras(c, userId);
        if (lido) setOutroLidoEm(lido);
      })
      .subscribe();
    const aoVoltar = () => visivel() && marcarLido(conversaId);
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      document.removeEventListener("visibilitychange", aoVoltar);
      supabase.removeChannel(canal);
    };
  }, [carregar, conversaId, userId]);

  useLayoutEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const adicionar = (m) => setMessages((l) => (l.some((x) => x.id === m.id) ? l : [...l, m]));

  const handleSend = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setError("");
    setText("");
    try {
      adicionar(await enviarTexto(conversaId, value));
    } catch (err) {
      setText(value);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleAudio = async (blob, duracao) => {
    setSending(true);
    setError("");
    try {
      adicionar(await enviarAudio(conversaId, blob, duracao));
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (conversa === undefined) {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        <Carregando />
      </div>
    );
  }

  const outro = conversa?.outro;
  const souDono = job?.isOwner;
  const outroEhCandidato = souDono && job && conversa.freelancer_id === outro?.id;
  const outroOnline = !!outro && onlineAgora.has(outro.id);
  const bloqueado = !!outro && bloqueados.has(outro.id);
  const statusOutro = outroOnline ? "Online" : textoVistoEm(outro?.visto_em);
  const vista = (m) => !!outroLidoEm && new Date(outroLidoEm) >= new Date(m.criado_em);
  const ultimaMinha = [...messages].reverse().find((m) => m.autor_id === userId);
  let diaAnterior = "";

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 px-3 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] bg-white border-b border-slate-100 shrink-0">
        <button onClick={onBack} aria-label="Voltar" className="p-2 rounded-full hover:bg-slate-100 text-slate-600 shrink-0">
          <ArrowLeft size={20} />
        </button>
        {outro ? (
          <button onClick={() => onOpenProfile(outro.id)} className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
            <span className="relative shrink-0">
              <Avatar url={outro.avatar_url} nome={outro.nome} size={38} />
              {outroOnline && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" aria-hidden="true" />}
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-slate-800 text-[15px] truncate">{outro.nome}</span>
              <span className={`block text-[11.5px] truncate ${outroOnline ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                {statusOutro ?? (job ? "Conversa sobre a vaga" : "Conversa direta")}
              </span>
            </span>
          </button>
        ) : (
          <p className="font-bold text-slate-800 flex-1">Conversa</p>
        )}
        {outro && (
          <button onClick={() => setMenu(true)} aria-label="Denunciar ou bloquear" className="p-2 rounded-full hover:bg-slate-100 text-slate-500 shrink-0">
            <EllipsisVertical size={20} />
          </button>
        )}
      </div>
      {menu && outro && (
        <AcoesPessoaSheet
          pessoa={outro}
          vagaId={conversa?.vaga_id ?? null}
          conversaId={conversaId}
          onClose={() => setMenu(false)}
          onVerPerfil={() => onOpenProfile(outro.id)}
          onAviso={onAviso}
        />
      )}

      {!conversa ? (
        <div className="flex-1 flex items-center justify-center px-8 text-center text-[13px] text-slate-500">
          {error || "Conversa não encontrada."}
        </div>
      ) : (
        <>
          {/* Vaga da conversa */}
          {job && (
            <div className="px-3 pt-3 shrink-0">
              <button onClick={() => onOpenJob(job)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 text-left min-w-0">
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-800 text-[13.5px] truncate">{job.title}</span>
                  <span className="flex items-center gap-2 mt-1 min-w-0">
                    <Pill tone={toneDoStatus(job.status)}>{job.status}</Pill>
                    <span className="text-[12px] font-bold text-emerald-700 shrink-0">{reais(job.value)}</span>
                    <span className="text-[11.5px] text-slate-400 truncate">{job.dateLabel}</span>
                  </span>
                </span>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </button>
              {outroEhCandidato && !job.contratadoId && ["Disponível", "Em Negociação"].includes(job.status) && (
                <button
                  onClick={() => onAccept(job, outro.id)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold"
                >
                  Aceitar {outro.nome.split(" ")[0]} para esta vaga
                </button>
              )}
            </div>
          )}

          {/* Mensagens (rolam por dentro) */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-2" aria-live="polite">
            <DicasSeguranca chave={conversaId} />
            {messages.length === 0 && (
              <p className="text-center text-[12.5px] text-slate-400 mt-6 px-6">
                Diga olá e combine os detalhes. O endereço exato só deve ser passado aqui, depois de fechar a diária.
              </p>
            )}
            {messages.map((m) => {
              const d = dia(m.criado_em);
              const mostrarDia = d !== diaAnterior;
              diaAnterior = d;
              const mine = m.autor_id === userId;
              return (
                <div key={m.id}>
                  {mostrarDia && (
                    <p className="text-center my-3">
                      <span className="px-3 py-1 rounded-full bg-slate-200/70 text-slate-500 text-[11px] font-semibold">{d}</span>
                    </p>
                  )}
                  <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    {m.tipo === "audio" ? (
                      <div className={`flex flex-col gap-0.5 ${mine ? "items-end" : "items-start"}`}>
                        <AudioMessageBubble src={m.audioUrl} duration={m.duracao_seg} mine={mine} />
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 px-1">
                          {hora(m.criado_em)} {mine && <Tique vista={vista(m)} claro={false} />}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-[14px] break-words whitespace-pre-wrap ${
                          mine ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
                        }`}
                      >
                        {m.texto}
                        <span className={`flex items-center justify-end gap-1 text-[10px] mt-0.5 ${mine ? "text-emerald-100" : "text-slate-400"}`}>
                          {hora(m.criado_em)} {mine && <Tique vista={vista(m)} claro />}
                        </span>
                      </div>
                    )}
                  </div>
                  {!mine && m.tipo !== "audio" && pareceGolpe(m.texto) && <AlertaGolpe />}
                  {m === ultimaMinha && vista(m) && (
                    <p className="text-right text-[10.5px] text-slate-400 mt-0.5 pr-1">Visualizada às {hora(outroLidoEm)}</p>
                  )}
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {error && (
            <p role="alert" className="mx-4 mb-1 text-[11.5px] text-red-500 font-semibold flex items-center gap-1.5 shrink-0">
              <AlertTriangle size={12} className="shrink-0" /> {error}
            </p>
          )}

          {dadoSensivel(text) && !bloqueado && (
            <p className="mx-4 mb-1 text-[11.5px] text-amber-700 font-semibold flex items-start gap-1.5 shrink-0">
              <ShieldAlert size={13} className="shrink-0 mt-px" /> Evite enviar CPF, senhas, códigos ou número de cartão pelo chat.
            </p>
          )}

          {/* Campo de mensagem (ou aviso de bloqueio) */}
          {bloqueado ? (
            <div className="px-4 pt-3 pb-[calc(0.9rem+env(safe-area-inset-bottom))] border-t border-slate-100 bg-white shrink-0 flex items-center gap-3">
              <Ban size={18} className="text-slate-400 shrink-0" />
              <p className="flex-1 text-[13px] text-slate-500">Você bloqueou {outro.nome.split(" ")[0]}. Vocês não podem trocar mensagens.</p>
              <button onClick={() => setMenu(true)} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-[12.5px] font-bold shrink-0">
                Desbloquear
              </button>
            </div>
          ) : (
          <div className="px-3 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-end gap-2 border-t border-slate-100 bg-white shrink-0">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                aria-label="Inserir emoji"
              >
                <Smile size={18} />
              </button>
              {showEmoji && <EmojiPickerPopover onSelect={(emoji) => setText((t) => t + emoji)} onClose={() => setShowEmoji(false)} />}
            </div>
            <textarea
              rows={1}
              value={text}
              maxLength={2000}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Escreva uma mensagem…"
              aria-label="Mensagem"
              className="flex-1 min-w-0 max-h-32 px-4 py-3 rounded-xl border border-slate-200 bg-white text-[16px] resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            {text.trim() ? (
              <button onClick={handleSend} disabled={sending} aria-label="Enviar" className="p-3 rounded-xl bg-emerald-600 text-white shrink-0 disabled:opacity-50">
                <Send size={17} />
              </button>
            ) : (
              <VoiceRecorderButton onRecorded={handleAudio} disabled={sending} />
            )}
          </div>
          )}
        </>
      )}
    </div>
  );
}

/* ✓ enviada · ✓✓ visualizada (azul). */
const Tique = ({ vista, claro }) =>
  vista ? (
    <CheckCheck size={14} className={claro ? "text-sky-200" : "text-sky-500"} aria-label="Visualizada" />
  ) : (
    <Check size={14} className={claro ? "text-emerald-100" : "text-slate-400"} aria-label="Enviada" />
  );
