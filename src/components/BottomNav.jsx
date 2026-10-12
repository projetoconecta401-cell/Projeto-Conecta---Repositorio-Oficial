import { User, MapPin, Bell, Calendar, Briefcase, MessageSquare } from "lucide-react";

/* Menu inferior fixo (respeita a barra do iPhone e fica centralizado no computador). */
export const BottomNav = ({ active, setScreen, unreadConversations, unreadNotifications }) => {
  const items = [
    { id: "feed", label: "Início", icon: Briefcase },
    { id: "map", label: "Mapa", icon: MapPin },
    { id: "chatList", label: "Chat", icon: MessageSquare, badge: unreadConversations },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "notifs", label: "Alertas", icon: Bell, badge: unreadNotifications },
    { id: "account", label: "Perfil", icon: User },
  ];
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 w-full max-w-md md:max-w-3xl lg:max-w-5xl bg-white/95 backdrop-blur border-t border-slate-100 px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-between"
    >
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setScreen(it.id)}
            aria-current={isActive ? "page" : undefined}
            className="flex-1 min-w-0 flex flex-col items-center gap-1 py-1.5"
          >
            <span className="relative">
              <Icon size={20} className={isActive ? "text-emerald-600" : "text-slate-400"} strokeWidth={isActive ? 2.5 : 2} />
              {!!it.badge && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-[3px] rounded-full bg-emerald-500 border-2 border-white text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {it.badge > 9 ? "9+" : it.badge}
                </span>
              )}
            </span>
            <span className={`text-[10px] font-medium truncate max-w-full ${isActive ? "text-emerald-600" : "text-slate-400"}`}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
