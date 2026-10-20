import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../components/ui.jsx";
import { TextoTermoLgpd } from "../../components/TermoLgpd.jsx";
import { DECLARACAO_ACEITE } from "../../data/termoLgpd.js";
import { aceitarTermo } from "../../lib/termos.js";
import { sair } from "../../lib/auth.js";

/*
 * Aceite obrigatório do Termo de Consentimento (LGPD). Aparece para quem ainda não aceitou
 * a versão atual (contas antigas ou quando o termo muda). Sem aceite, só dá para sair.
 */
export function AceiteLgpdScreen({ atualizacao = false, onAceito }) {
  const [marcado, setMarcado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");

  const aceitar = async () => {
    if (!marcado) return setErro("Marque a caixa para confirmar que leu e aceita o termo.");
    setOcupado(true);
    setErro("");
    try {
      await aceitarTermo();
      await onAceito();
    } catch (e) {
      setErro(e.message);
      setOcupado(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-2.5">
          <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-[16px] font-extrabold text-slate-800 truncate">Seus dados e a LGPD</h1>
            <p className="text-[11.5px] text-slate-500 truncate">
              {atualizacao ? "O termo foi atualizado. Leia e aceite para continuar." : "Leia e aceite para usar o EiFreela."}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <TextoTermoLgpd />
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto px-5 pt-3 flex flex-col gap-3">
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={marcado}
              onChange={(e) => {
                setMarcado(e.target.checked);
                setErro("");
              }}
              className="mt-0.5 w-5 h-5 shrink-0 accent-emerald-600"
            />
            <span className="text-[12.5px] text-slate-700 leading-snug">
              {DECLARACAO_ACEITE} Veja também os{" "}
              <a href="/termos/" target="_blank" rel="noopener" className="text-emerald-700 font-bold underline">Termos de Uso</a> e a{" "}
              <a href="/privacidade/" target="_blank" rel="noopener" className="text-emerald-700 font-bold underline">Política de Privacidade</a>.
            </span>
          </label>
          {erro && <p role="alert" className="text-[12px] text-red-500 font-semibold">{erro}</p>}
          <div className="grid grid-cols-[1fr_2fr] gap-2.5">
            <SecondaryButton onClick={sair}>Sair</SecondaryButton>
            <PrimaryButton disabled={ocupado} onClick={aceitar}>{ocupado ? "Registrando…" : "Li e aceito"}</PrimaryButton>
          </div>
        </div>
      </footer>
    </div>
  );
}
