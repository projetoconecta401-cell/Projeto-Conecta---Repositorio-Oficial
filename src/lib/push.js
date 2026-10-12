import { supabase } from "./supabase.js";
import { ehInstalado, ehIOS } from "./plataforma.js";

export const VAPID_PUBLICA =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  "BG4tIQDhB5S5vnffVr0lqRIWJuomV0h1eDe4jM2hZnYKWg0z2hGKRV9L19qsk8bDrenm6HkbvRU0a4vL2CuX8-g";

function base64UrlParaBytes(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** Situação do push neste aparelho: "ativo" | "inativo" | "negado" | "instalar-ios" | "sem-suporte". */
export async function situacaoPush() {
  if (ehIOS() && !ehInstalado()) return "instalar-ios";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "sem-suporte";
  if (Notification.permission === "denied") return "negado";
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "ativo" : "inativo";
}

/** Pede permissão, inscreve o aparelho e grava no Supabase (função salvar_inscricao_push). */
export async function ativarPush() {
  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") throw new Error("Permissão de notificação não concedida.");
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlParaBytes(VAPID_PUBLICA),
    });
  }
  const json = sub.toJSON();
  const { error } = await supabase.rpc("salvar_inscricao_push", {
    p_endpoint: json.endpoint,
    p_p256dh: json.keys.p256dh,
    p_auth: json.keys.auth,
  });
  if (error) throw new Error("Não foi possível salvar a inscrição de notificações.");
}

export async function desativarPush() {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await supabase.from("push_inscricoes").delete().eq("endpoint", sub.endpoint);
    await sub.unsubscribe();
  }
}

/** Mostra um aviso do sistema mesmo com o app aberto em segundo plano. */
export async function avisoDoSistema(titulo, corpo, url = "/") {
  try {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (document.visibilityState === "visible") return; // o toast do app já aparece
    const reg = await navigator.serviceWorker.getRegistration();
    await reg?.showNotification(titulo, { body: corpo, icon: "/icons/icon-192.png", tag: url, data: { url } });
  } catch {
    /* sem suporte */
  }
}
