import { useState } from "react";
import { Screen, TopBar, Field, PrimaryButton } from "../../components/ui.jsx";

export function DocumentSelection({ onNext, onBack }) {
  const [type, setType] = useState("cpf");
  return (
    <Screen>
      <TopBar title="Documento" onBack={onBack} />
      <div className="flex-1 px-6 py-6">
        <p className="text-[13px] text-slate-500 mb-4">Selecione o tipo de cadastro para continuar</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { id: "cpf", label: "Pessoa Física", sub: "CPF" },
            { id: "cnpj", label: "Empresa", sub: "CNPJ" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`p-4 rounded-2xl border-2 text-left transition ${type === t.id ? "border-teal-500 bg-teal-50/60" : "border-slate-200 bg-white"}`}
            >
              <p className="font-bold text-slate-800 text-[14px]">{t.label}</p>
              <p className="text-[12px] text-slate-500">{t.sub}</p>
            </button>
          ))}
        </div>
        <Field placeholder={type === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"} />
        <PrimaryButton className="mt-8" onClick={onNext}>Continuar</PrimaryButton>
      </div>
    </Screen>
  );
}
