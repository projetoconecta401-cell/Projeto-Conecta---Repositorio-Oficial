/* ------------------------------------------------------------------ */
/*  GEOLOCALIZAÇÃO — sempre APROXIMADA (privacidade das vagas)          */
/* ------------------------------------------------------------------ */

// Distância entre duas coordenadas (fórmula de Haversine), em km.
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Arredonda para 2 casas decimais (~1,1 km): a posição exata nunca é gravada nem exibida. */
export const aproximar = (n) => Math.round(Number(n) * 100) / 100;

/** Distância (km) entre a posição do usuário e a posição aproximada da vaga, ou null. */
export function distanciaDaVaga(job, posicao) {
  if (!posicao || typeof job?.lat !== "number" || typeof job?.lng !== "number") return null;
  return haversineDistanceKm(posicao.lat, posicao.lng, job.lat, job.lng);
}

/** Texto exibido no feed e nos detalhes — nunca o endereço. */
export function textoProximidade(km) {
  if (km == null) return null;
  if (km < 1.5) return "Próximo a você";
  if (km < 10) return `A ~${Math.round(km)} km de você`;
  if (km < 100) return `A ~${Math.round(km / 5) * 5} km de você`;
  return "A mais de 100 km";
}

const CHAVE = "eifreela:posicao";

export function posicaoSalva() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE) || "null");
  } catch {
    return null;
  }
}

/** Pede a localização do aparelho e devolve só a versão arredondada. */
export function pedirPosicaoAproximada() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("Este navegador não oferece localização."));
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = { lat: aproximar(p.coords.latitude), lng: aproximar(p.coords.longitude) };
        try {
          sessionStorage.setItem(CHAVE, JSON.stringify(pos));
        } catch {
          /* armazenamento indisponível */
        }
        resolve(pos);
      },
      () => reject(new Error("Não foi possível obter sua localização. Verifique a permissão do navegador.")),
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 12000 }
    );
  });
}
