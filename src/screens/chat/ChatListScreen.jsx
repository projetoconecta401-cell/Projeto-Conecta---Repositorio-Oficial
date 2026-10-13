import { MessageSquare, Check, CheckCheck } from "lucide-react";
import { Avatar, Carregando, EmptyState, Screen, TopBar } from "../../components/ui.jsx";
import { timeAgo } from "../../lib/time.js";
import { useOnline } from "../../lib/presenca.js";

/* Bate-papo (item 6): candidaturas (com a vaga) e conversas diretas, mais recentes primeiro.
   Bolinha verde = online agora; ✓ enviada, ✓✓ azul = visualizada. */
export function ChatListScreen({ conversations, loading, onOpenConversation }) {
  const sorted = [...conversations].sort((a, b) => b.lastTime - a.lastTime);
  const online = useOnline();
  return (
    <Screen>
      <TopBar title="Chat" />
      <div className="flex-1 w-full max-w-2xl mx-auto px-3 py-3">
        {loading && sorted.length === 0 ? (
          <Carregando />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Nenhuma conversa ainda"
            text='Toque em "Tenho interesse" numa vaga ou em "Enviar mensagem" no perfil de um profissional.'
          />
        ) : (
          <ul className="space-y-1">
            {sorted.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onOpenConversation(c)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left min-w-0 ${c.unread ? "bg-emerald-50/60" : "hover:bg-slate-100/70"}`}
                >
                  <span className="relative shrink-0">
                    <Avatar url={c.outro.avatar_url} nome={c.name} size={50} />
                    {c.unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white" aria-label="Não lida" />}
                    {online.has(c.outro.id) && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" aria-label="Online agora" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`text-[14px] truncate ${c.unread ? "font-extrabold text-slate-800" : "font-semibold text-slate-700"}`}>{c.name}</span>
                      <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(c.lastTime)}</span>
                    </span>
                    {c.vagaTitulo && <span className="block text-[11.5px] text-emerald-700 font-semibold truncate">Vaga: {c.vagaTitulo}</span>}
                    <span className={`flex items-center gap-1 text-[12.5px] min-w-0 ${c.unread ? "text-slate-700 font-semibold" : "text-slate-500"}`}>
                      {c.ultimaMinha &&
                        (c.ultimaVista ? (
                          <CheckCheck size={15} className="text-sky-500 shrink-0" aria-label="Visualizada" />
                        ) : (
                          <Check size={15} className="text-slate-400 shrink-0" aria-label="Enviada" />
                        ))}
                      <span className="truncate">{c.lastMessage}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Screen>
  );
}
