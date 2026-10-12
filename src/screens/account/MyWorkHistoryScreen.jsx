import { Star, History } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, Estrelas, Screen, TopBar } from "../../components/ui.jsx";
import { avaliacoesRecebidas } from "../../lib/avaliacoes.js";
import { reais } from "../../lib/vagas.js";

/* Histórico real: diárias concluídas como profissional e como contratante, com a nota recebida. */
export function MyWorkHistoryScreen({ jobs, userId, onBack, onOpenJob }) {
  const [recebidas, setRecebidas] = useState({});
  useEffect(() => {
    avaliacoesRecebidas(userId).then(setRecebidas);
  }, [userId]);

  const history = jobs
    .filter((j) => j.status === "Concluída" && (j.isHired || (j.isOwner && j.contratadoId)))
    .sort((a, b) => (b.dateISO || "").localeCompare(a.dateISO || ""));
  const notas = Object.values(recebidas).map((a) => a.nota);
  const media = notas.length ? (notas.reduce((s, n) => s + n, 0) / notas.length).toFixed(1) : "—";

  return (
    <Screen>
      <TopBar title="Histórico e avaliações" onBack={onBack} />
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 py-6 space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <History size={24} />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-slate-800 text-[15px]">
              {history.length} {history.length === 1 ? "diária concluída" : "diárias concluídas"}
            </p>
            <p className="text-[12.5px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Star size={13} className="text-amber-400" fill="currentColor" />
              Nota média recebida: <span className="font-semibold text-slate-700">{media}</span>
              {notas.length > 0 && <span className="text-slate-400">({notas.length})</span>}
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <EmptyState icon={History} title="Nenhuma diária concluída ainda" text="Quando uma diária for concluída, ela aparece aqui com a avaliação recebida." />
        ) : (
          <div className="space-y-2.5">
            {history.map((j) => {
              const nota = recebidas[j.id];
              return (
                <button key={j.id} onClick={() => onOpenJob(j)} className="w-full text-left p-4 rounded-xl bg-white border border-slate-100 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-[13.5px] leading-snug line-clamp-2 break-words min-w-0">{j.title}</p>
                    {nota ? <Estrelas valor={nota.nota} /> : <span className="text-[11px] text-slate-400 shrink-0">Sem nota</span>}
                  </div>
                  <p className="text-[11.5px] text-slate-500 truncate">
                    {j.isOwner ? "Você contratou" : j.contractorName} · {j.dateLabel} · {reais(j.value)}
                  </p>
                  {nota?.comentario && <p className="text-[12.5px] text-slate-600 italic break-words">“{nota.comentario}”</p>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Screen>
  );
}
