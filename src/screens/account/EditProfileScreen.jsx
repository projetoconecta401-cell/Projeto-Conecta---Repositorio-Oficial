import { Mail, User, Phone, IdCard, Lock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Campo, Field, PrimaryButton, Screen, TopBar } from "../../components/ui.jsx";
import { FotoPerfil, SeletorAreas } from "../../components/CamposPerfil.jsx";
import { atualizarPerfil, enviarAvatar } from "../../lib/perfis.js";
import { cpfOculto, mascaraTelefone, soDigitos, validarPerfil } from "../../lib/validacao.js";
import { CurriculoEditor } from "../../components/Curriculo.jsx";
import { lerCurriculo, prepararCurriculo } from "../../lib/curriculo.js";

/* Edita nome, telefone, áreas, foto e o resumo profissional (opcional). CPF e e-mail não mudam. */
export function EditProfileScreen({ profile, onSaved, onBack }) {
  const [nome, setNome] = useState(profile.nome || "");
  const [telefone, setTelefone] = useState(mascaraTelefone(profile.telefone || ""));
  const [areas, setAreas] = useState(profile.areas || []);
  const [foto, setFoto] = useState(null);
  // O resumo profissional só aparece depois que o banco tiver as colunas novas.
  const comCurriculo = Object.prototype.hasOwnProperty.call(profile, "sobre");
  const [cv, setCv] = useState(() => lerCurriculo(profile));
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  const salvar = async () => {
    const er = validarPerfil({ nome, telefone, areas }, { exigirSenha: false, exigirEmail: false });
    const curriculo = comCurriculo ? prepararCurriculo(cv) : { dados: {}, erros: {} };
    Object.assign(er, curriculo.erros);
    setErros(er);
    setErroGeral("");
    if (Object.keys(er).length) return setErroGeral("Confira os campos destacados em vermelho.");
    setSalvando(true);
    try {
      await atualizarPerfil(profile.id, { nome: nome.trim().replace(/\s+/g, " "), telefone: soDigitos(telefone), areas, ...curriculo.dados });
      if (foto) await enviarAvatar(profile.id, foto);
      await onSaved();
    } catch (err) {
      setErroGeral(err.message);
      setSalvando(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Editar perfil" onBack={onBack} />
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-4">
        <p className="text-[12.5px] text-slate-500 leading-relaxed">Nome, foto, áreas e o resumo profissional aparecem para quem vê seu perfil.</p>
        <FotoPerfil blob={foto} urlAtual={profile.avatar_url} nome={nome} onChange={setFoto} />
        <Campo label="Nome completo" erro={erros.nome}>
          <Field icon={User} value={nome} onChange={(e) => setNome(e.target.value)} invalid={!!erros.nome} />
        </Campo>
        <Campo label="Telefone / WhatsApp" erro={erros.telefone}>
          <Field icon={Phone} type="tel" inputMode="tel" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} invalid={!!erros.telefone} />
        </Campo>
        <SeletorAreas valor={areas} erro={erros.areas} onChange={setAreas} />
        {comCurriculo && <CurriculoEditor valor={cv} onChange={setCv} erros={erros} />}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
          <Campo label="E-mail" ajuda="Não pode ser alterado.">
            <Field icon={Mail} value={profile.email} disabled className="bg-slate-50 text-slate-500" />
          </Campo>
          <Campo label="CPF" ajuda="Não pode ser alterado.">
            <Field icon={IdCard} value={cpfOculto(profile.cpf)} disabled className="bg-slate-50 text-slate-500" />
          </Campo>
        </div>
        <p className="text-[11.5px] text-slate-400 flex items-start gap-1.5">
          <Lock size={13} className="shrink-0 mt-px" /> Para trocar a senha, use Perfil → Configurações → Alterar senha.
        </p>
        {erroGeral && (
          <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-[12.5px] text-red-600 font-semibold flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" /> {erroGeral}
          </p>
        )}
        <PrimaryButton disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "Salvar alterações"}</PrimaryButton>
      </div>
    </Screen>
  );
}
