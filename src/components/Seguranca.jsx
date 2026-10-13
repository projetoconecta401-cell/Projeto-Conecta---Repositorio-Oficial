import { useEffect, useState } from "react";
import { Ban, CircleCheck, Flag, Share2, ShieldCheck, TriangleAlert, User, X } from "lucide-react";
import { Sheet } from "./ui.jsx";
import {
  MOTIVOS, aoMudarBloqueados, bloquear, bloqueados, denunciar, desbloquear, textoCompartilharDiaria,
} from "../lib/seguranca.js";

/* Ids que eu bloqueei (atualiza sozinho). */
export function useBloqueados() {
  const [ids, setIds] = useState(bloqueados());
  useEffect(() => aoMudarBloqueados((s) => setIds(new Set(s))), []);
  return ids;
}

/* ------------------------------------------------------------------ */
/*  Menu de segurança de uma pessoa: ver perfil, denunciar, bloquear.  */
/* ------------------------------------------------------------------ */
export function AcoesPessoaSheet({ pessoa, vagaId = null, conversaId = null, onClose, onVerPerfil, onAviso }) {
  const lista = useBloqueados();
  const [etapa, setEtapa] = useState("menu"); // menu | denunciar | bloquear
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const bloqueado = lista.has(pessoa.id);
  const primeiroNome = (pessoa.nome || "esta pessoa").split(" ")[0];

  if (etapa === "denunciar") {
    return <DenunciarSheet pessoa={pessoa} vagaId={vagaId} conversaId={conversaId} onClose={onClose} onAviso={onAviso} />;
  }

  const alternarBloqueio = async () => {
    setOcupado(true);
    setErro("");
    try {
      if (bloqueado) {
        await desbloquear(pessoa.id);
        onAviso?.({ title: `${primeiroNome} foi desbloqueado(a)` });
      } else {
        await bloquear(pessoa.id);
        onAviso?.({ title: `${primeiroNome} foi bloqueado(a)`, body: "Vocês não podem mais trocar mensagens nem se candidatar às vagas um do outro." });
      }
      onClose();
    } catch (e) {
      setErro(e.message);
      setOcupado(false);
    }
  };

  if (etapa === "bloquear") {
    return (
      <Sheet title={`Bloquear ${primeiroNome}?`} onClose={onClose}>
        <ul className="flex flex-col gap-2 text-[13.5px] text-slate-600 pt-1">
          <li>• Vocês não poderão mais trocar mensagens.</li>
          <li>• {primeiroNome} não poderá se candidatar às suas vagas, e as vagas dele(a) somem do seu mural.</li>
          <li>• {primeiroNome} não é avisado(a) do bloqueio. Você pode desbloquear em Perfil → Pessoas bloqueadas.</li>
        </ul>
        {erro && <p className="mt-3 text-[12.5px] text-red-500 font-semibold">{erro}</p>}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <button onClick={() => setEtapa("menu")} className="py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 text-[14px]">Voltar</button>
          <button disabled={ocupado} onClick={alternarBloqueio} className="py-3 rounded-xl bg-red-500 text-white font-bold text-[14px] disabled:opacity-50">
            {ocupado ? "Bloqueando…" : "Bloquear"}
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title={pessoa.nome || "Opções"} onClose={onClose}>
      <div className="flex flex-col gap-1.5 pt-1">
        {onVerPerfil && (
          <Opcao icon={User} onClick={() => { onClose(); onVerPerfil(); }}>Ver perfil e avaliações</Opcao>
        )}
        <Opcao icon={Flag} tom="laranja" onClick={() => setEtapa("denunciar")}>Denunciar</Opcao>
        {bloqueado ? (
          <Opcao icon={Ban} disabled={ocupado} onClick={alternarBloqueio}>Desbloquear {primeiroNome}</Opcao>
        ) : (
          <Opcao icon={Ban} tom="vermelho" onClick={() => setEtapa("bloquear")}>Bloquear {primeiroNome}</Opcao>
        )}
        {erro && <p className="text-[12.5px] text-red-500 font-semibold">{erro}</p>}
      </div>
    </Sheet>
  );
}

const Opcao = ({ icon: Icon, tom, children, ...props }) => (
  <button
    {...props}
    className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left font-semibold text-[14px] disabled:opacity-50 ${
      tom === "vermelho" ? "bg-red-50 text-red-600" : tom === "laranja" ? "bg-orange-50 text-orange-700" : "bg-slate-50 text-slate-700"
    }`}
  >
    <Icon size={18} className="shrink-0" /> {children}
  </button>
);

/* ------------------------------------------------------------------ */
/*  Denúncia                                                           */
/* ------------------------------------------------------------------ */
export function DenunciarSheet({ pessoa, vagaId = null, conversaId = null, onClose, onAviso }) {
  const [motivo, setMotivo] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [tambemBloquear, setTambemBloquear] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  const enviar = async () => {
    if (!motivo) return setErro("Escolha o motivo da denúncia.");
    setOcupado(true);
    setErro("");
    try {
      await denunciar({ denunciadoId: pessoa.id, motivo, detalhes, vagaId, conversaId });
      if (tambemBloquear) await bloquear(pessoa.id).catch(() => {});
      setEnviado(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  };

  if (enviado) {
    return (
      <Sheet title="Denúncia enviada" onClose={onClose}>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <CircleCheck size={44} className="text-emerald-500" />
          <p className="text-[14px] text-slate-600 leading-relaxed">
            Obrigado por ajudar a manter o EiFreela seguro. Vamos analisar o caso.
            {tambemBloquear ? " Esta pessoa também foi bloqueada." : ""}
          </p>
          <p className="text-[12.5px] text-slate-500 leading-relaxed">
            Se você estiver em perigo, ligue <b>190</b> (Polícia Militar). Golpes podem ser registrados na delegacia ou na delegacia virtual do seu estado.
          </p>
          <button onClick={() => { onAviso?.({ title: "Denúncia enviada", body: "Obrigado! Vamos analisar." }); onClose(); }} className="w-full mt-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-[14px]">
            Fechar
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      title={`Denunciar ${(pessoa.nome || "usuário").split(" ")[0]}`}
      onClose={onClose}
      footer={
        <button disabled={ocupado} onClick={enviar} className="w-full py-3.5 rounded-xl bg-orange-600 text-white font-bold text-[14.5px] disabled:opacity-50">
          {ocupado ? "Enviando…" : "Enviar denúncia"}
        </button>
      }
    >
      <p className="text-[12.5px] text-slate-500 mb-3">A pessoa não fica sabendo quem denunciou.</p>
      <div role="radiogroup" className="flex flex-col gap-2">
        {MOTIVOS.map((m) => (
          <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${motivo === m.id ? "border-orange-400 bg-orange-50" : "border-slate-200"}`}>
            <input type="radio" name="motivo" value={m.id} checked={motivo === m.id} onChange={() => { setMotivo(m.id); setErro(""); }} className="w-4 h-4 accent-orange-600" />
            <span className="text-[13.5px] text-slate-700 font-medium">{m.label}</span>
          </label>
        ))}
      </div>
      <textarea
        value={detalhes}
        onChange={(e) => setDetalhes(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Conte o que aconteceu (opcional)"
        className="w-full mt-3 px-3.5 py-3 rounded-xl border border-slate-200 text-[16px] resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/40"
      />
      <label className="flex items-center gap-2.5 mt-3">
        <input type="checkbox" checked={tambemBloquear} onChange={(e) => setTambemBloquear(e.target.checked)} className="w-5 h-5 accent-red-500" />
        <span className="text-[13px] text-slate-600">Também bloquear esta pessoa</span>
      </label>
      {erro && <p className="mt-3 text-[12.5px] text-red-500 font-semibold">{erro}</p>}
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Dicas de segurança no chat                                         */
/* ------------------------------------------------------------------ */
export function DicasSeguranca({ chave }) {
  const id = `eifreela:dicas:${chave}`;
  const [aberta, setAberta] = useState(() => {
    try {
      return !localStorage.getItem(id);
    } catch {
      return true;
    }
  });
  if (!aberta) return null;
  const fechar = () => {
    try {
      localStorage.setItem(id, "1");
    } catch {
      /* sem armazenamento */
    }
    setAberta(false);
  };
  return (
    <div className="relative p-3.5 pr-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-[12.5px] text-emerald-900 leading-relaxed">
      <button onClick={fechar} aria-label="Fechar dicas" className="absolute top-2 right-2 p-1.5 rounded-full text-emerald-700/70">
        <X size={16} />
      </button>
      <p className="font-bold flex items-center gap-1.5 mb-1"><ShieldCheck size={15} /> Dicas de segurança</p>
      <ul className="flex flex-col gap-0.5">
        <li>• Nunca pague nada para conseguir uma vaga.</li>
        <li>• Não passe códigos recebidos por SMS ou WhatsApp, senhas ou dados de cartão.</li>
        <li>• Combine tudo por aqui e avise alguém de confiança aonde vai.</li>
        <li>• Algo estranho? Toque nos ⋮ acima para denunciar ou bloquear.</li>
      </ul>
    </div>
  );
}

/* Aviso abaixo de uma mensagem que parece golpe. */
export const AlertaGolpe = () => (
  <p className="mt-1 max-w-[85%] flex items-start gap-1.5 px-2.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[11.5px] text-amber-900 leading-snug">
    <TriangleAlert size={14} className="shrink-0 mt-px text-amber-600" />
    <span>
      <b>Cuidado:</b> esta mensagem fala de pagamento, código, senha ou link. No EiFreela ninguém precisa pagar para trabalhar.
      Não clique em links desconhecidos nem passe códigos.
    </span>
  </p>
);

/* ------------------------------------------------------------------ */
/*  Compartilhar a diária com alguém de confiança                      */
/* ------------------------------------------------------------------ */
export function BotaoCompartilharDiaria({ job, souDono, outroNome, onAviso }) {
  const compartilhar = async () => {
    const texto = textoCompartilharDiaria(job, { souDono, outroNome });
    try {
      if (navigator.share) {
        await navigator.share({ title: "Minha diária no EiFreela", text: texto });
        return;
      }
      await navigator.clipboard.writeText(texto);
      onAviso?.({ title: "Texto copiado", body: "Cole no WhatsApp de alguém de confiança." });
    } catch (e) {
      if (e?.name !== "AbortError") window.prompt("Copie o texto:", texto);
    }
  };
  return (
    <button onClick={compartilhar} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 font-bold text-[13.5px]">
      <Share2 size={16} /> Compartilhar com alguém de confiança
    </button>
  );
}
