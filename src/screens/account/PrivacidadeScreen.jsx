import { useState } from "react";
import { ChevronDown, ChevronUp, CircleCheck, Download, ExternalLink, FileText, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { Screen, TopBar } from "../../components/ui.jsx";
import { TextoTermoLgpd } from "../../components/TermoLgpd.jsx";
import { CONTATO, VERSAO_TERMO } from "../../data/termoLgpd.js";

/* Configurações → Privacidade e LGPD: aceite registrado, termo completo e direitos do titular. */
export function PrivacidadeScreen({ profile, onBack, onEditProfile, onExcluirConta }) {
  const [aberto, setAberto] = useState(false);
  const aceitoEm = profile.termos_aceite_em ? new Date(profile.termos_aceite_em) : null;
  const versaoAtual = profile.termos_versao === VERSAO_TERMO;

  const pedirDados = () => {
    const assunto = encodeURIComponent("LGPD – Pedido de cópia dos meus dados");
    const corpo = encodeURIComponent(
      `Olá! Com base no art. 18 da LGPD, peço a confirmação e uma cópia dos meus dados pessoais tratados pelo EiFreela.\n\nE-mail da conta: ${profile.email}\nNome: ${profile.nome}`
    );
    window.location.href = `mailto:${CONTATO}?subject=${assunto}&body=${corpo}`;
  };

  return (
    <Screen>
      <TopBar title="Privacidade e LGPD" onBack={onBack} />
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 py-5 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col gap-4">
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${versaoAtual ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-200"}`}>
          {versaoAtual ? <CircleCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" /> : <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />}
          <div className="text-[13px] leading-relaxed min-w-0">
            <p className="font-bold text-slate-800">Termo de Consentimento (LGPD)</p>
            {aceitoEm ? (
              <p className="text-slate-600">
                Aceito em {aceitoEm.toLocaleDateString("pt-BR")} às {aceitoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ·
                versão {String(profile.termos_versao).split("-")[0]}
              </p>
            ) : (
              <p className="text-slate-600">O registro do seu aceite aparece aqui.</p>
            )}
          </div>
        </div>

        <button
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-100 text-left"
        >
          <FileText size={17} className="text-slate-500 shrink-0" />
          <span className="flex-1 text-[13.5px] font-medium text-slate-700">{aberto ? "Esconder o termo" : "Ler o termo completo"}</span>
          {aberto ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {aberto && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <TextoTermoLgpd />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-[12.5px] font-bold text-slate-600 mt-1">Documentos</p>
          <Link href="/termos/">Termos de Uso</Link>
          <Link href="/privacidade/">Política de Privacidade</Link>
          <Link href="/lgpd/">Termo de Consentimento (página pública)</Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[12.5px] font-bold text-slate-600 mt-1">Seus direitos (art. 18 da LGPD)</p>
          <Acao icon={Pencil} onClick={onEditProfile}>Corrigir meus dados</Acao>
          <Acao icon={Download} onClick={pedirDados}>Pedir uma cópia dos meus dados</Acao>
          <Acao icon={Trash2} tom="vermelho" onClick={onExcluirConta}>Revogar o consentimento e excluir a conta</Acao>
          <p className="text-[11.5px] text-slate-400 leading-relaxed">
            Os pedidos são gratuitos e respondidos em até 15 dias pelo e-mail {CONTATO}. Você também pode reclamar à ANPD.
          </p>
        </div>
      </div>
    </Screen>
  );
}

const Link = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener" className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-100">
    <FileText size={17} className="text-slate-500 shrink-0" />
    <span className="flex-1 text-[13.5px] font-medium text-slate-700">{children}</span>
    <ExternalLink size={15} className="text-slate-300" />
  </a>
);

const Acao = ({ icon: Icon, tom, children, ...props }) => (
  <button
    {...props}
    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left ${tom === "vermelho" ? "bg-red-50 border-red-100 text-red-600" : "bg-white border-slate-100 text-slate-700"}`}
  >
    <Icon size={17} className="shrink-0" />
    <span className="flex-1 text-[13.5px] font-medium">{children}</span>
  </button>
);
