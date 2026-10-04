import { Bell } from "lucide-react";
import { Screen, TopBar } from "../components/ui.jsx";

export function NotificationsScreen({ notifications }) {
  return (
    <Screen>
      <TopBar title="Notificações" />
      <div className="flex-1 px-5 py-4 space-y-2.5">
        {notifications.length === 0 && <p className="text-[13px] text-slate-400 text-center mt-10">Nenhuma notificação ainda.</p>}
        {notifications.map((n, i) => (
          <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0">
              <Bell size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-slate-800">{n.title}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
