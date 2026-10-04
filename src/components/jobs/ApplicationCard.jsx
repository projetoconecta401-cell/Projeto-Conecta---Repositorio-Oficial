import { MapPin, Clock, Calendar } from "lucide-react";
import { ApplicationStatusPill } from "./ApplicationStatusPill.jsx";

export function ApplicationCard({ job, onOpen }) {
  const [dateLabel, timeLabel] = job.date.split("·").map((s) => s.trim());
  return (
    <button type="button" onClick={() => onOpen(job)} className="w-full text-left p-3.5 rounded-xl bg-white border border-slate-100">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-bold text-slate-800 text-[13.5px] leading-snug break-words min-w-0">{job.title}</p>
        <span className="shrink-0"><ApplicationStatusPill status={job.applicationStatus} /></span>
      </div>
      <p className="text-[12px] text-slate-500 truncate">{job.contractor}</p>
      <div className="flex items-center gap-3 mt-2 text-[11.5px] text-slate-500 flex-wrap">
        <span className="flex items-center gap-1 shrink-0"><Calendar size={12} /> {dateLabel}</span>
        <span className="flex items-center gap-1 shrink-0"><Clock size={12} /> {timeLabel}</span>
        <span className="flex items-center gap-1 truncate min-w-0"><MapPin size={12} className="shrink-0" /> <span className="truncate">{job.neighborhood}</span></span>
      </div>
      <p className="text-[13px] font-extrabold text-emerald-700 mt-2">R$ {job.value}</p>
    </button>
  );
}
