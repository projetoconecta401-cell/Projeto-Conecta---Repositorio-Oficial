import { MapPin, Star, MessageSquare, History } from "lucide-react";
import { Screen, TopBar, PrimaryButton } from "../../components/ui.jsx";

/* ------------------------------------------------------------------ */
/*  MÓDULO EXTRA — PERFIL DO PROFISSIONAL E CHAT DIRETO                */
/* ------------------------------------------------------------------ */

export function ProfessionalProfileScreen({ professional: p, onBack, onMessage }) {
  const avgFromHistory = p.history.length
    ? (p.history.reduce((sum, h) => sum + h.rating, 0) / p.history.length).toFixed(1)
    : p.rating;
  return (
    <Screen>
      <TopBar title="Perfil do profissional" onBack={onBack} />
      <div className="flex-1 px-5 py-6 space-y-6">
        {/* Cabeçalho do perfil */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center text-2xl shadow-md">
            {p.avatar}
          </div>
          <h2 className="font-extrabold text-slate-800 text-[17px] mt-3 break-words">{p.name}</h2>
          <p className="text-[12.5px] text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin size={12} className="shrink-0" /> {p.city}, {p.state}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <Star size={16} className="text-teal-500" fill="currentColor" />
            <span className="font-bold text-slate-800 text-[15px]">{avgFromHistory}</span>
            <span className="text-[12px] text-slate-400">· {p.history.length} serviços avaliados</span>
          </div>
        </div>

        {/* Competências */}
        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2">Principais competências</p>
          <div className="flex flex-wrap gap-2">
            {p.skills.split("·").map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[12px] font-semibold">
                {s.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2">Sobre</p>
          <p className="text-[13px] text-slate-600 leading-relaxed break-words">{p.bio}</p>
        </div>

        {/* Histórico de serviços */}
        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
            <History size={14} /> Histórico de diárias realizadas
          </p>
          <div className="space-y-2.5">
            {p.history.map((h, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-100">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-800 text-[13.5px] leading-snug break-words min-w-0">{h.title}</p>
                  <div className="flex items-center gap-1 shrink-0 text-teal-500 font-bold text-[13px]">
                    <Star size={13} fill="currentColor" /> {h.rating}.0
                  </div>
                </div>
                <p className="text-[11.5px] text-slate-500 mt-1 truncate">{h.contractor} · {h.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botão fixo de mensagem */}
      <div className="px-5 py-4 border-t border-slate-100 bg-white">
        <PrimaryButton onClick={() => onMessage(p)}>
          <span className="flex items-center justify-center gap-2"><MessageSquare size={16} /> Enviar mensagem</span>
        </PrimaryButton>
      </div>
    </Screen>
  );
}
