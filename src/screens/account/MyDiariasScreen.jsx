import { MapPin, CalendarCheck } from "lucide-react";
import { ApplicationCard } from "../../components/jobs/ApplicationCard.jsx";
import { EmptyState, PrimaryButton, Screen, TopBar } from "../../components/ui.jsx";
import { reais } from "../../lib/vagas.js";

export function MyDiariasScreen({ jobs, onBack, onOpenJob }) {
  const myDiarias = jobs
    .filter((j) => ["Diária agendada", "Em andamento"].includes(j.applicationStatus))
    .sort((a, b) => (a.dateISO || "").localeCompare(b.dateISO || ""));
  const next = myDiarias[0];
  return (
    <Screen>
      <TopBar title="Minhas diárias" onBack={onBack} />
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 py-5 space-y-6">
        {!next ? (
          <EmptyState icon={CalendarCheck} title="Nenhuma diária agendada" text="Quando um contratante aceitar sua candidatura, a diária aparece aqui." />
        ) : (
          <>
            <div>
              <p className="text-[12.5px] font-bold text-slate-600 mb-2">Próxima diária</p>
              <div className="p-4 rounded-2xl bg-white border-2 border-emerald-200 space-y-1">
                <p className="font-extrabold text-slate-800 text-[15px] leading-snug break-words">{next.title}</p>
                <p className="text-[13px] text-slate-500 truncate">{next.contractorName}</p>
                <p className="text-[13px] text-slate-500">{next.date}</p>
                <p className="text-[13px] font-extrabold text-emerald-700">{reais(next.value)}</p>
                <p className="text-[12px] text-slate-500 flex items-center gap-1 min-w-0">
                  <MapPin size={12} className="shrink-0" /> <span className="truncate">{next.neighborhood} — {next.city}</span>
                </p>
                <PrimaryButton className="!mt-3.5" onClick={() => onOpenJob(next)}>Ver detalhes</PrimaryButton>
              </div>
            </div>
            <div>
              <p className="text-[12.5px] font-bold text-slate-600 mb-2">Todas as diárias agendadas</p>
              <div className="space-y-2.5">
                {myDiarias.map((j) => <ApplicationCard key={j.id} job={j} onOpen={onOpenJob} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
