import { Calendar } from "lucide-react";
import { useState } from "react";
import { PERIODS, STATES } from "../../data/catalogo.js";
import { PrimaryButton, SecondaryButton, Sheet } from "../ui.jsx";

export function FilterModal({ cities = [], temPosicao, city, state, minValue, period, maxDistance, date, onClose, onApply }) {
  const CITIES = ["Todas", ...cities];
  const [localCity, setLocalCity] = useState(city);
  const [localState, setLocalState] = useState(state);
  const [localMinValue, setLocalMinValue] = useState(minValue);
  const [localPeriod, setLocalPeriod] = useState(period);
  const [localMaxDistance, setLocalMaxDistance] = useState(maxDistance);
  const [localDate, setLocalDate] = useState(date);

  const clearAll = () => {
    setLocalCity("Todas");
    setLocalState("Todos");
    setLocalMinValue("");
    setLocalPeriod("Qualquer");
    setLocalMaxDistance("Qualquer");
    setLocalDate("");
  };

  return (
    <Sheet
      title="Filtrar vagas"
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <SecondaryButton onClick={clearAll}>Limpar</SecondaryButton>
          <PrimaryButton onClick={() => onApply({ city: localCity, state: localState, minValue: localMinValue, period: localPeriod, maxDistance: localMaxDistance, date: localDate })}>
            Aplicar filtros
          </PrimaryButton>
        </div>
      }
    >
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Cidade</p>
              <select
                value={localCity}
                onChange={(e) => setLocalCity(e.target.value)}
                className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Estado</p>
              <select
                value={localState}
                onChange={(e) => setLocalState(e.target.value)}
                className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Valor mínimo da diária (R$)</p>
            <input
              type="number"
              min="0"
              placeholder="Ex: 150"
              value={localMinValue}
              onChange={(e) => setLocalMinValue(e.target.value)}
              className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Data do serviço</p>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
                className="w-full py-3 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            {localDate && (
              <button
                type="button"
                onClick={() => setLocalDate("")}
                className="text-[11.5px] text-emerald-600 font-semibold mt-1.5"
              >
                Limpar data
              </button>
            )}
          </div>

          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Período do dia</p>
            <div className="flex gap-2">
              {["Qualquer", ...PERIODS].map((p) => (
                <button
                  key={p}
                  onClick={() => setLocalPeriod(p)}
                  className={`flex-1 py-2 rounded-xl text-[12.5px] font-bold border-2 transition ${
                    localPeriod === p ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Distância máxima (aproximada)</p>
            {!temPosicao && <p className="text-[11.5px] text-slate-400 mb-1.5">Ative sua localização na tela inicial para usar este filtro.</p>}
            <div className="flex gap-2">
              {["Qualquer", 5, 10, 20].map((d) => (
                <button
                  key={d}
                  onClick={() => setLocalMaxDistance(d)}
                  className={`flex-1 py-2 rounded-xl text-[12.5px] font-bold border-2 transition ${
                    localMaxDistance === d ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {d === "Qualquer" ? d : `${d} km`}
                </button>
              ))}
            </div>
          </div>
        </div>
    </Sheet>
  );
}
