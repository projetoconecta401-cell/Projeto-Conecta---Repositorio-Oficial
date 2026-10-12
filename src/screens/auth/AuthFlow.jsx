import { useEffect, useState } from "react";
import { entrar } from "../../lib/auth.js";
import { CadastroScreen } from "./CadastroScreen.jsx";
import { ForgotPasswordScreen } from "./ForgotPasswordScreen.jsx";
import { LoginScreen } from "./LoginScreen.jsx";
import { TermsScreen } from "./TermsScreen.jsx";

/* Telas de quem ainda não entrou: login, cadastro, recuperar senha e termos.
   O botão "voltar" do celular volta para a tela anterior em vez de fechar o app. */
export function AuthFlow() {
  const [pilha, setPilha] = useState(["login"]);
  const tela = pilha[pilha.length - 1];

  const ir = (t) => {
    setPilha((p) => [...p, t]);
    window.history.pushState({ auth: t }, "");
    window.scrollTo(0, 0);
  };
  const voltar = () => window.history.back();

  useEffect(() => {
    const aoVoltar = () => setPilha((p) => (p.length > 1 ? p.slice(0, -1) : p));
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  if (tela === "cadastro") return <CadastroScreen onBack={voltar} onOpenTerms={() => ir("termos")} />;
  if (tela === "esqueci") return <ForgotPasswordScreen onBack={voltar} />;
  if (tela === "termos") return <TermsScreen onBack={voltar} />;
  return <LoginScreen onLogin={entrar} goCadastro={() => ir("cadastro")} goForgot={() => ir("esqueci")} />;
}
