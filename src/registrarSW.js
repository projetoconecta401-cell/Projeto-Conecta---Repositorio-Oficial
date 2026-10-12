/*
 * Registra o Service Worker (public/sw.js): é o que permite instalar o EiFreela na tela
 * inicial (Android e iOS) e receber avisos de nova vaga com o app fechado.
 * Só em produção (no "npm run dev" o cache atrapalharia as edições).
 */
export function registrarServiceWorker() {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;
  window.addEventListener("load", () => {
    const tinhaControlador = !!navigator.serviceWorker.controller;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const novo = reg.installing;
          novo?.addEventListener("statechange", () => {
            if (novo.state === "installed" && navigator.serviceWorker.controller) novo.postMessage("atualizar");
          });
        });
      })
      .catch((e) => console.warn("Service Worker não registrado:", e));
    // Versão nova publicada: recarrega uma vez para usar o código novo (não na 1ª instalação).
    let recarregou = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (recarregou || !tinhaControlador) return;
      recarregou = true;
      window.location.reload();
    });
  });
}
