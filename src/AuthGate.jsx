import { useCallback, useEffect, useState } from "react";
import App from "./App.jsx";
import { aoMudarSessao, sessaoAtual } from "./lib/auth.js";
import { meuPerfil } from "./lib/perfis.js";
import { AuthFlow } from "./screens/auth/AuthFlow.jsx";
import { CompletarPerfilScreen } from "./screens/auth/CompletarPerfilScreen.jsx";
import { PrimaryButton } from "./components/ui.jsx";

/*
 * Acompanha a sessão do Supabase Auth:
 *  - sem conta → telas de login/cadastro;
 *  - conta sem perfil (login com Google/Facebook ou conta antiga) → "Complete seu perfil";
 *  - conta com perfil → App (recriado do zero a cada troca de conta).
 */
function Abrindo({ texto = "Abrindo o EiFreela…" }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-3 bg-slate-50">
      <img src="/icons/icon-192.png" width="64" height="64" alt="" className="rounded-2xl" />
      <p className="text-[13px] text-slate-400">{texto}</p>
    </div>
  );
}

export default function AuthGate() {
  const [session, setSession] = useState(undefined);
  const [perfil, setPerfil] = useState(undefined);
  const [erroPerfil, setErroPerfil] = useState("");

  useEffect(() => {
    let ativo = true;
    sessaoAtual().then((s) => ativo && setSession(s));
    const parar = aoMudarSessao((s) => ativo && setSession(s));
    return () => {
      ativo = false;
      parar();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  const carregarPerfil = useCallback(async () => {
    if (!userId) return setPerfil(null);
    setErroPerfil("");
    try {
      setPerfil(await meuPerfil());
    } catch (err) {
      setErroPerfil(err.message);
    }
  }, [userId]);

  useEffect(() => {
    if (session === undefined) return;
    setPerfil(undefined);
    carregarPerfil();
  }, [userId, session === undefined]); // eslint-disable-line react-hooks/exhaustive-deps

  if (session === undefined) return <Abrindo />;
  if (!session) return <AuthFlow />;
  if (erroPerfil) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-8 text-center bg-slate-50">
        <p className="text-[14px] text-slate-600">{erroPerfil}</p>
        <PrimaryButton className="max-w-xs" onClick={carregarPerfil}>Tentar novamente</PrimaryButton>
      </div>
    );
  }
  if (perfil === undefined) return <Abrindo />;
  if (!perfil) return <CompletarPerfilScreen usuario={session.user} onDone={carregarPerfil} />;
  return <App key={userId} session={session} perfil={perfil} onPerfilAlterado={carregarPerfil} />;
}
