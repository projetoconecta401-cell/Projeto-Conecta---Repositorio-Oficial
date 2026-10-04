import { Star, History } from "lucide-react";
import { Screen, TopBar } from "../../components/ui.jsx";
import { MY_WORK_HISTORY } from "../../data/mock.js";

export function MyWorkHistoryScreen({ onBack }) {
  const history = MY_WORK_HISTORY;
  const avgRating = history.length
    ? (history.reduce((sum, h) => sum + h.rating, 0) / history.length).toFixed(1)
    : "—";
  return (
    <Screen>
      <TopBar title="Histórico de Trabalho" onBack={onBack} />
      <div className="flex-1 px-5 py-6 space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <History size={24} />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-slate-800 text-[15px]">{history.length} serviços realizados</p>
            <p className="text-[12.5px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Star size={13} className="text-teal-500" fill="currentColor" />
              Nota média: <span className="font-semibold text-slate-700">{avgRating}</span>
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <History size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nenhum serviço concluído ainda</h3>
            <p className="text-[12.5px] text-slate-500 mt-1">
              Quando você concluir uma diária, ela aparecerá aqui com a avaliação recebida.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <History size={14} /> Todos os serviços que você já realizou
            </p>
            <div className="space-y-2.5">
              {history.map((h, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-[13.5px] leading-snug break-words min-w-0">{h.title}</p>
                    <div className="flex items-center gap-1 shrink-0 text-teal-500 font-bold text-[13px]">
                      <Star size={13} fill="currentColor" /> {h.rating}.0
                    </div>
                  </div>
                  <p className="text-[11.5px] text-slate-500 mt-1 truncate">{h.contractor} · {h.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}
