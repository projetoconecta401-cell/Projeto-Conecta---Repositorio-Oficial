import { Briefcase } from "lucide-react";
import { useState } from "react";
import { FilterDropdown } from "../../components/FilterDropdown.jsx";
import { ApplicationCard } from "../../components/jobs/ApplicationCard.jsx";
import { EmptyState, Screen, TopBar } from "../../components/ui.jsx";

export function MyApplicationsScreen({ jobs, onBack, onOpenJob }) {
  const [tab, setTab] = useState("todas");
  const myApps = jobs.filter((j) => j.applicationStatus);

  const tabs = [
    { id: "todas", label: "Todas" },
    { id: "analise", label: "Em análise" },
    { id: "confirmadas", label: "Confirmadas" },
    { id: "andamento", label: "Em andamento" },
    { id: "concluidas", label: "Concluídas" },
    { id: "nao", label: "Não selecionado" },
  ];

  const filtered = myApps.filter((j) => {
    if (tab === "analise") return j.applicationStatus === "Em análise";
    if (tab === "confirmadas") return j.applicationStatus === "Diária agendada";
    if (tab === "andamento") return j.applicationStatus === "Em andamento";
    if (tab === "concluidas") return j.applicationStatus === "Finalizada";
    if (tab === "nao") return j.applicationStatus === "Não selecionado";
    return true;
  });

  return (
    <Screen>
      <TopBar title="Minhas candidaturas" onBack={onBack} />
      <div className="w-full max-w-2xl mx-auto px-5 pt-3 pb-1">
        <FilterDropdown options={tabs} value={tab} onChange={setTab} />
      </div>
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 py-4 space-y-2.5">
        {filtered.length === 0 ? (
          <EmptyState icon={Briefcase} title="Nenhuma candidatura aqui" text='Toque em "Tenho interesse" numa vaga para se candidatar.' />
        ) : (
          filtered.map((j) => <ApplicationCard key={j.id} job={j} onOpen={onOpenJob} />)
        )}
      </div>
    </Screen>
  );
}
