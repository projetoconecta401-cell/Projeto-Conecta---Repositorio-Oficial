import { MessageCircle } from "lucide-react";
import { Carregando, PrimaryButton, Screen, TopBar } from "../components/ui.jsx";
import { reais } from "../lib/vagas.js";

/* "Você foi selecionado": resumo da diária para o profissional contratado. */
export function OfficializedScreen({ job, onBack, onOpenChat }) {
  if (!job)
    return (
      <Screen>
        <TopBar title="Candidatura aceita" onBack={onBack} />
        <Carregando />
      </Screen>
    );

  const linhas = [
    { label: "Contratante", value: job.contractorName },
    { label: "Função", value: job.title },
    { label: "Data", value: job.dateLabel },
    { label: "Horário", value: job.timeLabel },
    { label: "Região", value: `${job.neighborhood} — ${job.city}/${job.state}` },
    { label: "Valor da diária", value: reais(job.value) },
    { label: "Pagamento", value: "Combinado direto com o contratante" },
  ];

  return (
    <Screen>
      <TopBar title="Candidatura aceita" onBack={onBack} />
      <div className="flex-1 w-full max-w-md mx-auto px-5 py-6 space-y-5">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-3xl">🎉</div>
          <h2 className="text-lg font-extrabold text-slate-800">Você foi selecionado!</h2>
          <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed px-4">
            Combine o endereço exato e os detalhes pelo chat. No dia, faça o check-in na tela da vaga.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
          {linhas.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3 gap-3">
              <span className="text-[12px] text-slate-400 shrink-0">{row.label}</span>
              <span className="text-[13px] font-semibold text-slate-700 text-right break-words min-w-0">{row.value}</span>
            </div>
          ))}
        </div>

        {job.details && (
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-100 text-[12.5px] text-teal-800 leading-relaxed whitespace-pre-line break-words">
            <span className="font-bold">Observações do contratante:</span> {job.details}
          </div>
        )}

        {job.candidaturaId && (
          <PrimaryButton onClick={() => onOpenChat(job.candidaturaId)}>
            <span className="flex items-center justify-center gap-2"><MessageCircle size={16} /> Conversar com o contratante</span>
          </PrimaryButton>
        )}
      </div>
    </Screen>
  );
}
