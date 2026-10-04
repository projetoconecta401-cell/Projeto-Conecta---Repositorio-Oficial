import { MapPin } from "lucide-react";
import { ApplicationCard } from "../../components/jobs/ApplicationCard.jsx";
import { Screen, TopBar, PrimaryButton } from "../../components/ui.jsx";

export function MyDiariasScreen({ jobs, onBack, onOpenJob }) {
  const myDiarias = jobs.filter((j) => j.candidate === "Você" && ["Diária agendada", "Em andamento"].includes(j.applicationStatus));
  const next = myDiarias[0];
  return (
    <Screen>
      <TopBar title="Minhas Diárias" onBack={onBack} />
      <div className="flex-1 px-5 py-5 space-y-6">
        {next && (
          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-2">Próxima diária</p>
            <div className="p-4 rounded-2xl bg-white border-2 border-emerald-200">
              <p className="font-extrabold text-slate-800 text-[15px] leading-snug break-words">{next.title} — {next.contractor}</p>
              <p className="text-[13px] text-slate-500 mt-1">{next.date}</p>
              <p className="text-[13px] font-extrabold text-emerald-700 mt-1">R$ {next.value}</p>
              <p className="text-[12px] text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12} className="shrink-0" /> {next.neighborhood} — {next.city}</p>
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className={`w-2 h-2 rounded-full ${next.applicationStatus === "Em andamento" ? "bg-blue-500" : "bg-emerald-500"}`} />
                <span className="text-[12px] font-semibold text-slate-600">
                  {next.applicationStatus === "Em andamento" ? "Em andamento" : "Confirmada"}
                </span>
              </div>
              <PrimaryButton className="mt-3.5" onClick={() => onOpenJob(next)}>Ver detalhes</PrimaryButton>
            </div>
          </div>
        )}

        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2">Todas as diárias agendadas</p>
          {myDiarias.length === 0 ? (
            <p className="text-[12.5px] text-slate-400">Nenhuma diária agendada no momento.</p>
          ) : (
            <div className="space-y-2.5">
              {myDiarias.map((j) => <ApplicationCard key={j.id} job={j} onOpen={onOpenJob} />)}
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}
