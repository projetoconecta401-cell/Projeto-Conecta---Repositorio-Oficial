import { Clock, CheckCircle2, CalendarX } from "lucide-react";
import { JobCard } from "../components/jobs/JobCard.jsx";
import { EmptyState, Screen, TopBar } from "../components/ui.jsx";

/* Agenda: diárias confirmadas (como profissional ou contratante) e negociações pendentes. */
export function AgendaScreen({ jobs, onOpenJob }) {
  const porData = (a, b) => (a.dateISO || "").localeCompare(b.dateISO || "");
  const confirmed = jobs
    .filter((j) => j.status === "Em Atendimento" && (j.isHired || j.isOwner))
    .sort(porData);
  const pending = jobs
    .filter((j) => (j.applicationStatus === "Em análise") || (j.isOwner && j.status === "Em Negociação"))
    .sort(porData);

  return (
    <Screen>
      <TopBar title="Minha agenda" />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 py-5 space-y-6">
        {confirmed.length === 0 && pending.length === 0 ? (
          <EmptyState icon={CalendarX} title="Agenda vazia" text="Suas diárias confirmadas e negociações em andamento aparecem aqui." />
        ) : (
          <>
            <section>
              <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" /> Confirmadas
              </p>
              {confirmed.length === 0 ? (
                <p className="text-[12.5px] text-slate-400">Nenhum compromisso confirmado.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {confirmed.map((j) => <JobCard key={j.id} job={j} onOpen={onOpenJob} />)}
                </div>
              )}
            </section>
            <section>
              <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-teal-500" /> Pendentes
              </p>
              {pending.length === 0 ? (
                <p className="text-[12.5px] text-slate-400">Nenhuma negociação pendente.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pending.map((j) => <JobCard key={j.id} job={j} onOpen={onOpenJob} />)}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Screen>
  );
}
