import { MapPin, Clock, Calendar } from "lucide-react";
import { ApplicationStatusPill } from "./ApplicationStatusPill.jsx";
import { reais } from "../../lib/vagas.js";

export function ApplicationCard({ job, onOpen }) {
  return (
    <button type="button" onClick={() => onOpen(job)} className="w-full text-left p-4 rounded-2xl bg-white border border-slate-100 flex flex-col gap-2 min-w-0">
      <div className="flex items-start justify-between gap-2 min-w-0">
        <p className="font-bold text-slate-800 text-[14px] leading-snug line-clamp-2 break-words min-w-0">{job.title}</p>
        <ApplicationStatusPill status={job.applicationStatus} />
      </div>
      <p className="text-[12px] text-slate-500 truncate">{job.contractorName}</p>
      <div className="flex items-center gap-x-3 gap-y-1 text-[12px] text-slate-500 flex-wrap min-w-0">
        <span className="flex items-center gap-1 shrink-0"><Calendar size={12} /> {job.dateLabel}</span>
        <span className="flex items-center gap-1 min-w-0"><Clock size={12} className="shrink-0" /> <span className="truncate">{job.timeLabel}</span></span>
        <span className="flex items-center gap-1 min-w-0"><MapPin size={12} className="shrink-0" /> <span className="truncate">{job.neighborhood}</span></span>
      </div>
      <p className="text-[14px] font-extrabold text-emerald-700">{reais(job.value)}</p>
    </button>
  );
}
