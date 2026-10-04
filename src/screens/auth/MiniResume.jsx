import { Check, ImagePlus } from "lucide-react";
import { useState } from "react";
import {
  Screen, TopBar, Field, PrimaryButton, SecondaryButton, UploadBox
} from "../../components/ui.jsx";

export const SKILL_OPTIONS = [
  "Garçom", "Bartender", "Cozinheiro(a)", "Recepção", "Montagem de eventos",
  "Design Gráfico", "Marketing Digital", "Edição de vídeo",
  "Maquiagem", "Cabeleireiro(a)", "Manicure/Pedicure",
  "Pedreiro(a)", "Pintor(a)", "Elétrica básica", "Encanamento",
  "Limpeza", "Motorista", "Entregas",
];

export function MiniResume({ onNext, onBack, onSkip }) {
  const [photo, setPhoto] = useState(false);
  const [skills, setSkills] = useState([]);
  const toggleSkill = (s) =>
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <Screen>
      <TopBar title="Minicurrículo (opcional)" onBack={onBack} />
      <div className="flex-1 px-6 py-6 space-y-4">
        <p className="text-[13px] text-slate-500">
          Aumente suas chances de ser chamado. Esta etapa é opcional e pode ser preenchida depois no seu perfil.
        </p>
        <UploadBox label="Foto de perfil" hint="Uma boa foto aumenta a confiança" icon={ImagePlus} done={photo} onClick={() => setPhoto(true)} />
        <textarea
          rows={3}
          placeholder="Breve histórico profissional (ex: 3 anos como garçom em eventos...)"
          className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />

        <div>
          <p className="text-[13px] font-bold text-slate-700 mb-2">Principais competências</p>
          <p className="text-[11.5px] text-slate-400 mb-2.5">Selecione quantas quiser ou digite outras abaixo</p>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((s) => {
              const active = skills.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold border transition ${
                    active ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  {active && <Check size={12} className="inline mr-1 -mt-0.5" />}
                  {s}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <Field placeholder="Outras competências (separadas por vírgula)" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <SecondaryButton onClick={onSkip}>Pular</SecondaryButton>
          <PrimaryButton onClick={onNext}>Salvar</PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}
