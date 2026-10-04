import { useEffect, useState } from "react";
import App from "./App.jsx";
import { aoMudarSessao, authDisponivel, sessaoAtual } from "./lib/auth.js";

/*
 * Acompanha a sessão do Supabase Auth e monta o App da conta atual.
 * O App é recriado do zero (key = id da conta) a cada login/logout, então nada
 * de uma conta (vagas "Você", conversas, telas abertas) aparece para outra.
 */
export default function AuthGate() {
  const [session, setSession] = useState(authDisponivel() ? undefined : null);

  useEffect(() => {
    if (!authDisponivel()) return;
    let ativo = true;
    sessaoAtual().then((s) => ativo && setSession(s));
    const parar = aoMudarSessao((s) => ativo && setSession(s));
    return () => {
      ativo = false;
      parar();
    };
  }, []);

  if (session === undefined) {
    return (
      <div className="w-full max-w-sm mx-auto h-[820px] max-h-[92vh] bg-slate-50 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 flex items-center justify-center font-sans">
        <p className="text-[13px] text-slate-400">Carregando…</p>
      </div>
    );
  }

  return <App key={session?.user?.id ?? "visitante"} session={session} />;
}
