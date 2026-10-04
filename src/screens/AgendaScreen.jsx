import { Clock, CheckCircle2 } from "lucide-react";
import { JobCard } from "../components/jobs/JobCard.jsx";
import { Screen, TopBar } from "../components/ui.jsx";

export function AgendaScreen({ jobs, onOpenJob }) {
  const confirmed = jobs.filter((j) => j.status === "Em Atendimento");
  const pending = jobs.filter((j) => j.status === "Em Negociação");
  return (
    <Screen>
      <TopBar title="Minha Agenda" />
      <div className="flex-1 px-5 py-5 space-y-6">
        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" /> Confirmados</p>
          <div className="space-y-2.5">
            {confirmed.length === 0 && <p className="text-[12.5px] text-slate-400">Nenhum compromisso confirmado.</p>}
            {confirmed.map((j) => <JobCard key={j.id} job={j} onOpen={onOpenJob} />)}
          </div>
        </div>
        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Clock size={14} className="text-teal-500" /> Pendentes</p>
          <div className="space-y-2.5">
            {pending.length === 0 && <p className="text-[12.5px] text-slate-400">Nenhuma negociação pendente.</p>}
            {pending.map((j) => <JobCard key={j.id} job={j} onOpen={onOpenJob} />)}
          </div>
        </div>
      </div>
    </Screen>
  );
}
