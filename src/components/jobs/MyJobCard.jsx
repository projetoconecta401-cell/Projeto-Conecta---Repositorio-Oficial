import { MapPin, Trash2, Clock, Users } from "lucide-react";
import { Pill, toneDoStatus } from "../ui.jsx";
import { reais } from "../../lib/vagas.js";

export function MyJobCard({ job, onOpen, onDelete }) {
  return (
    <article className="w-full h-full bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 p-4 min-w-0">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-[12px] font-bold text-slate-600 truncate min-w-0">{job.category}</span>
        <Pill tone={toneDoStatus(job.status)}>{job.status}</Pill>
      </div>
      {(job.tipo !== "diaria" || job.multi) && (
        <div className="flex items-center gap-1.5 flex-wrap -mt-1">
          {job.tipo !== "diaria" && <Pill tone="blue">{job.tipoLabel}</Pill>}
          {job.multi && <Pill tone="orange">{job.livre ? "Vagas sem limite" : `${job.quantidade} vagas abertas`}</Pill>}
        </div>
      )}
      <h3 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2 break-words">{job.title}</h3>
      <div className="flex flex-col gap-1.5 text-[12.5px] text-slate-500 border-t border-slate-100 pt-3 min-w-0">
        <span className="flex items-center gap-2 min-w-0">
          <Clock size={14} className="text-slate-400 shrink-0" />
          <span className="truncate">{job.date}</span>
        </span>
        <span className="flex items-center gap-2 min-w-0">
          <MapPin size={14} className="text-slate-400 shrink-0" />
          <span className="truncate">{job.remoto ? "Remoto" : job.neighborhood} · {job.city}</span>
        </span>
        <span className="flex items-center gap-2 min-w-0">
          <Users size={14} className="text-slate-400 shrink-0" />
          <span className="truncate">{job.candidatesCount} candidato{job.candidatesCount === 1 ? "" : "s"}</span>
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        <span className="text-[17px] font-extrabold text-emerald-700 whitespace-nowrap">{reais(job.value)}<span className="text-[11.5px] font-semibold text-slate-500">{job.valorSufixo}</span></span>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onOpen(job)} className="px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-[12.5px] font-bold">
            Gerenciar
          </button>
          <button onClick={() => onDelete(job)} aria-label="Excluir vaga" className="p-2 rounded-lg bg-red-50 text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
