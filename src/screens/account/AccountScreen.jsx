import {
  ShieldCheck, ChevronRight, LogOut, Trash2, Settings, Calendar, Building2, AlertTriangle,
  Briefcase, BadgeCheck, FileText, History, Pencil
} from "lucide-react";
import { useState } from "react";
import { Screen, TopBar, Field } from "../../components/ui.jsx";

export function AccountScreen({ mode, setMode, onDelete, onBack, onLogout, onOpenHistory, onOpenApplications, onOpenDiarias, profile, onEditProfile }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  if (confirming) {
    return (
      <Screen>
        <TopBar title="Excluir Conta" onBack={() => setConfirming(false)} />
        <div className="flex-1 px-6 py-8 flex flex-col">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertTriangle size={26} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">Isso é permanente</h2>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
            Ao confirmar, seus dados cadastrais, documentos, dados bancários e histórico serão apagados
            definitivamente da Conexão Free, conforme previsto na LGPD. Essa ação não pode ser desfeita.
          </p>
          <p className="text-[12.5px] font-semibold text-slate-600 mt-6 mb-2">Digite EXCLUIR para confirmar</p>
          <Field placeholder="EXCLUIR" value={typed} onChange={(e) => setTyped(e.target.value.toUpperCase())} />
          <div className="flex-1" />
          <button
            disabled={typed !== "EXCLUIR"}
            onClick={onDelete}
            className="w-full py-3.5 rounded-xl bg-red-500 text-white font-bold disabled:opacity-40 flex items-center justify-center gap-2 mt-6"
          >
            <Trash2 size={17} /> Excluir conta permanentemente
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title="Minha Conta" onBack={onBack} />
      <div className="flex-1 px-5 py-6 space-y-6">
        <button
          type="button"
          onClick={onEditProfile}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 text-left relative"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-lg shrink-0">
            {mode === "contratar" ? <Building2 size={24} /> : (profile.name?.[0] || "V").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-800 truncate">{profile.name || "Você"}</p>
            <p className="text-[12px] text-slate-500 truncate">
              {profile.city || "Brasil"} · {mode === "contratar" ? "Empresa verificada" : "Verificado"}{" "}
              <BadgeCheck size={12} className="inline text-emerald-500 -mt-0.5" />
            </p>
          </div>
          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Pencil size={14} />
          </span>
        </button>

        <div>
          <p className="text-[13px] font-bold text-slate-700 mb-2">Tipo de perfil</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: "contratar", label: "Contratar" },
              { id: "trabalhar", label: "Trabalhar" },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => setMode(o.id)}
                className={`py-3 rounded-xl border-2 font-semibold text-[13.5px] transition ${
                  mode === o.id ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="text-[11.5px] text-slate-400 mt-1.5">Alterne quando quiser, sem precisar de novo cadastro.</p>
        </div>

        <div className="space-y-2">
          {[
            { icon: Briefcase, label: "Minhas candidaturas", onClick: onOpenApplications },
            { icon: Calendar, label: "Minhas diárias", onClick: onOpenDiarias },
            { icon: History, label: "Histórico de trabalho", onClick: onOpenHistory },
            { icon: FileText, label: "Dados bancários e PIX" },
            { icon: ShieldCheck, label: "Documentos de verificação" },
            { icon: Settings, label: "Preferências de notificação" },
          ].map((it, i) => {
            const Icon = it.icon;
            return (
              <button key={i} onClick={it.onClick} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-100">
                <Icon size={17} className="text-slate-500" />
                <span className="text-[13.5px] font-medium text-slate-700 flex-1 text-left">{it.label}</span>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-2">
          <button onClick={onLogout} className="w-full flex items-center gap-2.5 p-3.5 rounded-xl text-slate-500 font-medium text-[13.5px]">
            <LogOut size={17} /> Sair da conta
          </button>
          <button onClick={() => setConfirming(true)} className="w-full flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-500 font-bold text-[13.5px]">
            <Trash2 size={17} /> Excluir conta permanentemente
          </button>
        </div>
      </div>
    </Screen>
  );
}
