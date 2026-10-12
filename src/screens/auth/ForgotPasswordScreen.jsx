import { Mail, Lock, KeyRound, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Screen, TopBar, Field, PrimaryButton } from "../../components/ui.jsx";
import { enviarCodigo, redefinirSenha } from "../../lib/auth.js";
import { senhaValida } from "../../lib/validacao.js";
import { RequisitosSenha } from "../../components/CamposPerfil.jsx";

/* Etapa 2 da recuperação por e-mail (contas reais): código + nova senha. */
function ResetWithCode({ email, onBack, onResend }) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const ok = code.length === 6 && senhaValida(password) && password === confirm;

  const handleReset = async () => {
    if (!ok || busy) return;
    setError("");
    setBusy(true);
    try {
      await redefinirSenha(email, code, password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendMsg("");
    try {
      await onResend();
      setResendMsg("Se houver uma conta, um novo código foi enviado.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (done) {
    return (
      <div className="flex-1 px-6 py-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <CheckCircle2 size={28} />
        </div>
        <h2 className="text-lg font-extrabold text-slate-800">Senha alterada</h2>
        <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">Entre com o seu e-mail e a nova senha.</p>
        <PrimaryButton className="mt-8" onClick={onBack}>Voltar para o login</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-8">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
        <Mail size={26} />
      </div>
      <h2 className="text-lg font-extrabold text-slate-800">Verifique seu e-mail</h2>
      <p className="text-[13px] text-slate-500 mt-1.5 mb-5 leading-relaxed">
        Se houver uma conta associada a esse e-mail, enviamos um código de 6 dígitos. Confira também a caixa de spam.
      </p>
      <div className="space-y-3">
        <Field
          icon={KeyRound}
          inputMode="numeric"
          maxLength={6}
          placeholder="Código de 6 dígitos"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        <div>
          <Field icon={Lock} type="password" autoComplete="new-password" placeholder="Nova senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          <RequisitosSenha senha={password} />
        </div>
        <Field icon={Lock} type="password" placeholder="Confirme a nova senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {confirm && password !== confirm && (
          <p className="text-[12px] text-red-500 font-semibold flex items-center gap-1">
            <AlertTriangle size={12} /> As senhas não coincidem.
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[12.5px] text-red-600 font-semibold flex items-start gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" /> {error}
        </p>
      )}
      <PrimaryButton className="mt-5" disabled={!ok || busy} onClick={handleReset}>
        {busy ? "Alterando…" : "Alterar senha"}
      </PrimaryButton>
      <button type="button" onClick={handleResend} className="w-full text-center text-[13px] text-emerald-600 font-semibold mt-4 py-1">
        Reenviar código
      </button>
      {resendMsg && <p className="text-center text-[12px] text-slate-500 mt-1">{resendMsg}</p>}
    </div>
  );
}

export function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Envia o código por e-mail. A tela seguinte é sempre genérica (não revela se a conta existe).
  const handleContinue = async () => {
    if (!email || busy) return;
    setError("");
    setBusy(true);
    try {
      await enviarCodigo(email, "senha");
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Recuperar senha" onBack={onBack} />
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
        {sent ? (
          <ResetWithCode email={email} onBack={onBack} onResend={() => enviarCodigo(email, "senha")} />
        ) : (
          <div className="flex-1 px-6 py-8">
            <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
              Informe o e-mail da sua conta. Enviaremos um código para você criar uma nova senha.
            </p>
            <Field icon={Mail} type="email" inputMode="email" autoComplete="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && (
              <p role="alert" className="mt-3 text-[12px] text-red-500 font-semibold flex items-center gap-1">
                <AlertTriangle size={12} /> {error}
              </p>
            )}
            <PrimaryButton className="mt-4" disabled={!email || busy} onClick={handleContinue}>
              {busy ? "Enviando…" : "Enviar código"}
            </PrimaryButton>
          </div>
        )}
      </div>
    </Screen>
  );
}
