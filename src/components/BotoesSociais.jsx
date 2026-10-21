import { useEffect, useRef, useState } from "react";
import { entrarComProvedor, montarBotaoGoogle } from "../lib/auth.js";

const GoogleIcone = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44Z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z"/></svg>
);
const btn = "w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white font-semibold text-[14px] text-slate-700 active:scale-[0.98] transition disabled:opacity-60";

/* Botões do Google e do Facebook (login e cadastro usam os mesmos).
   Conta nova criada por eles completa CPF, telefone e áreas depois. */
export function BotoesSociais({ onErro, cadastro = false }) {
  const [social, setSocial] = useState(null);
  const [gsi, setGsi] = useState("carregando"); // carregando | ok | falhou
  const caixa = useRef(null);

  // Botão oficial do Google; se não carregar (rede, bloqueador), volta ao login por redirecionamento.
  useEffect(() => {
    let vivo = true;
    const el = caixa.current;
    if (!el) return;
    montarBotaoGoogle(el, { largura: el.offsetWidth || 320, texto: cadastro ? "signup_with" : "continue_with", onErro })
      .then(() => vivo && setGsi("ok"))
      .catch(() => vivo && setGsi("falhou"));
    return () => { vivo = false; };
  }, [cadastro, onErro]);

  const handleSocial = async (provider) => {
    onErro?.("");
    setSocial(provider);
    try {
      await entrarComProvedor(provider);
    } catch (err) {
      onErro?.(err.message);
      setSocial(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div ref={caixa} className={`w-full flex justify-center min-h-[44px] ${gsi === "falhou" ? "hidden" : ""}`} />
      {gsi === "falhou" && (
        <button onClick={() => handleSocial("google")} disabled={!!social} className={btn}>
          <GoogleIcone /> {social === "google" ? "Abrindo…" : cadastro ? "Cadastrar com Google" : "Continuar com Google"}
        </button>
      )}
      <button onClick={() => handleSocial("facebook")} disabled={!!social} className={btn}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"/></svg>
        {social === "facebook" ? "Abrindo…" : cadastro ? "Cadastrar com Facebook" : "Continuar com Facebook"}
      </button>
    </div>
  );
}
