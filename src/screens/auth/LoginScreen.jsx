import { Mail, Lock, AlertTriangle, Briefcase, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Screen, Field, PrimaryButton } from "../../components/ui.jsx";

export function LoginScreen({ onLogin, goCadastro, goForgot, goSocial }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailFormatValid && password.length > 0;

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onLogin();
  };

  return (
    <Screen>
      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Briefcase className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Conexão Free</h1>
          <p className="text-slate-500 text-[13px] mt-1">Conecta Serviços Freelancer, na hora certa</p>
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
          <PrimaryButton onClick={handleSubmit}>Entrar</PrimaryButton>
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

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => goSocial("google")} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white font-semibold text-[14px] text-slate-700 active:scale-[0.98] transition">
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">G</span>
            Google
          </button>
          <button onClick={() => goSocial("facebook")} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white font-semibold text-[14px] text-slate-700 active:scale-[0.98] transition">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">f</span>
            Facebook
          </button>
        </div>

        <p className="text-center text-[13px] text-slate-500 mt-8">
          Ainda não tem conta?{" "}
          <button onClick={goCadastro} className="text-teal-600 font-bold">Cadastre-se</button>
        </p>
      </div>
    </Screen>
  );
}
