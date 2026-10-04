import React from "react";
import { AlertTriangle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  ERROR BOUNDARY GLOBAL — blindagem contra falhas de renderização     */
/*  (endereça o BUG-501: um erro isolado em uma tela não derruba mais   */
/*  o app inteiro; a pessoa vê uma tela de recuperação, não uma página  */
/*  em branco.)                                                        */
/* ------------------------------------------------------------------ */
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Conexão Free — erro capturado pelo Error Boundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-3 p-8 text-center bg-slate-50">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertTriangle size={26} />
          </div>
          <p className="font-bold text-slate-800 text-[15px]">Ops, algo deu errado nesta tela.</p>
          <p className="text-[12.5px] text-slate-500 leading-snug max-w-xs">
            Isso não deveria acontecer — é um bom sinal para reportar. Você pode tentar recarregar esta parte do app.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
