import { Check, Upload, Bell, ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  SMALL SHARED UI PIECES                                             */
/* ------------------------------------------------------------------ */

export const Screen = ({ children }) => (
  <div className="min-h-full flex flex-col bg-slate-50">{children}</div>
);

export const TopBar = ({ title, onBack, right }) => (
  <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-100 sticky top-0 z-20">
    {onBack && (
      <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-600">
        <ArrowLeft size={20} />
      </button>
    )}
    <h1 className="text-[17px] font-bold text-slate-800 flex-1 truncate">{title}</h1>
    {right}
  </div>
);

export const Field = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
    <input
      {...props}
      className={`w-full ${Icon ? "pl-10" : "pl-3.5"} pr-3.5 py-3 rounded-xl border border-slate-200 bg-white text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition`}
    />
  </div>
);

/* ------------------------------------------------------------------ */
/*  CAMPO COM VERIFICAÇÃO (e-mail / celular) — envia código simulado   */
/*  e só marca como confirmado quando o código digitado bate.          */
/* ------------------------------------------------------------------ */
export const VerifiableField = ({
  icon: Icon, type = "text", placeholder, value, onChange, verified, onVerify,
  codeSent, code, onCodeChange, onConfirmCode, generatedCode, verifyLabel, sentLabel, codeError,
}) => (
  <div>
    <div className="relative">
      <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={verified}
        className={`w-full pl-10 pr-[6.5rem] py-3 rounded-xl border bg-white text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
          verified
            ? "border-emerald-300 bg-emerald-50/50 text-emerald-700"
            : "border-slate-200 text-slate-800 focus:ring-emerald-500/40 focus:border-emerald-500"
        }`}
      />
      {verified ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[12px] font-bold text-emerald-600">
          <CheckCircle2 size={15} /> Verificado
        </span>
      ) : (
        <button
          type="button"
          onClick={onVerify}
          disabled={!value}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11.5px] font-bold disabled:opacity-40 transition"
        >
          {verifyLabel}
        </button>
      )}
    </div>

    {codeSent && !verified && (
      <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <p className="text-[11.5px] text-slate-500 mb-2 leading-snug">
          {sentLabel}
          {generatedCode && (
            <>
              {" "}Código (simulação de protótipo, sem envio real):{" "}
              <span className="font-bold text-slate-700 tracking-wider">{generatedCode}</span>
            </>
          )}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={onCodeChange}
            placeholder="Digite o código"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <button
            type="button"
            onClick={onConfirmCode}
            disabled={code.length < 6}
            className="shrink-0 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold disabled:opacity-40 transition"
          >
            Confirmar
          </button>
        </div>
        {codeError && (
          <p className="text-[11.5px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
            <AlertTriangle size={12} /> {codeError}
          </p>
        )}
      </div>
    )}
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
    className={`w-full py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-[15px] active:scale-[0.98] transition ${className}`}
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
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-teal-50 text-teal-600",
    blue: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-500",
  };
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
};

export const UploadBox = ({ label, hint, done, onClick, icon: Icon = Upload }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition text-left ${
      done ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-emerald-300"
    }`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-emerald-500 text-white" : "bg-white text-slate-400 border border-slate-200"}`}>
      {done ? <Check size={18} /> : <Icon size={18} />}
    </div>
    <div className="min-w-0">
      <p className="text-[14px] font-semibold text-slate-800">{label}</p>
      <p className="text-[12px] text-slate-500 truncate">{done ? "Arquivo enviado ✓" : hint}</p>
    </div>
  </button>
);

export const WhatsAppIcon = ({ size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.63 1.44 5.15L2 22l5.09-1.55a9.87 9.87 0 0 0 4.95 1.33h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2Zm5.8 14.14c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.11.32.02.51-.09.19-.14.31-.27.48-.14.17-.29.38-.41.51-.14.14-.28.29-.12.57.16.28.7 1.16 1.51 1.88 1.04.93 1.91 1.22 2.19 1.36.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.44.19.5.3.06.11.06.63-.18 1.31Z" />
  </svg>
);

export const Toast = ({ toast }) =>
  !toast ? null : (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-sm animate-[fadeIn_.2s_ease]">
      <div className="flex items-start gap-3 bg-slate-900 text-white rounded-2xl shadow-2xl p-4">
        <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
          <Bell size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold">{toast.title}</p>
          <p className="text-[12px] text-slate-300 mt-0.5">{toast.body}</p>
        </div>
      </div>
    </div>
  );
