import { useEffect, useState } from "react";
import { supabase } from "./supabase.js";

/*
 * "Online agora" com o Realtime Presence: cada conta logada entra no canal "online"
 * enquanto o app está aberto e visível. Também grava "visto por último" no perfil
 * (função registrar_visto) para mostrar quando a pessoa usou o app pela última vez.
 */

let canal = null;
let online = new Set();
const ouvintes = new Set();
const avisar = () => ouvintes.forEach((f) => f(online));

export function iniciarPresenca(userId) {
  if (!userId || canal) return () => {};

  const registrar = () => supabase.rpc("registrar_visto").then(() => {}, () => {});
  const visivel = () => document.visibilityState === "visible";

  canal = supabase.channel("online", { config: { presence: { key: userId } } });
  canal
    .on("presence", { event: "sync" }, () => {
      online = new Set(Object.keys(canal?.presenceState() ?? {}));
      avisar();
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED" && visivel()) canal.track({ em: new Date().toISOString() }).catch(() => {});
    });

  registrar();
  const timer = setInterval(() => visivel() && registrar(), 60_000);
  const aoMudarVisibilidade = () => {
    if (!canal) return;
    if (visivel()) {
      canal.track({ em: new Date().toISOString() }).catch(() => {});
    } else {
      canal.untrack().catch(() => {});
    }
    registrar();
  };
  document.addEventListener("visibilitychange", aoMudarVisibilidade);

  return () => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", aoMudarVisibilidade);
    if (canal) supabase.removeChannel(canal);
    canal = null;
    online = new Set();
    avisar();
  };
}

/** Conjunto de ids online agora (atualiza sozinho). */
export function useOnline() {
  const [ids, setIds] = useState(online);
  useEffect(() => {
    const f = (s) => setIds(new Set(s));
    ouvintes.add(f);
    f(online);
    return () => ouvintes.delete(f);
  }, []);
  return ids;
}

/** "Visto por último hoje às 14:32" / "ontem às 09:10" / "em 05/10". */
export function textoVistoEm(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  const mesmoDia = (a, b) => a.toDateString() === b.toDateString();
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (mesmoDia(d, hoje)) return `Visto por último hoje às ${hora}`;
  if (mesmoDia(d, ontem)) return `Visto por último ontem às ${hora}`;
  return `Visto por último em ${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
}
