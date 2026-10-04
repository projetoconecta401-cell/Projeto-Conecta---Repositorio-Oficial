import { Star, ChevronRight } from "lucide-react";

export function ProfessionalCard({ p, onOpen }) {
  return (
    <button
      onClick={() => onOpen(p)}
      className="w-full h-full text-left bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md active:scale-[0.99] transition flex items-center gap-3"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center shrink-0">{p.avatar}</div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-800 text-[14px] truncate">{p.name}</p>
        <p className="text-[12px] text-slate-500 truncate">{p.skills}</p>
      </div>
      <div className="flex items-center gap-1 text-[13px] font-bold text-teal-500 shrink-0">
        <Star size={14} fill="currentColor" /> {p.rating}
      </div>
      <ChevronRight size={16} className="text-slate-300 shrink-0" />
    </button>
  );
}
