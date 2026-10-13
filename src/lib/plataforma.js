/* Detecta iPhone/iPad e se o app está aberto como aplicativo instalado (PWA). */
export const ehIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const ehAndroid = () => /android/i.test(navigator.userAgent);

export const ehInstalado = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

/*
 * Qual navegador abriu o app. Importa para instalar:
 *  - Android: só o Google Chrome instala sem o aviso "App de risco bloqueado" do Play Protect
 *    (Samsung Internet, Edge, Opera, Brave e navegadores da Xiaomi/Motorola geram um pacote antigo);
 *  - iPhone: só o Safari tem "Adicionar à Tela de Início";
 *  - Navegadores dentro do WhatsApp/Instagram/Facebook não instalam e o Google bloqueia o login.
 */
export function navegador() {
  const ua = navigator.userAgent || "";
  const android = ehAndroid();
  const ios = ehIOS();

  let interno = null;
  if (/WhatsApp/i.test(ua)) interno = "WhatsApp";
  else if (/Instagram/i.test(ua)) interno = "Instagram";
  else if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) interno = "Facebook";
  else if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) interno = "TikTok";
  else if (/Line\//i.test(ua)) interno = "Line";
  else if (android && /; wv\)/.test(ua)) interno = "outro aplicativo";

  let nome = "seu navegador";
  if (/SamsungBrowser/i.test(ua)) nome = "Samsung Internet";
  else if (/EdgA|EdgiOS|Edg\//i.test(ua)) nome = "Microsoft Edge";
  else if (/OPR|OPX|Opera/i.test(ua)) nome = "Opera";
  else if (/Firefox|FxiOS/i.test(ua)) nome = "Firefox";
  else if (/MiuiBrowser|XiaoMi|HeyTapBrowser|UCBrowser|YaBrowser/i.test(ua)) nome = "navegador do celular";
  else if (navigator.brave) nome = "Brave";
  else if (/CriOS|Chrome\//i.test(ua)) nome = "Chrome";
  else if (ios && /Safari/i.test(ua)) nome = "Safari";

  const recomendado = ios ? "Safari" : "Chrome";
  return {
    android,
    ios,
    interno,
    nome,
    recomendado,
    // Navegador certo para instalar neste aparelho?
    adequado: !interno && (ios ? nome === "Safari" : android ? nome === "Chrome" : true),
  };
}
