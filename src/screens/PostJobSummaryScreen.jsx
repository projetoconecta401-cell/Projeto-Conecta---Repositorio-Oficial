import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { PrimaryButton, Screen, TopBar } from "../components/ui.jsx";
import { avaliacoesRecebidas } from "../lib/avaliacoes.js";
import { reais } from "../lib/vagas.js";

/* Resumo depois de concluir e avaliar uma diária (dados reais da conta). */
export function PostJobSummaryScreen({ jobs, userId, onDone }) {
  const [media, setMedia] = useState("—");
  useEffect(() => {
    avaliacoesRecebidas(userId).then((r) => {
      const notas = Object.values(r).map((a) => a.nota);
      if (notas.length) setMedia((notas.reduce((s, n) => s + n, 0) / notas.length).toFixed(1));
    });
  }, [userId]);

  const completed = jobs.filter((j) => j.isHired && j.status === "Concluída");
  const total = completed.reduce((sum, j) => sum + (Number(j.value) || 0), 0);

  return (
    <Screen>
      <TopBar title="Diária concluída" onBack={onDone} />
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-10 flex flex-col items-center text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-lg font-extrabold text-slate-800">Mais uma diária concluída!</h2>
        <p className="text-[13px] text-slate-500 mt-2 leading-relaxed px-2">
          Você já realizou {completed.length} {completed.length === 1 ? "diária" : "diárias"} pelo EiFreela. Seu perfil está ficando mais forte.
        </p>
        <div className="grid grid-cols-3 gap-2.5 w-full mt-7">
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 min-w-0">
            <p className="text-[18px] font-extrabold text-emerald-700">{completed.length}</p>
            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">diárias realizadas</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 min-w-0">
            <p className="text-[15px] font-extrabold text-emerald-700 truncate">{reais(total)}</p>
            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">em diárias</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 min-w-0">
            <p className="text-[18px] font-extrabold text-emerald-700 flex items-center justify-center gap-1">
              <Star size={14} fill="currentColor" /> {media}
            </p>
            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">sua nota média</p>
          </div>
        </div>
        <PrimaryButton className="mt-8" onClick={onDone}>Voltar ao início</PrimaryButton>
      </div>
    </Screen>
  );
}
