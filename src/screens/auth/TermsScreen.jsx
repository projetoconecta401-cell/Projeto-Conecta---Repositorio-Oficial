import { useState } from "react";
import { Screen, TopBar, PrimaryButton } from "../../components/ui.jsx";

export function TermsScreen({ onFinish, onBack }) {
  const [accepted, setAccepted] = useState(false);
  return (
    <Screen>
      <TopBar title="Termos e Privacidade" onBack={onBack} />
      <div className="flex-1 px-6 py-6 flex flex-col">
        <div className="flex-1 overflow-y-auto max-h-72 p-4 rounded-xl bg-white border border-slate-200 text-[12.5px] text-slate-600 leading-relaxed">
          <p className="font-bold text-slate-800 mb-1.5">Termos de Uso</p>
          <p className="mb-3">
            Ao utilizar a Conexão Free você concorda com as regras de intermediação entre contratantes e prestadores de
            serviço em todo o Brasil, incluindo verificação de identidade, avaliações mútuas e uso responsável
            do chat interno.
          </p>
          <p className="font-bold text-slate-800 mb-1.5">Política de Privacidade (LGPD)</p>
          <p>
            Seus dados pessoais, documentos e dados bancários são tratados conforme a Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018), utilizados exclusivamente para validação de identidade e pagamento de diárias, e
            nunca compartilhados com terceiros sem seu consentimento. Você pode solicitar a exclusão definitiva dos
            seus dados a qualquer momento nas Configurações da Conta.
          </p>
        </div>
        <label className="flex items-start gap-2.5 mt-4">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 w-4 h-4 accent-emerald-600" />
          <span className="text-[12.5px] text-slate-600">Li e aceito os Termos de Uso e a Política de Privacidade, conforme a LGPD.</span>
        </label>
        <PrimaryButton className="mt-6" disabled={!accepted} onClick={onFinish}>
          Concluir cadastro
        </PrimaryButton>
      </div>
    </Screen>
  );
}
