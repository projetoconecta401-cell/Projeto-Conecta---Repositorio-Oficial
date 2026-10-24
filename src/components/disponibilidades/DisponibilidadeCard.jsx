import { CalendarDays, Clock, Image as ImageIcon, MapPin, MessageCircle } from "lucide-react";
import { Avatar, Pill } from "../ui.jsx";
import { STATUS, statusReal, textoDias, textoHorario, textoModalidades, textoPeriodo, textoPreco } from "../../lib/disponibilidades.js";
import { timeAgo } from "../../lib/time.js";

/* Card do mural (contratante) ou da lista "Minhas ofertas" (dono, com ações). */
export function DisponibilidadeCard({ d, autor, onOpen, onInteresse, acoes }) {
  const st = statusReal(d);
  const capa = d.fotosUrl?.[0];
  return (
    <article className="h-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-w-0">
      <button type="button" onClick={onOpen} className="text-left flex flex-col min-w-0 flex-1">
        {capa ? (
          <div className="relative h-36 bg-slate-100">
            <img src={capa} alt="" className="w-full h-full object-cover" loading="lazy" />
            {d.fotosUrl.length > 1 && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-semibold flex items-center gap-1">
                <ImageIcon size={11} /> {d.fotosUrl.length}
              </span>
            )}
          </div>
        ) : null}
        <div className="p-4 flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Pill tone="teal">{d.categoria}</Pill>
            {acoes && <Pill tone={STATUS[st]?.tom ?? "slate"}>{STATUS[st]?.t ?? st}</Pill>}
            {d.modalidades?.includes("remoto") && <Pill tone="blue">Remoto</Pill>}
          </div>
          <h3 className="font-extrabold text-slate-800 text-[15px] leading-snug break-words">{d.titulo}</h3>
          {d.descricao && <p className="text-[12.5px] text-slate-500 leading-snug line-clamp-2 break-words">{d.descricao}</p>}
          <div className="flex flex-col gap-1 text-[12px] text-slate-600">
            <span className="flex items-center gap-1.5 min-w-0"><MapPin size={13} className="shrink-0 text-slate-400" /> <span className="truncate">{d.cidade}/{d.uf}{textoModalidades(d.modalidades) ? ` · ${textoModalidades(d.modalidades)}` : ""}</span></span>
            <span className="flex items-center gap-1.5 min-w-0"><CalendarDays size={13} className="shrink-0 text-slate-400" /> <span className="truncate">{textoPeriodo(d)} · {textoDias(d.dias_semana)}</span></span>
            <span className="flex items-center gap-1.5 min-w-0"><Clock size={13} className="shrink-0 text-slate-400" /> <span className="truncate">{textoHorario(d)}</span></span>
          </div>
          <div className="flex items-end justify-between gap-2 mt-1">
            <p className="text-[16px] font-extrabold text-emerald-700">{textoPreco(d)}</p>
            <p className="text-[11px] text-slate-400 shrink-0">{timeAgo(new Date(d.criado_em))}</p>
          </div>
          {autor && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 min-w-0">
              <Avatar url={autor.avatar_url} nome={autor.nome} size={26} />
              <span className="text-[12.5px] font-semibold text-slate-700 truncate">{autor.nome}</span>
            </div>
          )}
        </div>
      </button>
      {onInteresse && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onOpen} className="py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold">Ver detalhes</button>
          <button type="button" onClick={onInteresse} className="py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold flex items-center justify-center gap-1.5">
            <MessageCircle size={15} /> Tenho interesse
          </button>
        </div>
      )}
      {acoes && <div className="px-4 pb-4 flex flex-wrap gap-2">{acoes}</div>}
    </article>
  );
}
