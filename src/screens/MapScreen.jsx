import { MapPin, SlidersHorizontal, Navigation2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { EmptyState, Screen, TopBar } from "../components/ui.jsx";
import { distanciaDaVaga, textoProximidade } from "../lib/geo.js";
import { hojeISO, reais } from "../lib/vagas.js";

/*
 * Mapa de oportunidades. Tanto a sua posição quanto a das vagas são APROXIMADAS
 * (arredondadas para ~1 km): o mapa mostra áreas, não pontos exatos.
 */
export function MapScreen({ jobs, posicao, onPedirPosicao, onOpenJob }) {
  const [radius, setRadius] = useState(20);
  const [locating, setLocating] = useState(false);
  const MAX_RADIUS = 150;
  const MIN_RADIUS = 1;
  const visualDiameter = 24 + Math.sqrt(radius / MAX_RADIUS) * (230 - 24);

  const usarLocal = async () => {
    setLocating(true);
    await onPedirPosicao();
    setLocating(false);
  };

  const hoje = hojeISO();
  const abertas = jobs.filter((j) => ["Disponível", "Em Negociação"].includes(j.status) && (!j.dateISO || j.dateISO >= hoje));
  const comDistancia = abertas.map((j) => ({ ...j, km: distanciaDaVaga(j, posicao) }));
  const proximas = comDistancia.filter((j) => j.km != null && j.km <= radius).sort((a, b) => a.km - b.km);
  const semLocal = abertas.filter((j) => j.lat == null).length;

  // Pins distribuídos dentro do círculo pela distância aproximada (ângulo áureo evita sobreposição).
  const pins = proximas.map((j, i) => {
    const ang = ((i + 1) * 137.508 * Math.PI) / 180;
    const reach = 10 + Math.min(j.km / radius, 1) * 36;
    return {
      ...j,
      top: `${Math.min(Math.max(50 + reach * Math.sin(ang), 8), 92)}%`,
      left: `${Math.min(Math.max(50 + reach * Math.cos(ang), 8), 92)}%`,
    };
  });

  return (
    <Screen>
      <TopBar title="Mapa de oportunidades" />
      <div className="w-full max-w-2xl mx-auto px-5 pt-4">
        <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
          <SlidersHorizontal size={14} /> Raio de busca: <span className="text-emerald-600">{radius} km</span>
        </p>
        <input
          type="range"
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={1}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none bg-slate-200 accent-emerald-600 cursor-pointer"
          aria-label="Raio de busca em quilômetros"
        />
        <div className="flex justify-between text-[10.5px] text-slate-400 mt-1">
          <span>{MIN_RADIUS} km</span>
          <span>{MAX_RADIUS} km</span>
        </div>

        <button
          type="button"
          onClick={usarLocal}
          disabled={locating}
          className={`w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12.5px] font-bold transition disabled:opacity-60 ${
            posicao ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200" : "bg-emerald-600 text-white border-2 border-transparent"
          }`}
        >
          <Navigation2 size={15} />
          {locating ? "Obtendo localização…" : posicao ? "Atualizar minha localização aproximada" : "Usar minha localização aproximada"}
        </button>
        <p className="text-[11px] text-slate-400 mt-2 flex items-start gap-1.5">
          <ShieldCheck size={13} className="shrink-0 mt-px text-emerald-500" /> Posições arredondadas para ~1 km. Nenhum endereço exato é exibido.
        </p>
      </div>

      <div className="w-full max-w-2xl mx-auto px-5 pt-4 pb-6">
        {!posicao ? (
          <EmptyState icon={MapPin} title="Ative sua localização" text="Para ver as vagas no mapa, permita a localização aproximada do aparelho." />
        ) : (
          <>
            <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-200 bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] bg-slate-50">
              <div
                className="absolute rounded-full border-2 border-emerald-400/40 bg-emerald-400/10 transition-[width,height] duration-150"
                style={{ width: `${visualDiameter}px`, height: `${visualDiameter}px`, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow" />
              {pins.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => onOpenJob(j)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-teal-400/30 border-2 border-teal-500 flex items-center justify-center"
                  style={{ top: j.top, left: j.left }}
                  aria-label={`${j.title} · ${textoProximidade(j.km)}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                </button>
              ))}
              <span className="absolute bottom-2 left-2 text-[10px] text-slate-500 bg-white/90 px-2 py-0.5 rounded-full">Você (aprox.)</span>
            </div>
            <p className="text-[12px] text-slate-500 mt-3">
              {proximas.length} {proximas.length === 1 ? "vaga aberta" : "vagas abertas"} em até ~{radius} km.
              {semLocal > 0 && ` ${semLocal} sem localização aproximada aparecem só no mural.`}
            </p>

            {proximas.length > 0 && (
              <div className="mt-4 space-y-2.5">
                {proximas.map((j) => (
                  <button key={j.id} type="button" onClick={() => onOpenJob(j)} className="w-full text-left p-3.5 rounded-xl bg-white border border-slate-100 flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <MapPin size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-800 text-[13.5px] leading-snug truncate">{j.title}</span>
                      <span className="block text-[11.5px] text-slate-500 truncate">
                        {textoProximidade(j.km)} · {j.neighborhood}, {j.city}
                      </span>
                    </span>
                    <span className="text-[13px] font-extrabold text-emerald-700 shrink-0">{reais(j.value)}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}
