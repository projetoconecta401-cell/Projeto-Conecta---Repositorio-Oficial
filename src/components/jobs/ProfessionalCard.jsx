import { ChevronRight } from "lucide-react";
import { Avatar, Estrelas } from "../ui.jsx";
import { resumoFormacao } from "../../lib/curriculo.js";

/* Card de profissional (Erro 6): flex com gap, nome e áreas truncados. */
export function ProfessionalCard({ p, onOpen }) {
  return (
    <button
      onClick={() => onOpen(p)}
      className="w-full h-full text-left bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md active:scale-[0.99] transition flex items-center gap-3 min-w-0"
    >
      <Avatar url={p.avatar_url} nome={p.nome} size={52} />
      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <p className="font-bold text-slate-800 text-[14.5px] truncate">{p.nome}</p>
        {p.nota ? <Estrelas valor={p.nota.media} total={p.nota.total} /> : <span className="text-[11.5px] text-slate-400">Novo no EiFreela</span>}
        {p.sobre && <p className="text-[12px] text-slate-500 leading-snug line-clamp-2 break-words">{p.sobre}</p>}
        {!p.sobre && resumoFormacao(p.formacao) && <p className="text-[12px] text-slate-500 truncate">{resumoFormacao(p.formacao)}</p>}
        <div className="flex gap-1.5 flex-wrap min-w-0">
          {p.areas.slice(0, 2).map((a) => (
            <span key={a} className="max-w-full truncate px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
              {a}
            </span>
          ))}
          {p.areas.length > 2 && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">+{p.areas.length - 2}</span>}
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300 shrink-0" />
    </button>
  );
}
