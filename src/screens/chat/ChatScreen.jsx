import { CreditCard, Wallet, X, Send, Calendar, CheckCircle2, Smile, AlertTriangle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AudioMessageBubble } from "../../components/chat/AudioMessageBubble.jsx";
import { EmojiPickerPopover } from "../../components/chat/EmojiPickerPopover.jsx";
import { VoiceRecorderButton } from "../../components/chat/VoiceRecorderButton.jsx";
import { ApplicationStatusPill } from "../../components/jobs/ApplicationStatusPill.jsx";
import { CancelReasonModal } from "../../components/jobs/CancelReasonModal.jsx";
import { Screen, TopBar, Pill } from "../../components/ui.jsx";
import { conversaDaVaga, listarMensagens, mesclarMensagens, novaMensagem, salvarMensagem } from "../../lib/mensagens.js";

export function ChatScreen({ job, onBack, onComplete, onCancel }) {
  const [showPix, setShowPix] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [messages, setMessages] = useState([
    { id: "seed-1", from: "them", text: `Olá! Combinado então, te espero no local no dia ${job.date.split("·")[0].trim()}.` },
    { id: "seed-2", from: "me", text: "Perfeito, estarei lá! Qualquer detalhe me chama por aqui." },
  ]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [sendError, setSendError] = useState("");
  const endRef = useRef(null);
  const conversa = conversaDaVaga(job.id);

  // Histórico salvo no Supabase (só as mensagens deste navegador).
  useEffect(() => {
    let cancelled = false;
    listarMensagens(conversa)
      .then((salvas) => {
        if (!cancelled && salvas.length) setMessages((m) => mesclarMensagens(m, salvas));
      })
      .catch((err) => !cancelled && setSendError(err.message));
    return () => {
      cancelled = true;
    };
  }, [conversa]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendClick = () => {
    const value = text.trim();
    if (!value) return;
    try {
      const msg = novaMensagem(value); // id estável: o mesmo na tela e no banco
      setMessages((m) => [...m, msg]);
      setText("");
      setSendError("");
      salvarMensagem(conversa, msg).catch((err) => setSendError(err.message));
    } catch (err) {
      /* nunca deixa o envio quebrar a tela inteira do chat */
    }
  };

  const handleAudioRecorded = (audioUrl, duration) => {
    setMessages((m) => [...m, { id: `msg-${Date.now()}-${m.length}`, from: "me", type: "audio", audioUrl, duration }]);
  };

  return (
    <Screen>
      <TopBar
        title={job.contractor}
        onBack={onBack}
        right={<Pill tone="green">Em Atendimento</Pill>}
      />

      <div className="mx-4 mt-3 p-3 rounded-xl bg-white border border-slate-100">
        <p className="font-bold text-slate-800 text-[13.5px] leading-snug break-words">{job.title} — {job.contractor}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[11.5px] text-slate-500 flex-wrap">
          <span className="flex items-center gap-1 shrink-0"><Calendar size={12} /> {job.date}</span>
          <span className="flex items-center gap-1 shrink-0 font-bold text-emerald-700"><Wallet size={12} /> R$ {job.value}</span>
        </div>
        <div className="mt-1.5">
          <ApplicationStatusPill status={job.applicationStatus} />
        </div>
      </div>

      <div className="mx-4 mt-2.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 p-2.5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-teal-500 text-white flex items-center justify-center text-[9px] font-bold">AD</div>
        <p className="text-[11px] text-slate-500 flex-1">Patrocinado: Rede de Parceiros Conexão Free — descontos em todo o Brasil</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative">
        {messages.map((m, i) => (
          <div key={m.id || i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            {m.type === "audio" ? (
              <AudioMessageBubble src={m.audioUrl} duration={m.duration} mine={m.from === "me"} />
            ) : (
              <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13.5px] ${m.from === "me" ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"}`}>
                {m.text}
              </div>
            )}
          </div>
        ))}
        {showPix && (
          <div className="flex justify-end">
            <div className="max-w-[80%] bg-emerald-50 border border-emerald-200 rounded-2xl rounded-br-sm px-4 py-3">
              <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5"><CreditCard size={13} /> Chave PIX compartilhada</p>
              <p className="text-[13px] font-mono text-emerald-800 mt-1">voce.conexaofree@pix.com.br</p>
            </div>
          </div>
        )}
        <div ref={endRef} />

        {showCancelModal && (
          <CancelReasonModal
            onClose={() => setShowCancelModal(false)}
            onConfirm={(reason) => {
              setShowCancelModal(false);
              onCancel(job, "profissional", reason);
            }}
          />
        )}
      </div>

      <div className="px-4 pb-2">
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <button onClick={() => onComplete(job)} className="py-2.5 rounded-xl bg-emerald-500 text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 size={15} /> Concluir serviço
          </button>
          <button onClick={() => setShowCancelModal(true)} className="py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-[12.5px] font-bold flex items-center justify-center gap-1.5">
            <X size={15} /> Cancelar
          </button>
        </div>
      </div>

      {sendError && (
        <p role="alert" className="mx-4 mb-2 text-[11.5px] text-red-500 font-semibold flex items-center gap-1.5">
          <AlertTriangle size={12} className="shrink-0" /> {sendError}
        </p>
      )}
      <div className="px-4 pb-4 flex items-center gap-2">
        <button onClick={() => setShowPix(true)} className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
          <Wallet size={18} />
        </button>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            aria-label="Inserir emoji"
          >
            <Smile size={18} />
          </button>
          {showEmoji && (
            <EmojiPickerPopover
              onSelect={(emoji) => setText((t) => t + emoji)}
              onClose={() => setShowEmoji(false)}
            />
          )}
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendClick()}
          placeholder="Escreva uma mensagem..."
          className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13.5px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <VoiceRecorderButton onRecorded={handleAudioRecorded} />
        <button onClick={() => handleSendClick()} className="p-3 rounded-xl bg-emerald-600 text-white shrink-0">
          <Send size={17} />
        </button>
      </div>
    </Screen>
  );
}
