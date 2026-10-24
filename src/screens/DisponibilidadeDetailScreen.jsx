import { useEffect, useState } from "react";
import { AlertTriangle, CalendarDays, ChevronRight, Clock, MapPin, MessageCircle, Pencil, Tag, Wallet } from "lucide-react";
import { Avatar, Carregando, EmptyState, Estrelas, Pill, Screen, TopBar } from "../components/ui.jsx";
import { perfilPublico } from "../lib/perfis.js";
import { resumoFormacao } from "../lib/curriculo.js";
import {
  STATUS, demonstrarInteresse, disponibilidadePorId, statusReal, textoDias, textoHorario, textoModalidades, textoPeriodo, textoPreco,
} from "../lib/disponibilidades.js";
import { timeAgo } from "../lib/time.js";

/* Detalhe de uma publicação: o contratante avalia o serviço e o profissional e demonstra interesse. */
export function DisponibilidadeDetailScreen({ dispId, userId, onBack, onOpenProfile, onOpenChat, onEditar, onAviso }) {
  const [d, setD] = useState(undefined);
  const [autor, setAutor] = useState(null);
  const [foto, setFoto] = useState(0);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    disponibilidadePorId(dispId)
      .then(async (x) => {
        setD(x);
        if (x) setAutor(await perfilPublico(x.usuario_id).catch(() => null));
      })
      .catch(() => setD(null));
  }, [dispId]);

  if (d === undefined) return <Screen><TopBar title="Serviço" onBack={onBack} /><Carregando /></Screen>;
  if (!d)
    return (
      <Screen>
        <TopBar title="Serviço" onBack={onBack} />
        <EmptyState icon={AlertTriangle} title="Publicação indisponível" text="Ela foi encerrada, pausada ou só pode ser vista por contratantes cadastrados." />
      </Screen>
    );

  const minha = d.usuario_id === userId;
  const st = statusReal(d);
  const interesse = async () => {
    setEnviando(true);
    try {
      const conversaId = await demonstrarInteresse(userId, d);
      onAviso?.({ title: "Interesse enviado", body: "O profissional recebeu sua mensagem. Continue pelo chat." });
      onOpenChat(conversaId);
    } catch (e) {
      onAviso?.({ title: "Não foi possível enviar", body: e.message });
      setEnviando(false);
    }
  };
  const Linha = ({ icon: Icon, rotulo, valor }) => (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-100 min-w-0">
      <Icon size={17} className="text-emerald-600 shrink-0 mt-0.5" />
      <div className="min-w-0"><p className="text-[11px] text-slate-400">{rotulo}</p><p className="text-[13.5px] font-semibold text-slate-700 break-words">{valor}</p></div>
    </div>
  );

  return (
    <Screen>
      <TopBar title="Serviço" onBack={onBack} />
      <div className="flex-1 w-full max-w-2xl mx-auto pb-32">
        {d.fotosUrl?.length > 0 && (
          <div className="bg-slate-900">
            <img src={d.fotosUrl[foto]} alt={`Foto ${foto + 1} do trabalho`} className="w-full max-h-[340px] object-contain mx-auto" />
            {d.fotosUrl.length > 1 && (
              <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar">
                {d.fotosUrl.map((u, i) => (
                  <button key={u} type="button" onClick={() => setFoto(i)} aria-label={`Ver foto ${i + 1}`} className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 ${i === foto ? "border-emerald-400" : "border-transparent opacity-70"}`}>
                    <img src={u} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Pill tone="teal">{d.categoria}</Pill>
            {(minha || st !== "ativa") && <Pill tone={STATUS[st]?.tom}>{STATUS[st]?.t}</Pill>}
          </div>
          <h1 className="text-[20px] font-extrabold text-slate-800 leading-snug break-words">{d.titulo}</h1>
          <p className="text-[12px] text-slate-400 -mt-2">Publicado: {timeAgo(new Date(d.criado_em))}</p>
          {d.descricao && <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-line break-words">{d.descricao}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Linha icon={Wallet} rotulo="Valor" valor={textoPreco(d)} />
            <Linha icon={MapPin} rotulo="Onde atende" valor={`${d.cidade}/${d.uf}${textoModalidades(d.modalidades) ? ` · ${textoModalidades(d.modalidades)}` : ""}`} />
            <Linha icon={CalendarDays} rotulo="Quando" valor={`${textoPeriodo(d)} · ${textoDias(d.dias_semana)}`} />
            <Linha icon={Clock} rotulo="Horário" valor={textoHorario(d)} />
          </div>

          {autor && (
            <button type="button" onClick={() => onOpenProfile(autor.id)} className="w-full p-4 rounded-2xl bg-white border border-slate-100 text-left flex items-center gap-3 min-w-0">
              <Avatar url={autor.avatar_url} nome={autor.nome} size={52} />
              <span className="min-w-0 flex-1 flex flex-col gap-0.5">
                <span className="font-bold text-slate-800 truncate">{autor.nome}</span>
                {autor.nota ? <Estrelas valor={autor.nota.media} total={autor.nota.total} /> : <span className="text-[11.5px] text-slate-400">Ainda sem avaliações</span>}
                {resumoFormacao(autor.formacao) && <span className="text-[12px] text-slate-500 truncate">{resumoFormacao(autor.formacao)}</span>}
                <span className="text-[12px] font-bold text-emerald-700 flex items-center gap-1"><Tag size={12} /> Ver perfil e resumo profissional</span>
              </span>
              <ChevronRight size={16} className="text-slate-300 shrink-0" />
            </button>
          )}
          <p className="text-[11.5px] text-slate-400 leading-snug">Por segurança, combine tudo pelo chat do EiFreela. Endereço e telefone não aparecem na publicação.</p>
        </div>
      </div>

      <div className="sticky bottom-0 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-slate-100 bg-white">
        <div className="w-full max-w-2xl mx-auto">
          {minha ? (
            <button onClick={() => onEditar(d)} className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-[14px] flex items-center justify-center gap-2">
              <Pencil size={16} /> Editar publicação
            </button>
          ) : (
            <button disabled={enviando} onClick={interesse} className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60">
              <MessageCircle size={17} /> {enviando ? "Enviando…" : "Tenho interesse"}
            </button>
          )}
        </div>
      </div>
    </Screen>
  );
}
