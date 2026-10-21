import { Mail, Lock, AlertTriangle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Screen, Field, PrimaryButton } from "../../components/ui.jsx";
import { BotoesSociais } from "../../components/BotoesSociais.jsx";

export function LoginScreen({ onLogin, goCadastro, goForgot, onBack }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailFormatValid && password.length > 0;

  // onLogin pode ser assíncrono (Supabase Auth): mostra "Entrando…" e o erro, se houver.
  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit || loading) return;
    setLoginError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setLoginError(err?.message || "Não foi possível entrar agora.");
      setLoading(false);
    }
  };

  return (
    <Screen>
      {onBack && (
        <div className="w-full max-w-md mx-auto px-4 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <button onClick={onBack} className="flex items-center gap-1.5 px-2 py-2 -ml-2 rounded-full text-slate-500 text-[13px] font-semibold">
            <ArrowLeft size={18} /> Conhecer o app
          </button>
        </div>
      )}
      <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto px-6 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
        <div className="mb-10 text-center">
          <img src="/icons/icon-192.png" alt="" width="64" height="64" className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg shadow-emerald-500/20" />
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Ei<span className="text-emerald-600">Freela</span>
          </h1>
          <p className="text-slate-500 text-[13px] mt-1">Diárias e freelas perto de você, na hora certa</p>
        </div>

        <div className="space-y-3">
          <div>
            <Field
              icon={Mail}
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {touched && email && !emailFormatValid && (
              <p className="text-[11.5px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                <AlertTriangle size={12} /> Informe um e-mail em formato válido.
              </p>
            )}
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={show ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
            <button onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="text-right">
            <button onClick={goForgot} className="text-[13px] text-emerald-600 font-medium">Esqueci minha senha</button>
          </div>
          <PrimaryButton onClick={handleSubmit} disabled={loading}>{loading ? "Entrando…" : "Entrar"}</PrimaryButton>
          {loginError && (
            <p role="alert" className="text-[12px] text-red-500 font-semibold text-center flex items-center justify-center gap-1">
              <AlertTriangle size={12} /> {loginError}
            </p>
          )}
          {touched && !canSubmit && (
            <p className="text-[11.5px] text-red-500 font-semibold text-center flex items-center justify-center gap-1">
              <AlertTriangle size={12} /> Informe um e-mail válido e sua senha para entrar.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[12px] text-slate-400">ou entre/cadastre-se com</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <BotoesSociais onErro={setLoginError} />

        <p className="text-center text-[13px] text-slate-500 mt-8">
          Ainda não tem conta?{" "}
          <button onClick={goCadastro} className="text-teal-600 font-bold">Cadastre-se</button>
        </p>
      </div>
    </Screen>
  );
}
