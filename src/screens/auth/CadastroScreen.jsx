import {
  Mail, Lock, User, Check, Camera, AlertTriangle, Eye, EyeOff, ImagePlus, Phone, Home, Cake
} from "lucide-react";
import { useState } from "react";
import { Screen, TopBar, Field, VerifiableField, PrimaryButton } from "../../components/ui.jsx";
import { authDisponivel, enviarCodigo, verificarCodigo } from "../../lib/auth.js";

/* ------------------------------------------------------------------ */
/*  MODULE 1 — AUTH / ONBOARDING / SECURITY / TERMS / ACCOUNT          */
/* ------------------------------------------------------------------ */

export function CadastroScreen({ onBack, onNext, socialProvider, socialPrefill }) {
  const [photo, setPhoto] = useState(!!socialProvider);
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [ageError, setAgeError] = useState("");

  const [name, setName] = useState(socialPrefill?.name || "");
  const [email, setEmail] = useState(socialPrefill?.email || "");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [generatedEmailCode, setGeneratedEmailCode] = useState("");
  // Com contas reais, o e-mail sempre é confirmado por código (inclusive no caminho Google/Facebook).
  const emailReal = authDisponivel();
  const [emailVerified, setEmailVerified] = useState(!!socialProvider && !emailReal);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailCodeError, setEmailCodeError] = useState("");

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  // Senha exigida também no caminho Google/Facebook: sem OAuth configurado, a conta real é por e-mail e senha.
  const passwordsOk = password.length >= 6 && password === confirmPassword;

  const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

  // Supabase configurado: código real enviado ao e-mail (Edge Function codigo-email).
  // Sem Supabase: simulação de protótipo (código exibido na tela).
  const handleSendEmailCode = async () => {
    if (!emailFormatValid || emailBusy) return;
    setEmailCodeError("");
    setEmailCode("");
    if (!emailReal) {
      setGeneratedEmailCode(generateCode());
      setEmailCodeSent(true);
      return;
    }
    setEmailBusy(true);
    try {
      await enviarCodigo(email, "cadastro");
      setGeneratedEmailCode("");
      setEmailCodeSent(true);
    } catch (err) {
      setEmailCodeSent(false);
      setEmailCodeError(err.message);
    } finally {
      setEmailBusy(false);
    }
  };

  const handleConfirmEmailCode = async () => {
    if (!emailReal) {
      if (emailCode === generatedEmailCode) {
        setEmailVerified(true);
        setEmailCodeError("");
      } else {
        setEmailCodeError("Código incorreto. Confira e tente novamente.");
      }
      return;
    }
    if (emailBusy) return;
    setEmailBusy(true);
    try {
      await verificarCodigo(email, "cadastro", emailCode);
      setEmailVerified(true);
      setEmailCodeError("");
    } catch (err) {
      setEmailCodeError(err.message);
    } finally {
      setEmailBusy(false);
    }
  };

  const calcAge = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date();
    const birth = new Date(dateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleBirthChange = (e) => {
    const value = e.target.value;
    setBirthDate(value);
    const age = calcAge(value);
    if (age !== null && age < 18) {
      setAgeError("A Conexão Free é destinada apenas a maiores de 18 anos.");
    } else {
      setAgeError("");
    }
  };

  const pendencies = [
    { done: !!name.trim(), label: "Informar o nome completo" },
    { done: emailVerified, label: "Verificar o e-mail" },
    { done: passwordsOk, label: "Criar e confirmar a senha (mínimo 6 caracteres)" },
    { done: !!birthDate && !ageError, label: "Informar uma data de nascimento válida (18+)" },
  ];
  const canContinue = pendencies.every((p) => p.done);

  return (
    <Screen>
      <TopBar title="Criar conta" onBack={onBack} />
      <div className="flex-1 px-6 py-6 space-y-4">
        {socialProvider ? (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <span
              className={`w-7 h-7 rounded-full text-white text-[12px] font-bold flex items-center justify-center shrink-0 ${
                socialProvider === "google" ? "bg-red-500" : "bg-blue-600"
              }`}
            >
              {socialProvider === "google" ? "G" : "f"}
            </span>
            <p className="text-[12.5px] text-emerald-700 leading-snug">
              Continuando cadastro com informações do {socialProvider === "google" ? "Google" : "Facebook"}. Nome,
              e-mail e foto já foram importados — confira os dados e conclua as próximas etapas.
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-slate-500">Preencha seus dados de cadastro para começar.</p>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setPhoto(true)}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed transition ${
              photo ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-slate-50"
            }`}
          >
            {photo ? (
              <Check size={26} className="text-emerald-500" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <ImagePlus size={22} />
                <span className="text-[10px] font-medium">Foto de perfil</span>
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white">
              <Camera size={13} />
            </span>
          </button>
        </div>

        <Field icon={User} placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />

        <VerifiableField
          icon={Mail}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailVerified(false);
            setEmailCodeSent(false);
          }}
          verified={emailVerified}
          onVerify={handleSendEmailCode}
          codeSent={emailCodeSent}
          code={emailCode}
          onCodeChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onConfirmCode={handleConfirmEmailCode}
          generatedCode={generatedEmailCode}
          verifyLabel={emailBusy ? "Enviando…" : emailCodeSent ? "Reenviar" : "Verificar"}
          sentLabel={
            emailReal
              ? `Enviamos um código de 6 dígitos para ${email}. Confira também a caixa de spam.`
              : "Enviamos um código de confirmação para o seu e-mail."
          }
          codeError={emailCodeError}
        />
        {!emailCodeSent && emailCodeError && (
          <p role="alert" className="-mt-1 text-[11.5px] text-red-500 font-semibold flex items-center gap-1">
            <AlertTriangle size={12} /> {emailCodeError}
          </p>
        )}

        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Criar senha"
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white text-[15px] focus:outline-none focus:ring-2 transition ${
                passwordMismatch
                  ? "border-red-300 focus:ring-red-500/30"
                  : "border-slate-200 focus:ring-emerald-500/40 focus:border-emerald-500"
              }`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordMismatch && (
            <p className="text-[12px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
              <AlertTriangle size={12} /> As senhas não coincidem.
            </p>
          )}
        </div>

        <Field
          icon={Phone}
          type="tel"
          placeholder="Número de celular · (69) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Field icon={Home} placeholder="Endereço (rua, número, bairro)" />

        <div>
          <div className="relative">
            <Cake size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={birthDate}
              onChange={handleBirthChange}
              max={new Date().toISOString().split("T")[0]}
              className={`w-full pl-10 pr-3.5 py-3 rounded-xl border bg-white text-[15px] text-slate-700 focus:outline-none focus:ring-2 transition ${
                ageError ? "border-red-300 focus:ring-red-500/30" : "border-slate-200 focus:ring-emerald-500/40 focus:border-emerald-500"
              }`}
            />
          </div>
          {ageError ? (
            <p className="text-[12px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
              <AlertTriangle size={12} /> {ageError}
            </p>
          ) : (
            <p className="text-[11.5px] text-slate-400 mt-1.5">A Conexão Free é destinada apenas a maiores de 18 anos.</p>
          )}
        </div>

        <PrimaryButton
          className="mt-2"
          disabled={!canContinue}
          onClick={() =>
            onNext({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), birthDate, emailCode })
          }
        >
          Continuar
        </PrimaryButton>

        {!canContinue && (
          <div className="text-[11.5px] text-slate-400 pt-1">
            <p className="font-semibold text-slate-500 mb-1">Para continuar, finalize:</p>
            <ul className="space-y-0.5">
              {pendencies
                .filter((p) => !p.done)
                .map((p, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" /> {p.label}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </Screen>
  );
}
