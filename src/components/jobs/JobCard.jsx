import { MapPin, Clock, BadgeCheck, Bookmark, Users } from "lucide-react";
import { Pill } from "../ui.jsx";

/* ------------------------------------------------------------------ */
/*  MODULE 2 — FEED / PUBLICAÇÃO                                       */
/* ------------------------------------------------------------------ */

export function JobCard({ job, onOpen, saved = false, onToggleSave = () => {} }) {
  const statusTone = job.status === "Disponível" ? "green" : job.status === "Em Negociação" ? "orange" : job.status === "Concluída" ? "slate" : "blue";
  const isMine = job.candidate === "Você";
  const applicationLabel = job.status === "Em Atendimento" ? "Candidatado" : job.status === "Em Negociação" ? "Em análise" : null;

  return (
    <div className="relative">
      <button
        onClick={() => onToggleSave(job.id)}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border transition ${
          saved ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white/90 border-slate-200 text-slate-400"
        }`}
      >
        <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
      </button>

      <button
        onClick={() => onOpen(job)}
        className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md active:scale-[0.99] transition flex flex-col justify-between h-full p-4"
      >
        {/* Topo do card */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2.5 pr-8">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Pill tone="blue">{job.category}</Pill>
              {job.urgent && <Pill tone="orange">Urgente</Pill>}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <Pill tone={statusTone}>{job.status}</Pill>
            {isMine && applicationLabel && <Pill tone="slate">{applicationLabel}</Pill>}
          </div>

          <h3 className="font-bold text-slate-800 text-[14.5px] leading-snug break-words mt-1.5">{job.title}</h3>

          <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mt-1.5">
            <span className="font-medium text-slate-600">{job.contractor}</span>
            {job.verified && <BadgeCheck size={13} className="text-emerald-500 shrink-0" />}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-500">
              {job.experience}
            </span>
          </div>

          <div className="space-y-1.5 text-[12px] text-slate-500 border-t border-slate-100 pt-3 mt-3">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{job.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{job.neighborhood} · {job.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{job.candidatesCount} candidato{job.candidatesCount === 1 ? "" : "s"} inscrito{job.candidatesCount === 1 ? "" : "s"}</span>
            </div>
          </div>
        </div>

        {/* Rodapé do card */}
        <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Valor diária</span>
            <span className="text-[17px] font-extrabold text-emerald-700">R$ {job.value}</span>
          </div>
          <span className="bg-emerald-600 text-white text-[12px] font-bold px-4 py-2 rounded-lg">Ver oportunidade</span>
        </div>
      </button>
    </div>
  );
}
