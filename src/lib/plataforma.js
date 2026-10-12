/* Detecta iPhone/iPad e se o app está aberto como aplicativo instalado (PWA). */
export const ehIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const ehInstalado = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
