import { Send, Smile } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AudioMessageBubble } from "../../components/chat/AudioMessageBubble.jsx";
import { EmojiPickerPopover } from "../../components/chat/EmojiPickerPopover.jsx";
import { VoiceRecorderButton } from "../../components/chat/VoiceRecorderButton.jsx";
import { Screen, TopBar } from "../../components/ui.jsx";

export function ConversationChatScreen({ conversation, onBack, onSend }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages.length]);

  const handleSendClick = () => {
    const value = text.trim();
    if (!value) return;
    try {
      onSend(conversation.id, value);
      setText("");
    } catch (err) {
      /* nunca deixa o envio quebrar a tela inteira do chat */
    }
  };

  const handleAudioRecorded = (audioUrl, duration) => {
    onSend(conversation.id, { audioUrl, duration });
  };

  return (
    <Screen>
      <TopBar
        title={conversation.name}
        onBack={onBack}
        right={
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center text-[11px]">
            {conversation.avatar}
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {conversation.messages.length === 0 ? (
          <p className="text-center text-[12px] text-slate-400 mt-6">Envie a primeira mensagem para {conversation.name}.</p>
        ) : (
          conversation.messages.map((m, i) => (
            <div key={m.id || i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              {m.type === "audio" ? (
                <AudioMessageBubble src={m.audioUrl} duration={m.duration} mine={m.from === "me"} />
              ) : (
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13.5px] break-words ${m.from === "me" ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"}`}>
                  {m.text}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
      <div className="px-4 pb-4 pt-2 flex items-center gap-2 border-t border-slate-100">
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
