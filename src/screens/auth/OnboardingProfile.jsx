import { Building2, UserCheck } from "lucide-react";
import { useState } from "react";
import { Screen, PrimaryButton } from "../../components/ui.jsx";

export function OnboardingProfile({ onSelect }) {
  const [sel, setSel] = useState(null);
  const options = [
    { id: "contratar", title: "Quero Contratar", desc: "Publicar vagas e encontrar profissionais para meus serviços.", icon: Building2 },
    { id: "trabalhar", title: "Quero Trabalhar", desc: "Encontrar serviços e diárias disponíveis perto de mim.", icon: UserCheck },
  ];
  return (
    <Screen>
      <div className="flex-1 flex flex-col px-6 py-10 justify-center">
        <h2 className="text-xl font-extrabold text-slate-800 text-center">Como você vai usar a Conexão Free?</h2>
        <p className="text-[13px] text-slate-500 text-center mt-1.5 mb-8">Você poderá alternar isso a qualquer momento no seu perfil</p>
        <div className="space-y-3">
          {options.map((o) => {
            const Icon = o.icon;
            const active = sel === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setSel(o.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 flex items-center gap-4 transition ${
                  active ? "border-emerald-600 bg-emerald-50/60" : "border-slate-200 bg-white"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-[15px]">{o.title}</p>
                  <p className="text-[12.5px] text-slate-500 mt-0.5 leading-snug">{o.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        <PrimaryButton className="mt-8" disabled={!sel} onClick={() => onSelect(sel)}>
          Continuar
        </PrimaryButton>
      </div>
    </Screen>
  );
}
