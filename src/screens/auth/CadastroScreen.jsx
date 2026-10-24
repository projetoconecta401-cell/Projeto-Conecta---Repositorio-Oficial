import { marcarAceitePendente } from "../../lib/termos.js";
import { Mail, Lock, User, AlertTriangle, Eye, EyeOff, Phone, Cake, IdCard, ShieldCheck, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Screen, TopBar, Field, Campo, PrimaryButton, SecondaryButton } from "../../components/ui.jsx";
import { FotoPerfil, RequisitosSenha, SeletorAreas } from "../../components/CamposPerfil.jsx";
import { cadastrar, enviarCodigo } from "../../lib/auth.js";
import { BotoesSociais } from "../../components/BotoesSociais.jsx";
import { CamposContratante, CamposEndereco } from "../../components/CamposEndereco.jsx";
import { contratanteParaBanco, contratanteVazio, enderecoParaBanco, enderecoVazio, validarContratante, validarEndereco } from "../../lib/endereco.js";
import { guardarAvatarPendente } from "../../lib/perfis.js";
import { dataMaxima18, mascaraCPF, mascaraTelefone, soDigitos, validarPerfil } from "../../lib/validacao.js";

/* ------------------------------------------------------------------ */
/*  CADASTRO (itens 3 e 9)                                             */
/*  1. A pessoa preenche TODOS os dados: nome, CPF, e-mail, nascimento,*/
/*     telefone/WhatsApp, foto, áreas de atuação e senha.             */
/*  2. Só depois o app envia o código para o e-mail.                   */
/*  3. Com o código, a conta é criada já confirmada e o app entra.     */
/*  Nenhum dado bancário é pedido.                                     */
/* ------------------------------------------------------------------ */

const VAZIO = { nome: "", cpf: "", email: "", nascimento: "", telefone: "", areas: [], senha: "", confirmar: "" };

function EtapaCodigo({ dados, onVoltar }) {
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [espera, setEspera] = useState(60);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const confirmar = async () => {
    if (codigo.length !== 6 || enviando) return;
    setErro("");
    setEnviando(true);
    try {
      // Cria a conta e entra; o AuthGate abre o app logado (a foto é enviada em seguida).
      marcarAceitePendente(dados.email);
      await cadastrar({ ...dados, codigo });
    } catch (err) {
      setErro(err.message);
      setEnviando(false);
    }
  };

  const reenviar = async () => {
    setErro("");
    setAviso("");
    try {
      await enviarCodigo(dados.email, "cadastro", dados.cpf);
      setEspera(60);
      setAviso("Enviamos um novo código.");
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <Screen>
      <TopBar title="Confirme seu e-mail" onBack={onVoltar} />
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <MailCheck size={26} />
        </div>
        <h2 className="text-lg font-extrabold text-slate-800">Último passo!</h2>
        <p className="text-[13px] text-slate-500 mt-1.5 mb-6 leading-relaxed">
          Enviamos um código de 6 dígitos para <b className="text-slate-700 break-all">{dados.email}</b>. Ele vale por 10 minutos —
          confira também o spam.
        </p>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          value={codigo}
          onChange={(e) => setCodigo(soDigitos(e.target.value).slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && confirmar()}
          placeholder="000000"
          aria-label="Código de verificação"
          className="w-full text-center text-[28px] tracking-[0.5em] font-extrabold py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
        />
        {erro && (
          <p role="alert" className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-[12.5px] text-red-600 font-semibold flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" /> {erro}
          </p>
        )}
        {aviso && !erro && <p className="mt-3 text-[12.5px] text-emerald-600 font-semibold text-center">{aviso}</p>}
        <PrimaryButton className="mt-5" disabled={codigo.length !== 6 || enviando} onClick={confirmar}>
          {enviando ? "Criando sua conta…" : "Confirmar e criar conta"}
        </PrimaryButton>
        <SecondaryButton className="mt-3" disabled={espera > 0} onClick={reenviar}>
          {espera > 0 ? `Reenviar código em ${espera}s` : "Reenviar código"}
        </SecondaryButton>
      </div>
    </Screen>
  );
}

export function CadastroScreen({ onBack, onOpenTerms }) {
  const [erroSocial, setErroSocial] = useState("");
  const [d, setD] = useState(VAZIO);
  const [end, setEnd] = useState(enderecoVazio);
  const [contr, setContr] = useState(contratanteVazio);
  const [errEnd, setErrEnd] = useState({});
  const [errContr, setErrContr] = useState({});
  const [foto, setFoto] = useState(null);
  const [aceite, setAceite] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [dadosConfirmados, setDadosConfirmados] = useState(null);

  const muda = (campo, mascara) => (e) => {
    const valor = mascara ? mascara(e.target.value) : e.target.value;
    setD((x) => ({ ...x, [campo]: valor }));
    if (erros[campo]) setErros((x) => ({ ...x, [campo]: undefined }));
  };

  const continuar = async () => {
    const er = validarPerfil(d);
    if (!aceite) er.aceite = "Aceite os Termos de Uso, a Política de Privacidade e o Termo de Consentimento (LGPD).";
    const eEnd = validarEndereco(end);
    const eContr = validarContratante(contr);
    setErros(er);
    setErrEnd(eEnd);
    setErrContr(eContr);
    setErroGeral("");
    if (Object.keys(er).length || Object.keys(eEnd).length || Object.keys(eContr).length) {
      setErroGeral("Confira os campos destacados em vermelho.");
      setTimeout(() => document.querySelector("[data-erro='1']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return;
    }
    const dados = {
      nome: d.nome.trim().replace(/\s+/g, " "),
      cpf: soDigitos(d.cpf),
      email: d.email.trim().toLowerCase(),
      nascimento: d.nascimento,
      telefone: soDigitos(d.telefone),
      areas: d.areas,
      senha: d.senha,
      endereco: enderecoParaBanco(end),
      contratante: contratanteParaBanco(contr),
    };
    setEnviando(true);
    try {
      await enviarCodigo(dados.email, "cadastro", dados.cpf); // Erro 4: código só depois dos dados
      guardarAvatarPendente(foto);
      setDadosConfirmados(dados);
      window.scrollTo(0, 0);
    } catch (err) {
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (dadosConfirmados) return <EtapaCodigo dados={dadosConfirmados} onVoltar={() => setDadosConfirmados(null)} />;

  const marca = (campo) => (erros[campo] ? { "data-erro": "1" } : {});

  return (
    <Screen>
      <TopBar title="Criar conta" onBack={onBack} />
      {/* Erro 1: a página rola normalmente — todos os campos e o botão final ficam acessíveis. */}
      <div className="flex-1 w-full max-w-md mx-auto px-6 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-3">
          <p className="text-[13px] font-bold text-slate-700 text-center">Cadastro rápido com</p>
          <BotoesSociais onErro={setErroSocial} cadastro />
          {erroSocial && <p className="text-[12px] text-red-500 font-semibold text-center">{erroSocial}</p>}
          <p className="text-[11.5px] text-slate-400 text-center">Depois você completa CPF, telefone e áreas de atuação.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[12px] text-slate-400">ou preencha seus dados</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>
        <p className="text-[13px] text-slate-500">
          No fim, confirmamos seu e-mail com um código.
        </p>

        <FotoPerfil blob={foto} nome={d.nome} onChange={setFoto} />

        <div {...marca("nome")}>
          <Campo label="Nome completo" erro={erros.nome}>
            <Field icon={User} autoComplete="name" placeholder="Como no documento" value={d.nome} onChange={muda("nome")} invalid={!!erros.nome} />
          </Campo>
        </div>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
          <div {...marca("cpf")}>
            <Campo label="CPF" erro={erros.cpf}>
              <Field icon={IdCard} inputMode="numeric" placeholder="000.000.000-00" value={d.cpf} onChange={muda("cpf", mascaraCPF)} invalid={!!erros.cpf} />
            </Campo>
          </div>
          <div {...marca("nascimento")}>
            <Campo label="Data de nascimento" erro={erros.nascimento}>
              <Field icon={Cake} type="date" min="1915-01-01" max={dataMaxima18()} value={d.nascimento} onChange={muda("nascimento")} invalid={!!erros.nascimento} />
            </Campo>
          </div>
        </div>

        <div {...marca("email")}>
          <Campo label="E-mail" erro={erros.email}>
            <Field icon={Mail} type="email" inputMode="email" autoComplete="email" placeholder="voce@email.com" value={d.email} onChange={muda("email")} invalid={!!erros.email} />
          </Campo>
        </div>

        <div {...marca("telefone")}>
          <Campo label="Telefone / WhatsApp" erro={erros.telefone}>
            <Field icon={Phone} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(69) 99999-9999" value={d.telefone} onChange={muda("telefone", mascaraTelefone)} invalid={!!erros.telefone} />
          </Campo>
        </div>

        <div {...marca("areas")}>
          <SeletorAreas
            valor={d.areas}
            erro={erros.areas}
            onChange={(areas) => {
              setD((x) => ({ ...x, areas }));
              setErros((x) => ({ ...x, areas: undefined }));
            }}
          />
        </div>

        <CamposEndereco valor={end} onChange={(v) => { setEnd(v); setErrEnd({}); }} erros={errEnd} />

        <CamposContratante valor={contr} onChange={(v) => { setContr(v); setErrContr({}); }} erros={errContr} />

        <div {...marca("senha")}>
          <Campo label="Senha" erro={erros.senha}>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type={mostrar ? "text" : "password"}
                autoComplete="new-password"
                value={d.senha}
                onChange={muda("senha")}
                placeholder="Crie uma senha"
                className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-white text-[16px] focus:outline-none focus:ring-2 ${
                  erros.senha ? "border-red-300 focus:ring-red-500/30" : "border-slate-200 focus:ring-emerald-500/40 focus:border-emerald-500"
                }`}
              />
              <button type="button" onClick={() => setMostrar(!mostrar)} aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400">
                {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <RequisitosSenha senha={d.senha} />
          </Campo>
        </div>

        <div {...marca("confirmar")}>
          <Campo label="Confirme a senha" erro={erros.confirmar}>
            <Field icon={Lock} type={mostrar ? "text" : "password"} autoComplete="new-password" value={d.confirmar} onChange={muda("confirmar")} invalid={!!erros.confirmar} />
          </Campo>
        </div>

        <div {...marca("aceite")}>
          <label className="flex items-start gap-2.5">
            <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 w-5 h-5 shrink-0 accent-emerald-600" />
            <span className="text-[12.5px] text-slate-600 leading-snug">
              Tenho 18 anos ou mais e aceito os{" "}
              <button type="button" onClick={onOpenTerms} className="text-emerald-700 font-bold underline">
                Termos de Uso, a Política de Privacidade e o Termo de Consentimento (LGPD)
              </button>
            </span>
          </label>
          {erros.aceite && <p className="text-[12px] text-red-500 font-semibold mt-1.5">{erros.aceite}</p>}
        </div>

        {erroGeral && (
          <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-[12.5px] text-red-600 font-semibold flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" /> {erroGeral}
          </p>
        )}

        {!aceite ? (
          <p className="py-3 px-4 rounded-xl bg-slate-100 text-slate-500 text-[13px] font-semibold text-center">Marque a caixa de aceite acima para continuar</p>
        ) : (
        <PrimaryButton disabled={enviando} onClick={continuar}>
          {enviando ? "Enviando código…" : "Continuar e confirmar e-mail"}
        </PrimaryButton>
        )}
        <p className="text-[11.5px] text-slate-400 flex items-start gap-1.5">
          <ShieldCheck size={14} className="shrink-0 text-emerald-500" />
          CPF, telefone e data de nascimento ficam visíveis só para você.
        </p>
      </div>
    </Screen>
  );
}
