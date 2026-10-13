import { useState } from "react";
import { CircleCheck, Copy, Check, EllipsisVertical, Share, SquarePlus, TriangleAlert, ExternalLink } from "lucide-react";
import BotaoInstalar from "./BotaoInstalar.jsx";
import { ehInstalado, navegador } from "../lib/plataforma.js";

/*
 * Passo a passo para instalar o EiFreela na tela inicial (Android e iPhone).
 * Detecta o navegador: fora do Chrome (Android) ou do Safari (iPhone) mostra um aviso,
 * porque outros navegadores geram o alerta "App de risco bloqueado" do Play Protect.
 */
const LINK_APP = () => `${window.location.origin}/app/`;

export function GuiaInstalacao() {
  const nav = navegador();
  const [aba, setAba] = useState(nav.ios ? "iphone" : "android");
  const [copiado, setCopiado] = useState(false);

  if (ehInstalado()) {
    return (
      <p className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-[13px] text-emerald-800 font-semibold">
        <CircleCheck size={18} className="shrink-0" /> Você já está usando o EiFreela instalado no celular.
      </p>
    );
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(LINK_APP());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt("Copie o link:", LINK_APP());
    }
  };

  // Android: tenta abrir o mesmo endereço direto no Chrome.
  const abrirNoChrome = () => {
    const u = new URL(LINK_APP());
    window.location.href = `intent://${u.host}${u.pathname}#Intent;scheme=https;package=com.android.chrome;end`;
  };

  return (
    <div className="flex flex-col gap-3">
      {!nav.adequado && (nav.android || nav.ios) && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[13px] text-amber-900 flex flex-col gap-2.5">
          <p className="flex items-start gap-2 leading-snug">
            <TriangleAlert size={17} className="shrink-0 mt-px text-amber-600" />
            <span>
              Você abriu o EiFreela {nav.interno ? <>dentro do <b>{nav.interno}</b></> : <>pelo <b>{nav.nome}</b></>}. Para instalar
              {nav.android ? " sem o aviso “App de risco bloqueado”" : ""}
              {nav.interno ? " e entrar com o Google" : ""}, abra o link no <b>{nav.recomendado}</b>.
            </span>
          </p>
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2">
            {nav.android && (
              <button onClick={abrirNoChrome} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-[13px]">
                <ExternalLink size={15} /> Abrir no Chrome
              </button>
            )}
            <button onClick={copiar} className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-800 font-bold text-[13px] ${nav.android ? "" : "min-[360px]:col-span-2"}`}>
              {copiado ? <Check size={15} /> : <Copy size={15} />} {copiado ? "Link copiado" : "Copiar link"}
            </button>
          </div>
        </div>
      )}

      {nav.adequado && <BotaoInstalar />}

      <div role="tablist" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100">
        {[
          ["android", "Android"],
          ["iphone", "iPhone"],
        ].map(([id, rotulo]) => (
          <button
            key={id}
            role="tab"
            aria-selected={aba === id}
            onClick={() => setAba(id)}
            className={`py-2 rounded-lg text-[13px] font-bold transition ${aba === id ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"}`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === "android" ? (
        <ol className="flex flex-col gap-2.5">
          <Passo n={1}>
            Abra <b className="break-all">{window.location.host}/app</b> no <b>Google Chrome</b>.
          </Passo>
          <Passo n={2}>
            Toque nos três pontinhos <EllipsisVertical size={15} className="inline -mt-0.5 text-slate-500" /> no canto de cima.
          </Passo>
          <Passo n={3}>
            Escolha <b>Instalar app</b> (ou <b>Adicionar à tela inicial → Instalar</b>).
          </Passo>
          <Passo n={4}>Pronto: o ícone verde do EiFreela aparece na tela inicial.</Passo>
          <p className="text-[12px] text-slate-500 leading-relaxed pl-9">
            Apareceu “App de risco bloqueado”? A instalação foi feita por outro navegador. Remova o ícone e instale de novo pelo Chrome.
          </p>
        </ol>
      ) : (
        <ol className="flex flex-col gap-2.5">
          <Passo n={1}>
            Abra <b className="break-all">{window.location.host}/app</b> no <b>Safari</b>.
          </Passo>
          <Passo n={2}>
            Toque em <b>Compartilhar</b> <Share size={15} className="inline -mt-1 text-sky-600" /> na barra de baixo.
          </Passo>
          <Passo n={3}>
            Escolha <b>Adicionar à Tela de Início</b> <SquarePlus size={15} className="inline -mt-1 text-slate-500" /> e toque em <b>Adicionar</b>.
          </Passo>
          <Passo n={4}>Abra o EiFreela pelo ícone para receber os avisos de novas vagas.</Passo>
        </ol>
      )}
    </div>
  );
}

const Passo = ({ n, children }) => (
  <li className="flex items-start gap-3 text-[13.5px] text-slate-600 leading-snug">
    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[12px] font-bold flex items-center justify-center shrink-0">{n}</span>
    <span className="pt-0.5 min-w-0">{children}</span>
  </li>
);
