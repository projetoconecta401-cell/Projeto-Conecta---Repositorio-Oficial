import { User, MapPin, Bell, Calendar, Briefcase, MessageSquare } from "lucide-react";

export const BottomNav = ({ active, setScreen, mode, unreadConversations }) => {
  const items = [
    { id: "feed", label: "Início", icon: Briefcase },
    { id: "map", label: "Mapa", icon: MapPin },
    { id: "chatList", label: "Chat", icon: MessageSquare, badge: unreadConversations },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "notifs", label: "Alertas", icon: Bell },
    { id: "account", label: "Perfil", icon: User },
  ];
  return (
    <div className="sticky bottom-0 z-20 bg-white border-t border-slate-100 px-1 py-2 flex items-center justify-between">
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setScreen(it.id)}
            className="flex-1 min-w-0 flex flex-col items-center gap-1 py-1.5"
          >
            <span className="relative">
              <Icon size={19} className={isActive ? "text-emerald-600" : "text-slate-400"} strokeWidth={isActive ? 2.5 : 2} />
              {!!it.badge && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-[3px] rounded-full bg-emerald-500 border-2 border-white text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {it.badge}
                </span>
              )}
            </span>
            <span className={`text-[9px] font-medium truncate max-w-full ${isActive ? "text-emerald-600" : "text-slate-400"}`}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
};
