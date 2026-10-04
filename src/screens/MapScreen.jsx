import { MapPin, SlidersHorizontal, Navigation2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Screen, TopBar } from "../components/ui.jsx";
import { haversineDistanceKm } from "../lib/geo.js";

export function MapScreen({ jobs, pushToast, onOpenJob }) {
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const MAX_RADIUS = 150;
  const MIN_RADIUS = 1;
  // Escala não linear (raiz quadrada) para o círculo visual: mantém boa
  // diferenciação em distâncias curtas sem estourar o quadro do mapa
  // quando o usuário seleciona valores próximos de 150 km.
  const visualDiameter = 24 + Math.sqrt(radius / MAX_RADIUS) * (230 - 24);

  const handleUseLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Este navegador não tem suporte a geolocalização.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
        pushToast({ title: "Localização obtida ✅", body: "As vagas agora mostram a distância real até você." });
      },
      () => {
        setLocating(false);
        setLocationError("Não foi possível obter sua localização. Verifique a permissão do navegador.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Quando a localização real do usuário está disponível, a distância de
  // cada vaga é recalculada com coordenadas de verdade (Haversine); caso
  // contrário, usa a distância simulada (distanceKm) dos dados mock.
  const jobsWithDistance = jobs.map((j) => {
    const distance =
      userLocation && typeof j.lat === "number" && typeof j.lng === "number"
        ? haversineDistanceKm(userLocation.lat, userLocation.lng, j.lat, j.lng)
        : j.distanceKm;
    return { ...j, effectiveDistance: distance };
  });

  const nearbyJobs = jobsWithDistance
    .filter((j) => j.status !== "Em Atendimento" && j.status !== "Concluída")
    .filter((j) => typeof j.effectiveDistance === "number" && j.effectiveDistance <= radius)
    .sort((a, b) => a.effectiveDistance - b.effectiveDistance);

  // Posiciona cada pin dentro do círculo do raio: ângulo distribuído pelo
  // ângulo áureo (evita pins empilhados) e distância do centro proporcional
  // à distância real da vaga em relação ao raio selecionado.
  const pinnedJobs = nearbyJobs.map((j) => {
    const angleRad = ((j.id * 137.508) % 360) * (Math.PI / 180);
    const distRatio = radius > 0 ? Math.min(j.effectiveDistance / radius, 1) : 0;
    const reach = 10 + distRatio * 36;
    const top = Math.min(Math.max(50 + reach * Math.sin(angleRad), 8), 92);
    const left = Math.min(Math.max(50 + reach * Math.cos(angleRad), 8), 92);
    return { ...j, top: `${top}%`, left: `${left}%` };
  });

  return (
    <Screen>
      <TopBar title="Mapa de Oportunidades" />
      <div className="px-5 pt-4">
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
          onClick={handleUseLocation}
          disabled={locating}
          className={`w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12.5px] font-bold transition ${
            userLocation ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200" : "bg-slate-100 text-slate-600 border-2 border-transparent"
          } disabled:opacity-60`}
        >
          <Navigation2 size={15} />
          {locating ? "Obtendo localização..." : userLocation ? "Localização atual em uso" : "Usar minha localização atual"}
        </button>
        {locationError && (
          <p className="text-[11.5px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
            <AlertTriangle size={12} /> {locationError}
          </p>
        )}
      </div>

      <div className="px-5 pt-4 flex-1 overflow-y-auto pb-6">
        <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-200 bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] bg-slate-50">
          <div
            className="absolute rounded-full border-2 border-emerald-400/40 bg-emerald-400/10 transition-[width,height] duration-150"
            style={{
              width: `${visualDiameter}px`, height: `${visualDiameter}px`,
              top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow" />
          {pinnedJobs.map((j) => (
            <button
              key={j.id}
              type="button"
              onClick={() => onOpenJob?.(j)}
              className="absolute -translate-x-1/2 -translate-y-full transition-all duration-200"
              style={{ top: j.top, left: j.left }}
              aria-label={`${j.title} · ${j.effectiveDistance.toFixed(1)} km`}
            >
              <MapPin size={26} className="text-teal-500 drop-shadow" fill="#99f6e4" />
            </button>
          ))}
          <span className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-white/80 px-2 py-0.5 rounded-full">
            {userLocation ? "Baseado na sua localização" : "Todo o Brasil"}
          </span>
        </div>
        <p className="text-[12px] text-slate-500 mt-3">
          {nearbyJobs.length} {nearbyJobs.length === 1 ? "vaga aberta" : "vagas abertas"} dentro de {radius} km.
        </p>

        {nearbyJobs.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {nearbyJobs.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => onOpenJob?.(j)}
                className="w-full text-left p-3.5 rounded-xl bg-white border border-slate-100 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 text-[13px] leading-snug break-words">{j.title}</p>
                  <p className="text-[11.5px] text-slate-500 truncate">{j.neighborhood} — {j.city}/{j.state} · {j.effectiveDistance.toFixed(1)} km</p>
                </div>
                <p className="text-[13px] font-extrabold text-emerald-700 shrink-0">R$ {j.value}</p>
              </button>
            ))}
          </div>
        )}


        <button
          onClick={() =>
            pushToast({ title: "🔥 Vaga urgente perto de você!", body: "Garçom para evento corporativo · a 1.8 km · R$ 180" })
          }
          className="w-full mt-5 py-3 rounded-xl border-2 border-dashed border-teal-300 text-teal-600 font-semibold text-[13px]"
        >
          Simular alerta de vaga urgente
        </button>
      </div>
    </Screen>
  );
}
