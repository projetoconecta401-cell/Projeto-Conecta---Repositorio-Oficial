import { useState } from "react";
import { CircleCheck, Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { Campo, Field, PrimaryButton, Screen, TopBar } from "../../components/ui.jsx";
import { RequisitosSenha } from "../../components/CamposPerfil.jsx";
import { alterarSenha, temSenhaPropria } from "../../lib/auth.js";
import { senhaValida } from "../../lib/validacao.js";

/*
 * Configurações → Alterar senha. Pede a senha atual (confere antes de trocar).
 * Quem entrou só com Google/Facebook ainda não tem senha: aqui pode criar uma.
 */
export function AlterarSenhaScreen({ session, onBack, onAviso }) {
  const criando = !temSenhaPropria(session.user);
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [pronto, setPronto] = useState(false);

  const salvar = async () => {
    const er = {};
    if (!criando && !atual) er.atual = "Digite sua senha atual.";
    if (!senhaValida(nova)) er.nova = "A nova senha não cumpre todos os requisitos.";
    else if (!criando && nova === atual) er.nova = "A nova senha precisa ser diferente da atual.";
    if (confirmar !== nova) er.confirmar = "As senhas não são iguais.";
    setErros(er);
    setErroGeral("");
    if (Object.keys(er).length) return;
    setOcupado(true);
    try {
      await alterarSenha({ email: session.user.email, atual: criando ? null : atual, nova });
      setPronto(true);
      onAviso?.({ title: criando ? "Senha criada" : "Senha alterada", body: "Use a nova senha no próximo login." });
    } catch (e) {
      if (e.campo) setErros({ [e.campo]: e.message });
      else setErroGeral(e.message);
    } finally {
      setOcupado(false);
    }
  };

  const tipo = mostrar ? "text" : "password";

  return (
    <Screen>
      <TopBar title={criando ? "Criar senha" : "Alterar senha"} onBack={onBack} />
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col gap-4">
        {pronto ? (
          <div className="flex flex-col items-center text-center gap-3 py-8">
            <CircleCheck size={48} className="text-emerald-500" />
            <p className="text-[15px] font-bold text-slate-800">{criando ? "Senha criada!" : "Senha alterada!"}</p>
            <p className="text-[13px] text-slate-500">
              {criando
                ? "Agora você também pode entrar com seu e-mail e esta senha."
                : "Da próxima vez, entre com a nova senha. Este aparelho continua conectado."}
            </p>
            <PrimaryButton onClick={onBack} className="mt-2">Voltar</PrimaryButton>
          </div>
        ) : (
          <>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              {criando
                ? "Você entrou com Google ou Facebook. Crie uma senha para também poder entrar com seu e-mail."
                : "Por segurança, confirme sua senha atual antes de escolher a nova."}
            </p>
            {!criando && (
              <Campo label="Senha atual" erro={erros.atual}>
                <Field icon={Lock} type={tipo} autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} invalid={!!erros.atual} />
              </Campo>
            )}
            <Campo label="Nova senha" erro={erros.nova}>
              <Field icon={KeyRound} type={tipo} autoComplete="new-password" value={nova} onChange={(e) => setNova(e.target.value)} invalid={!!erros.nova} />
              <RequisitosSenha senha={nova} />
            </Campo>
            <Campo label="Confirme a nova senha" erro={erros.confirmar}>
              <Field icon={KeyRound} type={tipo} autoComplete="new-password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} invalid={!!erros.confirmar} />
            </Campo>
            <button type="button" onClick={() => setMostrar((v) => !v)} className="self-start flex items-center gap-1.5 text-[13px] text-emerald-700 font-semibold">
              {mostrar ? <EyeOff size={16} /> : <Eye size={16} />} {mostrar ? "Esconder senhas" : "Mostrar senhas"}
            </button>
            {erroGeral && (
              <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-[12.5px] text-red-600 font-semibold">{erroGeral}</p>
            )}
            <PrimaryButton disabled={ocupado} onClick={salvar}>
              {ocupado ? "Salvando…" : criando ? "Criar senha" : "Alterar senha"}
            </PrimaryButton>
            {!criando && (
              <p className="text-[12px] text-slate-400 text-center">
                Esqueceu a senha atual? Saia da conta e use “Esqueci minha senha” na tela de login.
              </p>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}
