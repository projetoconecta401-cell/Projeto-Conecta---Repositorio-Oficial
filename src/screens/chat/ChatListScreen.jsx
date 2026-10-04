import { MessageSquare } from "lucide-react";
import { Screen, TopBar } from "../../components/ui.jsx";
import { timeAgo } from "../../lib/time.js";

export function ChatListScreen({ conversations, onOpenConversation }) {
  const sorted = [...conversations].sort((a, b) => b.lastTime - a.lastTime);
  return (
    <Screen>
      <TopBar title="Chat" />
      <div className="flex-1 px-3 py-3">
        {sorted.length === 0 ? (
          <div className="text-center py-16 px-6">
            <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-[13px] font-semibold text-slate-500">Nenhuma conversa ainda</p>
            <p className="text-[12px] text-slate-400 mt-1">
              Visite "Profissionais Disponíveis" e clique em "Enviar mensagem" para começar.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sorted.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenConversation(c)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center">
                    {c.avatar}
                  </div>
                  {c.unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 border-2 border-white text-white text-[10px] font-bold flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[14px] truncate ${c.unread > 0 ? "font-extrabold text-slate-800" : "font-semibold text-slate-700"}`}>{c.name}</p>
                    <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(c.lastTime)}</span>
                  </div>
                  <p className={`text-[12.5px] truncate ${c.unread > 0 ? "text-slate-700 font-semibold" : "text-slate-500"}`}>{c.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}
