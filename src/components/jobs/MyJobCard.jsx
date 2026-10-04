import { MapPin, Trash2, Clock } from "lucide-react";
import { Pill } from "../ui.jsx";

export function MyJobCard({ job, onOpen, onDelete }) {
  const statusTone = job.status === "Disponível" ? "green" : job.status === "Em Negociação" ? "orange" : job.status === "Concluída" ? "slate" : "blue";
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-full p-4">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Pill tone="blue">{job.category}</Pill>
          <Pill tone={statusTone}>{job.status}</Pill>
        </div>
        <h3 className="font-bold text-slate-800 text-[14.5px] leading-snug break-words">{job.title}</h3>
        <div className="space-y-1.5 text-[12px] text-slate-500 border-t border-slate-100 pt-3 mt-3">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{job.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{job.neighborhood} · {job.city}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between gap-2">
        <span className="text-[16px] font-extrabold text-emerald-700">R$ {job.value}</span>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onOpen(job)} className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-bold">
            Gerenciar
          </button>
          <button onClick={() => onDelete(job)} className="p-2 rounded-lg bg-red-50 text-red-500">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
