import { aceitarTermo } from "../../lib/termos.js";
import { useState } from "react";
import { AlertTriangle, Cake, IdCard, Phone, ShieldCheck, User } from "lucide-react";
import { Campo, Field, PrimaryButton, Screen, SecondaryButton, TopBar } from "../../components/ui.jsx";
import { FotoPerfil, SeletorAreas } from "../../components/CamposPerfil.jsx";
import { sair } from "../../lib/auth.js";
import { criarPerfil, enviarAvatar } from "../../lib/perfis.js";
import { dataMaxima18, mascaraCPF, mascaraTelefone, soDigitos, validarPerfil } from "../../lib/validacao.js";

/*
 * Quem entrou com Google/Facebook (ou tem conta antiga) completa aqui os mesmos campos
 * do cadastro. O e-mail já vem verificado pelo provedor; não há senha nesta etapa.
 */
export function CompletarPerfilScreen({ usuario, onDone }) {
  const meta = usuario.user_metadata ?? {};
  const [d, setD] = useState({ nome: meta.full_name || meta.name || meta.nome || "", cpf: "", nascimento: "", telefone: "", areas: [] });
  const [foto, setFoto] = useState(null);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [aceite, setAceite] = useState(false);
  const fotoProvedor = typeof (meta.avatar_url || meta.picture) === "string" && (meta.avatar_url || meta.picture).startsWith("https://") ? meta.avatar_url || meta.picture : null;

  const muda = (campo, mascara) => (e) => {
    const v = mascara ? mascara(e.target.value) : e.target.value;
    setD((x) => ({ ...x, [campo]: v }));
    if (erros[campo]) setErros((x) => ({ ...x, [campo]: undefined }));
  };

  if (!usuario.email) {
    return (
      <Screen>
        <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto px-6 py-10 gap-4 text-center">
          <AlertTriangle size={32} className="mx-auto text-amber-500" />
          <p className="text-[14px] text-slate-600">
            Sua conta do Facebook não compartilhou um e-mail. Para usar o EiFreela, crie uma conta com e-mail ou entre com o Google.
          </p>
          <PrimaryButton onClick={sair}>Voltar</PrimaryButton>
        </div>
      </Screen>
    );
  }

  const salvar = async () => {
    const er = validarPerfil(d, { exigirSenha: false, exigirEmail: false });
    if (!aceite) er.aceite = "Para continuar, aceite os Termos de Uso e a Política de Privacidade.";
    setErros(er);
    setErroGeral("");
    if (Object.keys(er).length) return;
    setSalvando(true);
    try {
      await criarPerfil(usuario, {
        nome: d.nome.trim().replace(/\s+/g, " "),
        cpf: soDigitos(d.cpf),
        nascimento: d.nascimento,
        telefone: soDigitos(d.telefone),
        areas: d.areas,
        avatar_url: foto ? null : fotoProvedor,
      });
      if (foto) await enviarAvatar(usuario.id, foto).catch(() => {});
      await aceitarTermo().catch(() => {}); // registra o aceite (LGPD) marcado nesta tela
      await onDone();
    } catch (err) {
      setErroGeral(err.message);
      setSalvando(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Complete seu perfil" />
      <div className="flex-1 w-full max-w-md mx-auto px-6 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-4">
        <p className="text-[13px] text-slate-500">
          Você entrou como <b className="text-slate-700 break-all">{usuario.email}</b>. Faltam só alguns dados.
        </p>
        <FotoPerfil blob={foto} urlAtual={fotoProvedor} nome={d.nome} onChange={setFoto} />
        <Campo label="Nome completo" erro={erros.nome}>
          <Field icon={User} autoComplete="name" value={d.nome} onChange={muda("nome")} invalid={!!erros.nome} />
        </Campo>
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
          <Campo label="CPF" erro={erros.cpf}>
            <Field icon={IdCard} inputMode="numeric" placeholder="000.000.000-00" value={d.cpf} onChange={muda("cpf", mascaraCPF)} invalid={!!erros.cpf} />
          </Campo>
          <Campo label="Data de nascimento" erro={erros.nascimento}>
            <Field icon={Cake} type="date" min="1915-01-01" max={dataMaxima18()} value={d.nascimento} onChange={muda("nascimento")} invalid={!!erros.nascimento} />
          </Campo>
        </div>
        <Campo label="Telefone / WhatsApp" erro={erros.telefone}>
          <Field icon={Phone} type="tel" inputMode="tel" placeholder="(69) 99999-9999" value={d.telefone} onChange={muda("telefone", mascaraTelefone)} invalid={!!erros.telefone} />
        </Campo>
        <SeletorAreas valor={d.areas} erro={erros.areas} onChange={(areas) => setD((x) => ({ ...x, areas }))} />

        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-[12.5px] text-emerald-900 leading-relaxed">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <b>Como usamos seus dados:</b> nome, foto, áreas e avaliações aparecem para outros usuários. CPF, e-mail, nascimento e
            telefone ficam visíveis só para você e servem para proteger sua conta e evitar cadastros duplicados. Não pedimos dados
            bancários. Você pode excluir a conta quando quiser, em Perfil.
          </p>
        </div>

        <div>
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={aceite}
              onChange={(e) => {
                setAceite(e.target.checked);
                if (erros.aceite) setErros((x) => ({ ...x, aceite: undefined }));
              }}
              className="mt-0.5 w-5 h-5 shrink-0 accent-emerald-600"
            />
            <span className="text-[12.5px] text-slate-600 leading-snug">
              Tenho 18 anos ou mais e aceito os{" "}
              <a href="/termos/" target="_blank" rel="noopener" className="text-emerald-700 font-bold underline">Termos de Uso</a>, a{" "}
              <a href="/privacidade/" target="_blank" rel="noopener" className="text-emerald-700 font-bold underline">Política de Privacidade</a> e o{" "}
              <a href="/lgpd/" target="_blank" rel="noopener" className="text-emerald-700 font-bold underline">Termo de Consentimento (LGPD)</a>.
            </span>
          </label>
          {erros.aceite && <p className="text-[12px] text-red-500 font-semibold mt-1.5">{erros.aceite}</p>}
        </div>
        {erroGeral && (
          <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-[12.5px] text-red-600 font-semibold">{erroGeral}</p>
        )}
        {aceite ? (
          <PrimaryButton disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "Salvar e continuar"}</PrimaryButton>
        ) : (
          <p className="py-3 px-4 rounded-xl bg-slate-100 text-slate-500 text-[13px] font-semibold text-center">Marque a caixa de aceite acima para salvar</p>
        )}
        <SecondaryButton onClick={sair}>Sair</SecondaryButton>
      </div>
    </Screen>
  );
}
