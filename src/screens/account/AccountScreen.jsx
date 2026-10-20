import { ChevronRight, LogOut, Trash2, Calendar, AlertTriangle, Briefcase, History, Pencil, ShieldCheck, Ban, KeyRound } from "lucide-react";
import { useState } from "react";
import { Avatar, Field, Screen, TopBar } from "../../components/ui.jsx";
import { CartaoPush } from "../../components/CartaoPush.jsx";
import BotaoInstalar from "../../components/BotaoInstalar.jsx";
import { cpfOculto, mascaraTelefone } from "../../lib/validacao.js";

export function AccountScreen({
  mode, setMode, onDelete, onLogout, onOpenHistory, onOpenApplications, onOpenDiarias, onOpenBloqueados, onOpenSenha, onOpenPrivacidade,
  temSenha = true, iniciarExclusao = false, profile, onEditProfile,
}) {
  const [confirming, setConfirming] = useState(iniciarExclusao);
  const [typed, setTyped] = useState("");

  if (confirming) {
    return (
      <Screen>
        <TopBar title="Excluir conta" onBack={() => setConfirming(false)} />
        <div className="flex-1 w-full max-w-md mx-auto px-6 py-8 flex flex-col">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertTriangle size={26} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">Isso é permanente</h2>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
            Ao confirmar, seu perfil, suas vagas, conversas e avaliações serão apagados definitivamente do EiFreela,
            conforme a LGPD. Essa ação não pode ser desfeita.
          </p>
          <p className="text-[12.5px] font-semibold text-slate-600 mt-6 mb-2">Digite EXCLUIR para confirmar</p>
          <Field placeholder="EXCLUIR" value={typed} onChange={(e) => setTyped(e.target.value.toUpperCase())} />
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

  const dados = [
    { label: "E-mail", valor: profile.email },
    { label: "CPF", valor: cpfOculto(profile.cpf) },
    { label: "Nascimento", valor: profile.data_nascimento ? new Date(profile.data_nascimento + "T12:00:00").toLocaleDateString("pt-BR") : "—" },
    { label: "Telefone / WhatsApp", valor: mascaraTelefone(profile.telefone) },
  ];

  return (
    <Screen>
      <TopBar title="Minha conta" />
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 py-6 space-y-6">
        <button type="button" onClick={onEditProfile} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 text-left min-w-0">
          <Avatar url={profile.avatar_url} nome={profile.nome} size={56} />
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-slate-800 truncate">{profile.nome}</span>
            <span className="block text-[12px] text-slate-500 truncate">{profile.areas.join(" · ")}</span>
          </span>
          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Pencil size={14} />
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          {dados.map((d) => (
            <div key={d.label} className="p-3 rounded-xl bg-white border border-slate-100 min-w-0">
              <p className="text-[11px] text-slate-400 font-semibold">{d.label}</p>
              <p className="text-[13px] font-semibold text-slate-700 truncate">{d.valor}</p>
            </div>
          ))}
        </div>
        <p className="text-[11.5px] text-slate-400 flex items-start gap-1.5 -mt-3">
          <ShieldCheck size={13} className="shrink-0 mt-px text-emerald-500" /> CPF, e-mail, nascimento e telefone ficam visíveis só para você.
        </p>

        <div>
          <p className="text-[13px] font-bold text-slate-700 mb-2">Como você está usando o app</p>
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

        <CartaoPush />
        <BotaoInstalar />

        <div className="space-y-2">
          {[
            { icon: Briefcase, label: "Minhas candidaturas", onClick: onOpenApplications },
            { icon: Calendar, label: "Minhas diárias", onClick: onOpenDiarias },
            { icon: History, label: "Histórico e avaliações", onClick: onOpenHistory },
          ].map((it) => {
            const Icon = it.icon;
            return (
              <button key={it.label} onClick={it.onClick} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-100">
                <Icon size={17} className="text-slate-500" />
                <span className="text-[13.5px] font-medium text-slate-700 flex-1 text-left">{it.label}</span>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-[12.5px] font-bold text-slate-600">Configurações</p>
          {[
            { icon: KeyRound, label: temSenha ? "Alterar senha" : "Criar senha", onClick: onOpenSenha },
            { icon: ShieldCheck, label: "Privacidade e LGPD", onClick: onOpenPrivacidade },
            { icon: Ban, label: "Pessoas bloqueadas", onClick: onOpenBloqueados },
          ].map((it) => {
            const Icon = it.icon;
            return (
              <button key={it.label} onClick={it.onClick} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-100">
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
