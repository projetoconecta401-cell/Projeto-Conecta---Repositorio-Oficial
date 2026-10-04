import { X, Calendar } from "lucide-react";
import { useState } from "react";
import { PERIODS, CITIES, STATES } from "../../data/mock.js";
import { PrimaryButton, SecondaryButton } from "../ui.jsx";

export function FilterModal({ city, state, minValue, period, maxDistance, date, onClose, onApply }) {
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
    <div className="absolute inset-0 z-50 bg-black/40 flex items-end">
      <div className="w-full bg-white rounded-t-3xl p-6 max-h-[88%] overflow-y-auto">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-extrabold text-slate-800">Filtrar vagas</h2>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Cidade</p>
              <select
                value={localCity}
                onChange={(e) => setLocalCity(e.target.value)}
                className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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
                className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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
              className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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
                className="w-full py-3 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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
            <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Distância máxima</p>
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
        <div className="flex gap-3 mt-6">
          <SecondaryButton onClick={clearAll}>Limpar</SecondaryButton>
          <PrimaryButton onClick={() => onApply({ city: localCity, state: localState, minValue: localMinValue, period: localPeriod, maxDistance: localMaxDistance, date: localDate })}>
            Aplicar filtros
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
