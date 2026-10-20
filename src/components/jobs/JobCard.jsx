import { MapPin, Clock, Bookmark, Users, Navigation } from "lucide-react";
import { Pill, toneDoStatus } from "../ui.jsx";
import { iconeDaCategoria } from "../../data/catalogo.js";
import { distanciaDaVaga, textoProximidade } from "../../lib/geo.js";
import { reais } from "../../lib/vagas.js";
import { timeAgo } from "../../lib/time.js";
import { ApplicationStatusPill } from "./ApplicationStatusPill.jsx";

/* ------------------------------------------------------------------ */
/*  CARD DE VAGA (Erro 6)                                               */
/*  Flex em coluna com gap; título em até 2 linhas e demais textos     */
/*  truncados; mostra só a região aproximada (item 4).                  */
/* ------------------------------------------------------------------ */

export function JobCard({ job, onOpen, saved = false, onToggleSave, posicao }) {
  const Icon = iconeDaCategoria(job.category);
  const proximidade = textoProximidade(distanciaDaVaga(job, posicao));

  return (
    <article className="relative h-full">
      {onToggleSave && (
        <button
          onClick={() => onToggleSave(job.id)}
          aria-label={saved ? "Remover dos favoritos" : "Salvar nos favoritos"}
          aria-pressed={saved}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition ${
            saved ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-400"
          }`}
        >
          <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
        </button>
      )}

      <button
        onClick={() => onOpen(job)}
        className="w-full h-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md active:scale-[0.99] transition flex flex-col gap-3 p-4 min-w-0"
      >
        {/* Categoria + status */}
        <div className={`flex items-center gap-2 min-w-0 ${onToggleSave ? "pr-10" : ""}`}>
          <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Icon size={16} />
          </span>
          <span className="text-[12px] font-bold text-slate-600 truncate min-w-0">{job.category}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {job.tipo !== "diaria" && <Pill tone="blue">{job.tipoLabel}</Pill>}
          <Pill tone={toneDoStatus(job.status)}>{job.status}</Pill>
          {job.multi && <Pill tone="orange">{job.livre ? "Várias vagas" : `${job.quantidade} vagas`}</Pill>}
          {job.remoto && <Pill tone="teal">Remoto</Pill>}
          {job.isOwner && <Pill tone="teal">Sua vaga</Pill>}
          {job.applicationStatus && <ApplicationStatusPill status={job.applicationStatus} />}
        </div>

        {/* Título (até 2 linhas) e contratante */}
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2 break-words">{job.title}</h3>
          <p className="text-[12px] text-slate-500 truncate mt-0.5">{job.isOwner ? "Publicada por você" : job.contractorName}</p>
        </div>

        {/* Data, região aproximada, candidatos */}
        <div className="flex flex-col gap-1.5 text-[12.5px] text-slate-500 border-t border-slate-100 pt-3 min-w-0">
          <span className="flex items-center gap-2 min-w-0">
            <Clock size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{job.date}</span>
          </span>
          <span className="flex items-center gap-2 min-w-0">
            {proximidade ? <Navigation size={14} className="text-emerald-500 shrink-0" /> : <MapPin size={14} className="text-slate-400 shrink-0" />}
            <span className="truncate">
              {job.remoto ? `Remoto · ${job.city}/${job.state}` : (
                <>
                  {proximidade ? `${proximidade} · ` : ""}
                  {job.neighborhood} · {job.city}/{job.state}
                </>
              )}
            </span>
          </span>
          {job.isOwner && (
            <span className="flex items-center gap-2 min-w-0">
              <Users size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">
                {job.candidatesCount} candidato{job.candidatesCount === 1 ? "" : "s"}
              </span>
            </span>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-end justify-between gap-3 mt-auto pt-1">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Valor</span>
            <span className="text-[18px] font-extrabold text-emerald-700 whitespace-nowrap">{reais(job.value)}</span>
            <span className="text-[12px] font-semibold text-slate-500">{job.valorSufixo}</span>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(new Date(job.createdAt))}</span>
        </div>
      </button>
    </article>
  );
}
