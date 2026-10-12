import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { Sheet } from "./ui.jsx";
import { ehInstalado, ehIOS } from "../lib/plataforma.js";

/*
 * "Instalar" o EiFreela na tela inicial, grátis e sem loja (PWA):
 *  - Android/Chrome: abre o diálogo nativo (evento beforeinstallprompt);
 *  - iPhone/Safari: mostra o passo a passo "Compartilhar → Adicionar à Tela de Início".
 */
let eventoGuardado = null;
const ouvintes = new Set();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    eventoGuardado = e;
    ouvintes.forEach((f) => f());
  });
  window.addEventListener("appinstalled", () => {
    eventoGuardado = null;
    ouvintes.forEach((f) => f());
  });
}

export default function BotaoInstalar({ compacto = false }) {
  const [, forcar] = useState(0);
  const [ajudaIOS, setAjudaIOS] = useState(false);

  useEffect(() => {
    const f = () => forcar((n) => n + 1);
    ouvintes.add(f);
    return () => ouvintes.delete(f);
  }, []);

  if (ehInstalado()) return null;
  const ios = ehIOS();
  if (!eventoGuardado && !ios) return null;

  const instalar = async () => {
    if (ios) return setAjudaIOS(true);
    eventoGuardado.prompt();
    await eventoGuardado.userChoice.catch(() => {});
    eventoGuardado = null;
    forcar((n) => n + 1);
  };

  return (
    <>
      <button
        onClick={instalar}
        className={
          compacto
            ? "flex items-center gap-1 px-2.5 h-9 rounded-full bg-emerald-50 text-emerald-700 text-[12px] font-bold shrink-0"
            : "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-[14px]"
        }
      >
        <Download size={15} /> {compacto ? "Instalar" : "Instalar o EiFreela no celular"}
      </button>
      {ajudaIOS && (
        <Sheet title="Instalar no iPhone" onClose={() => setAjudaIOS(false)}>
          <ol className="list-decimal pl-5 space-y-3 text-[13.5px] text-slate-600 pt-1">
            <li>Abra este site no <b>Safari</b>.</li>
            <li>
              Toque em <b>Compartilhar</b> <Share size={15} className="inline -mt-1 text-sky-600" /> na barra do Safari.
            </li>
            <li>
              Escolha <b>Adicionar à Tela de Início</b> e toque em <b>Adicionar</b>.
            </li>
          </ol>
          <p className="text-[12px] text-slate-400 mt-4">
            É grátis e não passa pela App Store. Depois de instalado, ative os avisos de novas vagas em Perfil.
          </p>
        </Sheet>
      )}
    </>
  );
}
