import { Star } from "lucide-react";
import { Screen, TopBar, PrimaryButton } from "../components/ui.jsx";

/* ------------------------------------------------------------------ */
/*  MODULE 5 — CHAT / PIX / AVALIAÇÃO                                  */
/* ------------------------------------------------------------------ */

export function PostJobSummaryScreen({ jobs, onDone }) {
  const completed = jobs.filter((j) => j.candidate === "Você" && j.status === "Concluída");
  const totalReceived = completed.reduce((sum, j) => sum + (Number(j.value) || 0), 0);
  const ratedJobs = completed.filter((j) => j.rating?.stars);
  const avgRating = ratedJobs.length
    ? (ratedJobs.reduce((sum, j) => sum + j.rating.stars, 0) / ratedJobs.length).toFixed(1)
    : "—";

  return (
    <Screen>
      <TopBar title="Diária concluída" onBack={onDone} />
      <div className="flex-1 px-6 py-10 flex flex-col items-center text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-lg font-extrabold text-slate-800">Mais uma diária concluída!</h2>
        <p className="text-[13px] text-slate-500 mt-2 leading-relaxed px-2">
          Você já realizou {completed.length} {completed.length === 1 ? "diária" : "diárias"} pela Conexão Free.
          Seu perfil está ficando mais completo.
        </p>

        <div className="grid grid-cols-3 gap-2.5 w-full mt-7">
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[18px] font-extrabold text-emerald-700">{completed.length}</p>
            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">diárias realizadas</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[18px] font-extrabold text-emerald-700">R$ {totalReceived}</p>
            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">recebidos</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[18px] font-extrabold text-emerald-700 flex items-center justify-center gap-1">
              <Star size={14} fill="currentColor" /> {avgRating}
            </p>
            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">média das avaliações</p>
          </div>
        </div>

        <PrimaryButton className="mt-8" onClick={onDone}>Voltar ao início</PrimaryButton>
      </div>
    </Screen>
  );
}
