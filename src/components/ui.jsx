import { useEffect, useState } from "react";
import { Bell, ArrowLeft, Star, X } from "lucide-react";
import { iniciais } from "../lib/validacao.js";

/* ------------------------------------------------------------------ */
/*  PEÇAS DE INTERFACE COMPARTILHADAS                                  */
/*  Erro 1: nenhuma tela usa altura fixa + overflow hidden. A página   */
/*  rola normalmente; cabeçalhos e barras usam "sticky"/"fixed".       */
/* ------------------------------------------------------------------ */

export const Screen = ({ children, className = "" }) => (
  <div className={`min-h-[100dvh] flex flex-col bg-slate-50 ${className}`}>{children}</div>
);

export const TopBar = ({ title, onBack, right, subtitle }) => (
  <div className="flex items-center gap-3 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] bg-white/95 backdrop-blur border-b border-slate-100 sticky top-0 z-20">
    {onBack && (
      <button onClick={onBack} aria-label="Voltar" className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 shrink-0">
        <ArrowLeft size={20} />
      </button>
    )}
    <div className="flex-1 min-w-0">
      <h1 className="text-[17px] font-bold text-slate-800 truncate">{title}</h1>
      {subtitle && <p className="text-[12px] text-slate-500 truncate">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const Field = ({ icon: Icon, invalid, className = "", ...props }) => (
  <div className="relative">
    {Icon && <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
    <input
      {...props}
      className={`w-full ${Icon ? "pl-10" : "pl-3.5"} pr-3.5 py-3 rounded-xl border bg-white text-[16px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
        invalid ? "border-red-300 focus:ring-red-500/30" : "border-slate-200 focus:ring-emerald-500/40 focus:border-emerald-500"
      } ${className}`}
    />
  </div>
);

/* Rótulo + campo + mensagem de erro/ajuda. */
export const Campo = ({ label, erro, ajuda, children }) => (
  <div className="min-w-0">
    {label && <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">{label}</p>}
    {children}
    {erro ? (
      <p className="text-[12px] text-red-500 font-semibold mt-1.5">{erro}</p>
    ) : ajuda ? (
      <p className="text-[11.5px] text-slate-400 mt-1.5">{ajuda}</p>
    ) : null}
  </div>
);

export const PrimaryButton = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-[15px] shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition disabled:opacity-40 disabled:shadow-none ${className}`}
  >
    {children}
  </button>
);

export const SecondaryButton = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`w-full py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-[15px] active:scale-[0.98] transition disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

export const OrangeButton = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold text-[15px] shadow-lg shadow-teal-500/25 active:scale-[0.98] transition disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

export const GreenButton = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-[15px] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition disabled:opacity-40 disabled:shadow-none ${className}`}
  >
    {children}
  </button>
);

export const Pill = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    teal: "bg-teal-50 text-teal-700",
    red: "bg-red-50 text-red-600",
  };
  return <span className={`inline-block shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
};

export const toneDoStatus = (status) =>
  status === "Disponível" ? "green" : status === "Em Negociação" ? "orange" : status === "Concluída" ? "slate" : "blue";

/* Foto de perfil (ou iniciais). */
export function Avatar({ url, nome, size = 48, className = "" }) {
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [url]);
  const estilo = { width: size, height: size, fontSize: Math.round(size * 0.36) };
  if (url && !falhou) {
    return (
      <img
        src={url}
        alt={nome ? `Foto de ${nome}` : ""}
        style={estilo}
        loading="lazy"
        onError={() => setFalhou(true)}
        className={`rounded-full object-cover shrink-0 bg-slate-100 ${className}`}
      />
    );
  }
  return (
    <span
      style={estilo}
      aria-hidden="true"
      className={`rounded-full shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center ${className}`}
    >
      {iniciais(nome)}
    </span>
  );
}

export function Estrelas({ valor = 0, total, size = 13 }) {
  const cheias = Math.round(Number(valor));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Nota ${Number(valor).toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= cheias ? "text-amber-400" : "text-slate-200"} fill="currentColor" />
      ))}
      {total != null && <span className="text-[11.5px] text-slate-400 ml-1">({total})</span>}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="text-center py-12 px-6">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Icon size={28} />
        </div>
      )}
      <p className="text-[15px] font-bold text-slate-700">{title}</p>
      {text && <p className="text-[12.5px] text-slate-500 mt-1 max-w-xs mx-auto">{text}</p>}
      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </div>
  );
}

export function Carregando({ texto = "Carregando…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-[13px] text-slate-400" role="status">
      <span className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-emerald-600 animate-spin" />
      {texto}
    </div>
  );
}

export function CardsEsqueleto({ n = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 animate-pulse">
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="h-5 w-3/4 rounded bg-slate-100" />
          <div className="h-4 w-1/2 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

/* Folha inferior (bottom sheet) que rola por dentro e fica fixa na tela. */
export function Sheet({ title, onClose, children, footer }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90dvh] flex flex-col"
      >
        <div className="px-6 pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-extrabold text-slate-800">{title}</h2>
            <button onClick={onClose} aria-label="Fechar" className="p-1.5 -mr-1.5 rounded-full hover:bg-slate-100">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>
        <div className="px-6 pb-4 overflow-y-auto overscroll-contain flex-1">{children}</div>
        {footer && <div className="px-6 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-slate-100 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

export const WhatsAppIcon = ({ size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.63 1.44 5.15L2 22l5.09-1.55a9.87 9.87 0 0 0 4.95 1.33h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2Zm5.8 14.14c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.11.32.02.51-.09.19-.14.31-.27.48-.14.17-.29.38-.41.51-.14.14-.28.29-.12.57.16.28.7 1.16 1.51 1.88 1.04.93 1.91 1.22 2.19 1.36.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.44.19.5.3.06.11.06.63-.18 1.31Z" />
  </svg>
);

/* Aviso flutuante. toast: { title, body, onClick? }. */
export const Toast = ({ toast, onClose }) =>
  !toast ? null : (
    <div className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-sm animate-[fadeIn_.2s_ease]">
      <button
        type="button"
        onClick={() => {
          toast.onClick?.();
          onClose?.();
        }}
        className="w-full text-left flex items-start gap-3 bg-slate-900 text-white rounded-2xl shadow-2xl p-4"
      >
        <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
          <Bell size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold break-words">{toast.title}</p>
          {toast.body && <p className="text-[12px] text-slate-300 mt-0.5 break-words">{toast.body}</p>}
          {toast.onClick && <p className="text-[11.5px] text-teal-300 font-bold mt-1">Toque para ver</p>}
        </div>
      </button>
    </div>
  );
