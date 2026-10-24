import { useState } from "react";
import { AlertTriangle, BadgeCheck, Users } from "lucide-react";
import { PrimaryButton, Screen, TopBar } from "../../components/ui.jsx";
import { CamposContratante, CamposEndereco } from "../../components/CamposEndereco.jsx";
import { atualizarPerfil } from "../../lib/perfis.js";
import {
  contratanteParaBanco, enderecoParaBanco, lerEndereco, mascaraCNPJ, temEndereco, validarContratante, validarEndereco,
} from "../../lib/endereco.js";

/*
 * Perfil → Cadastro de contratante. Pessoa física (CPF + endereço) ou empresa/MEI (CNPJ).
 * Quem é "contratante válido" é decidido pelo banco; esta tela só envia os dados.
 * Contratantes válidos podem ver e pesquisar os profissionais.
 */
export function CadastroContratanteScreen({ profile, onSaved, onBack }) {
  const jaContratante = !!profile.contratante_valido;
  const [contr, setContr] = useState({
    quer: true,
    tipo: profile.contratante_tipo || "pf",
    empresa: profile.empresa || "",
    cnpj: mascaraCNPJ(profile.cnpj || ""),
  });
  const precisaEndereco = !temEndereco(profile);
  const [end, setEnd] = useState(() => lerEndereco(profile));
  const [errContr, setErrContr] = useState({});
  const [errEnd, setErrEnd] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  const salvar = async () => {
    const eC = validarContratante(contr);
    const eE = precisaEndereco ? validarEndereco(end) : {};
    setErrContr(eC);
    setErrEnd(eE);
    setErroGeral("");
    if (Object.keys(eC).length || Object.keys(eE).length) {
      setTimeout(() => document.querySelector("[data-erro='1']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return setErroGeral("Confira os campos destacados em vermelho.");
    }
    setSalvando(true);
    try {
      await atualizarPerfil(profile.id, { ...contratanteParaBanco(contr), ...(precisaEndereco ? enderecoParaBanco(end) : {}) });
      await onSaved();
    } catch (err) {
      setErroGeral(err.message);
      setSalvando(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Cadastro de contratante" onBack={onBack} />
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-4">
        {jaContratante ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
            <BadgeCheck size={22} className="text-emerald-600 shrink-0" />
            <div className="text-[13px] text-emerald-900 leading-relaxed">
              <p className="font-bold">Você é contratante no EiFreela.</p>
              <p>Já pode ver e pesquisar os profissionais. Aqui você pode atualizar seus dados.</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-start gap-3">
            <Users size={22} className="text-emerald-600 shrink-0" />
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Para proteger os profissionais, só <b>contratantes cadastrados</b> veem a lista e os perfis completos. Leva 1 minuto.
            </p>
          </div>
        )}

        <CamposContratante valor={contr} onChange={(v) => { setContr({ ...v, quer: true }); setErrContr({}); }} erros={errContr} comOpcao={false} />

        {precisaEndereco && (
          <CamposEndereco
            valor={end}
            onChange={(v) => { setEnd(v); setErrEnd({}); }}
            erros={errEnd}
            ajuda="Obrigatório para contratar. Só você vê o endereço completo; os outros veem apenas cidade e estado."
          />
        )}

        <p className="text-[11.5px] text-slate-400 leading-snug">
          Conferimos o formato e os dígitos do CNPJ e não permitimos o mesmo CNPJ em duas contas. Não consultamos a situação da empresa na Receita Federal.
        </p>

        {erroGeral && (
          <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-[12.5px] text-red-600 font-semibold flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" /> {erroGeral}
          </p>
        )}
        <PrimaryButton disabled={salvando} onClick={salvar}>
          {salvando ? "Salvando…" : jaContratante ? "Salvar alterações" : "Concluir cadastro de contratante"}
        </PrimaryButton>
      </div>
    </Screen>
  );
}
