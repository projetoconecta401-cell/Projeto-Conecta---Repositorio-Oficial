import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Screen, TopBar, Field, PrimaryButton } from "../../components/ui.jsx";

export function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [sentVia, setSentVia] = useState("email");

  const handleContinueEmail = () => {
    if (!email) return;
    setSentVia("email");
    setSent(true);
  };

  const handleContinuePhone = () => {
    if (!phone) return;
    setSentVia("celular");
    setSent(true);
  };

  if (sent) {
    return (
      <Screen>
        <TopBar title="Recuperar senha" onBack={onBack} />
        <div className="flex-1 px-6 py-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            {sentVia === "email" ? <Mail size={28} /> : <Phone size={28} />}
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">
            Verifique {sentVia === "email" ? "seu e-mail" : "seu celular"}
          </h2>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
            Se houver uma conta associada a {sentVia === "email" ? "esse e-mail" : "esse número"}, enviamos as
            instruções para redefinir sua senha.
          </p>
          <PrimaryButton className="mt-8" onClick={onBack}>Voltar para o login</PrimaryButton>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title="Recuperar senha" onBack={onBack} />
      <div className="flex-1 px-6 py-8">
        <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
          Insira seu e-mail para receber as instruções de redefinição de senha.
        </p>

        <Field icon={Mail} type="email" placeholder="Insira seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />

        <PrimaryButton className="mt-4" disabled={!email} onClick={handleContinueEmail}>
          Continuar
        </PrimaryButton>

        {!showPhone ? (
          <button
            type="button"
            onClick={() => setShowPhone(true)}
            className="w-full text-center text-[13px] text-emerald-600 font-semibold mt-4 py-1"
          >
            Encontrar pelo número do celular
          </button>
        ) : (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-[13px] text-slate-500 mb-3">Ou informe o número de celular cadastrado:</p>
            <Field
              icon={Phone}
              type="tel"
              placeholder="(69) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <PrimaryButton className="mt-4" disabled={!phone} onClick={handleContinuePhone}>
              Continuar
            </PrimaryButton>
          </div>
        )}
      </div>
    </Screen>
  );
}
