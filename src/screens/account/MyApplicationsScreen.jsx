import { Briefcase } from "lucide-react";
import { useState } from "react";
import { FilterDropdown } from "../../components/FilterDropdown.jsx";
import { ApplicationCard } from "../../components/jobs/ApplicationCard.jsx";
import { Screen, TopBar } from "../../components/ui.jsx";

export function MyApplicationsScreen({ jobs, onBack, onOpenJob }) {
  const [tab, setTab] = useState("todas");
  const myApps = jobs.filter((j) => j.candidate === "Você" && j.applicationStatus);

  const tabs = [
    { id: "todas", label: "Todas" },
    { id: "analise", label: "Em análise" },
    { id: "confirmadas", label: "Confirmadas" },
    { id: "andamento", label: "Em andamento" },
    { id: "concluidas", label: "Concluídas" },
    { id: "recusadas", label: "Recusadas" },
  ];

  const filtered = myApps.filter((j) => {
    if (tab === "todas") return true;
    if (tab === "analise") return j.applicationStatus === "Em análise";
    if (tab === "confirmadas") return ["Candidatura oficializada", "Diária agendada"].includes(j.applicationStatus);
    if (tab === "andamento") return j.applicationStatus === "Em andamento";
    if (tab === "concluidas") return ["Diária concluída", "Finalizada"].includes(j.applicationStatus);
    if (tab === "recusadas") return j.applicationStatus === "Cancelada";
    return true;
  });

  return (
    <Screen>
      <TopBar title="Minhas Candidaturas" onBack={onBack} />
      <div className="px-5 pt-3 pb-1">
        <FilterDropdown options={tabs} value={tab} onChange={setTab} />
      </div>
      <div className="flex-1 px-5 py-4 space-y-2.5 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center mt-4">
            <Briefcase size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nenhuma candidatura aqui</h3>
            <p className="text-[12.5px] text-slate-500 mt-1">Quando você se candidatar a uma vaga, ela aparecerá aqui.</p>
          </div>
        ) : (
          filtered.map((j) => <ApplicationCard key={j.id} job={j} onOpen={onOpenJob} />)
        )}
      </div>
    </Screen>
  );
}
