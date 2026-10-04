import { Screen, TopBar, PrimaryButton } from "../components/ui.jsx";

export function OfficializedScreen({ job, onBack, onConfirm }) {
  const confirmed = job.applicationStatus === "Diária agendada";
  const [dateLabel, timeLabel] = job.date.split("·").map((s) => s.trim());

  return (
    <Screen>
      <TopBar title="Candidatura Oficializada" onBack={onBack} />
      <div className="flex-1 px-5 py-6 space-y-5">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-3xl">
            🎉
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">Candidatura Oficializada</h2>
          <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed px-4">
            Parabéns! Você foi selecionado para esta diária.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
          {[
            { label: "Empresa", value: job.contractor },
            { label: "Cargo/função", value: job.title },
            { label: "Data", value: dateLabel },
            { label: "Horário", value: timeLabel },
            { label: "Local", value: `${job.neighborhood} — ${job.city}/${job.state}` },
            { label: "Valor da diária", value: `R$ ${job.value}` },
            { label: "Forma de pagamento", value: "PIX, ao final do serviço" },
            { label: "Responsável", value: job.contractor },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 gap-3">
              <span className="text-[12px] text-slate-400 shrink-0">{row.label}</span>
              <span className="text-[13px] font-semibold text-slate-700 text-right break-words">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-100 text-[12px] text-teal-700 leading-relaxed">
          <span className="font-bold">Observações da empresa:</span> chegue com 15 minutos de antecedência e traga
          documento com foto para conferência na entrada.
        </div>

        <div className="flex items-center gap-2 justify-center">
          <span className={`w-2 h-2 rounded-full ${confirmed ? "bg-emerald-500" : "bg-amber-400"}`} />
          <p className="text-[12.5px] font-semibold text-slate-500">
            {confirmed ? "Diária confirmada ✅" : "Aguardando sua confirmação"}
          </p>
        </div>

        {!confirmed && (
          <PrimaryButton onClick={() => onConfirm(job)}>
            Confirmar participação
          </PrimaryButton>
        )}
      </div>
    </Screen>
  );
}
