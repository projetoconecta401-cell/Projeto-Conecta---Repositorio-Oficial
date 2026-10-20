import { MapPin, MessageCircle, AlertTriangle, CheckCircle2, ShieldCheck, Navigation, Star, Trash2, UserCheck, Users, Flag, GraduationCap, Briefcase, Globe, CalendarRange } from "lucide-react";
import { useEffect, useState } from "react";
import { ApplicationStatusPill } from "../components/jobs/ApplicationStatusPill.jsx";
import { CancelReasonModal } from "../components/jobs/CancelReasonModal.jsx";
import {
  Avatar, Carregando, EmptyState, Estrelas, GreenButton, OrangeButton, Pill, PrimaryButton, Screen, SecondaryButton, TopBar, WhatsAppIcon, toneDoStatus,
} from "../components/ui.jsx";
import { distanciaDaVaga, textoProximidade } from "../lib/geo.js";
import { curriculos, notasDosPerfis, perfisPorId } from "../lib/perfis.js";
import { resumoFormacao } from "../lib/curriculo.js";
import { regimeLabel } from "../data/catalogo.js";
import { contatoDaVaga, reais } from "../lib/vagas.js";
import { BotaoCompartilharDiaria, DenunciarSheet } from "../components/Seguranca.jsx";
import { soDigitos } from "../lib/validacao.js";
import { timeAgo } from "../lib/time.js";

const hora = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/* Pessoa (contratante, candidato ou contratado) com nota e, se houver, resumo do mini currículo. */
function LinhaPessoa({ perfil, nota, cv, onOpen, children }) {
  const formacao = resumoFormacao(cv?.formacao);
  const exp = cv?.experiencias?.[0];
  const temResumo = cv && (formacao || exp || cv.sobre);
  return (
    <div className="p-3 rounded-xl bg-white border border-slate-100 min-w-0 flex flex-col gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <button type="button" onClick={onOpen} className="flex items-center gap-3 min-w-0 flex-1 text-left">
          <Avatar url={perfil?.avatar_url} nome={perfil?.nome} size={44} />
          <span className="min-w-0 flex flex-col gap-0.5">
            <span className="font-bold text-slate-800 text-[14px] truncate">{perfil?.nome ?? "Usuário"}</span>
            {nota ? <Estrelas valor={nota.media} total={nota.total} /> : <span className="text-[11.5px] text-slate-400">Ainda sem avaliações</span>}
          </span>
        </button>
        {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
      </div>
      {temResumo && (
        <button type="button" onClick={onOpen} className="text-left flex flex-col gap-1 pl-3 border-l-2 border-emerald-200 min-w-0">
          {formacao && (
            <span className="flex items-start gap-1.5 text-[12px] text-slate-600 min-w-0">
              <GraduationCap size={13} className="shrink-0 mt-0.5 text-emerald-600" /> <span className="min-w-0 break-words">{formacao}</span>
            </span>
          )}
          {exp && (
            <span className="flex items-start gap-1.5 text-[12px] text-slate-600 min-w-0">
              <Briefcase size={13} className="shrink-0 mt-0.5 text-emerald-600" />
              <span className="min-w-0 break-words">
                {exp.funcao}{exp.local ? ` · ${exp.local}` : ""}{exp.periodo ? ` (${exp.periodo})` : ""}
                {cv.experiencias.length > 1 ? ` · +${cv.experiencias.length - 1}` : ""}
              </span>
            </span>
          )}
          {cv.sobre && <span className="text-[12px] text-slate-500 italic line-clamp-2 break-words">“{cv.sobre}”</span>}
          <span className="text-[11.5px] font-bold text-emerald-700">Ver currículo completo</span>
        </button>
      )}
    </div>
  );
}

export function JobDetail({
  job, loading, userId, posicao, jaAvaliei, onBack, onApply, onAccept, onCancelHire, onWithdraw, onCheckIn, onCheckOut, onComplete,
  onDelete, onRate, onOpenChat, onOpenProfile, onOfficialized, onAviso,
}) {
  const [perfis, setPerfis] = useState({});
  const [notas, setNotas] = useState({});
  const [cvs, setCvs] = useState({});
  const [modal, setModal] = useState(null); // "desistir" | "cancelar"
  const [ocupado, setOcupado] = useState(false);
  const [denunciando, setDenunciando] = useState(false);
  const [whatsapp, setWhatsapp] = useState(null);

  // WhatsApp do contratante: o banco só libera para o profissional contratado.
  const vagaId = job?.id;
  const contratadoAqui = !!job?.isHired;
  useEffect(() => {
    setWhatsapp(null);
    if (vagaId && contratadoAqui) contatoDaVaga(vagaId).then(setWhatsapp);
  }, [vagaId, contratadoAqui]);

  const ids = job ? [job.ownerId, job.contratadoId, ...job.candidatos.map((c) => c.freelancerId)].filter(Boolean).join(",") : "";
  useEffect(() => {
    if (!ids) return;
    perfisPorId(ids.split(",")).then(setPerfis);
    curriculos(ids.split(",")).then(setCvs);
    notasDosPerfis().then(setNotas);
  }, [ids]);

  if (!job) {
    return (
      <Screen>
        <TopBar title="Detalhe da vaga" onBack={onBack} />
        {loading ? <Carregando /> : <EmptyState icon={AlertTriangle} title="Vaga não encontrada" text="Ela pode ter sido removida pelo contratante." />}
      </Screen>
    );
  }

  const fazer = async (fn) => {
    setOcupado(true);
    try {
      await fn();
    } finally {
      setOcupado(false);
    }
  };

  const proximidade = textoProximidade(distanciaDaVaga(job, posicao));
  const aberta = ["Disponível", "Em Negociação"].includes(job.status);
  const contratado = job.contratadoId ? perfis[job.contratadoId] : null;
  const zap = soDigitos(whatsapp);
  const whatsappLink =
    !job.isOwner && job.isHired && zap.length >= 10
      ? `https://wa.me/55${zap}?text=${encodeURIComponent(`Olá! Vi a vaga "${job.title}" no EiFreela e gostaria de conversar sobre ela.`)}`
      : null;
  const conversaDoContratado = job.candidatos.find((c) => c.freelancerId === job.contratadoId)?.conversaId;

  return (
    <Screen>
      <TopBar title="Detalhe da vaga" onBack={onBack} />
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 py-5 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-5">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Pill tone="teal">{job.category}</Pill>
            {job.tipo !== "diaria" && <Pill tone="blue">{job.tipoLabel}</Pill>}
            <Pill tone={toneDoStatus(job.status)}>{job.status}</Pill>
            {job.applicationStatus && <ApplicationStatusPill status={job.applicationStatus} />}
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 mt-2.5 break-words">{job.title}</h2>
          <p className="text-[12.5px] text-slate-400 mt-1">Publicada {timeAgo(new Date(job.createdAt)) === "agora" ? "agora" : `há ${timeAgo(new Date(job.createdAt))}`}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 min-w-0">
            <p className="text-[11px] text-slate-400">Valor</p>
            <p className="text-[17px] font-extrabold text-emerald-700 mt-0.5">
              {reais(job.value)}<span className="text-[12px] font-semibold text-slate-500">{job.valorSufixo}</span>
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 min-w-0">
            <p className="text-[11px] text-slate-400">{job.tipo === "temporario" ? "Período" : job.tipo === "freela" ? "Prazo" : "Data e horário"}</p>
            <p className="text-[13px] font-bold text-slate-700 mt-1 break-words">{job.date}</p>
          </div>
        </div>

        {(job.tipo === "temporario" || job.quantidade > 1) && (
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 flex flex-col gap-1.5 text-[13px] text-sky-900">
            <p className="font-bold flex items-center gap-1.5"><CalendarRange size={15} /> {job.tipo === "temporario" ? "Contrato temporário" : "Mais de uma vaga"}</p>
            {job.cargaHoraria && <p><b>Carga horária:</b> {job.cargaHoraria}</p>}
            {job.tipo === "temporario" && job.regime && <p><b>Regime:</b> {regimeLabel(job.regime)}</p>}
            {job.quantidade > 1 && <p><b>Vagas abertas:</b> {job.quantidade}</p>}
          </div>
        )}

        {/* Item 4: só região aproximada — nunca o endereço exato. */}
        {job.remoto ? (
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[14px] font-semibold text-slate-700 flex items-center gap-1.5"><Globe size={15} className="text-emerald-500" /> Trabalho remoto</p>
            <p className="text-[12.5px] text-slate-500 mt-1">Pode ser feito à distância. Contratante em {job.city}/{job.state}.</p>
          </div>
        ) : (
        <div className="p-3.5 rounded-xl bg-white border border-slate-100">
          <p className="text-[11px] text-slate-400 mb-1.5">Região aproximada</p>
          <p className="text-[14px] font-semibold text-slate-700 flex items-center gap-1.5">
            {proximidade ? <Navigation size={15} className="text-emerald-500 shrink-0" /> : <MapPin size={15} className="text-emerald-500 shrink-0" />}
            <span className="min-w-0 break-words">{proximidade ?? job.neighborhood}</span>
          </p>
          <p className="text-[12.5px] text-slate-500 mt-1 break-words">
            {job.neighborhood} · {job.city}/{job.state}
          </p>
          <p className="text-[11.5px] text-slate-400 mt-2 flex items-start gap-1.5">
            <ShieldCheck size={13} className="shrink-0 mt-px text-emerald-500" />
            Por segurança, o endereço exato não aparece no app. Ele é combinado pelo chat com o profissional contratado.
          </p>
        </div>
        )}

        {job.details && (
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[11px] text-slate-400 mb-1.5">Detalhes do serviço</p>
            <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-line break-words">{job.details}</p>
          </div>
        )}

        {(job.checkInAt || job.checkOutAt) && (
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 flex gap-6">
            {job.checkInAt && (
              <div>
                <p className="text-[11px] text-slate-400">Check-in</p>
                <p className="text-[14px] font-bold text-slate-700 mt-0.5">{hora(job.checkInAt)}</p>
              </div>
            )}
            {job.checkOutAt && (
              <div>
                <p className="text-[11px] text-slate-400">Check-out</p>
                <p className="text-[14px] font-bold text-slate-700 mt-0.5">{hora(job.checkOutAt)}</p>
              </div>
            )}
          </div>
        )}

        {!job.isOwner && (
          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-2">Contratante</p>
            <LinhaPessoa perfil={perfis[job.ownerId] ?? { nome: job.contractorName }} nota={notas[job.ownerId]} onOpen={() => onOpenProfile(job.ownerId)} />
          </div>
        )}

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#25D366] text-[#128C4A] font-bold text-[13.5px] bg-[#25D366]/10 hover:bg-[#25D366]/20 transition"
          >
            <WhatsAppIcon size={17} /> Falar no WhatsApp
          </a>
        )}

        {/* ------------------------------------------------ DONO DA VAGA -- */}
        {job.isOwner && (
          <div className="space-y-4">
            {contratado || job.contratadoId ? (
              <div>
                <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                  <UserCheck size={15} className="text-emerald-600" /> Profissional contratado
                </p>
                <LinhaPessoa perfil={contratado} nota={notas[job.contratadoId]} cv={cvs[job.contratadoId]} onOpen={() => onOpenProfile(job.contratadoId)}>
                  {conversaDoContratado && (
                    <button onClick={() => onOpenChat(conversaDoContratado)} aria-label="Abrir conversa" className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                      <MessageCircle size={17} />
                    </button>
                  )}
                </LinhaPessoa>
              </div>
            ) : (
              <div>
                <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                  <Users size={15} /> Candidatos ({job.candidatos.length})
                </p>
                {job.candidatos.length === 0 ? (
                  <p className="text-[12.5px] text-slate-400 p-3.5 rounded-xl bg-white border border-dashed border-slate-200">
                    Ninguém se candidatou ainda. Você recebe um aviso quando alguém se candidatar.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {job.candidatos.map((c) => (
                      <LinhaPessoa key={c.conversaId} perfil={perfis[c.freelancerId]} nota={notas[c.freelancerId]} cv={cvs[c.freelancerId]} onOpen={() => onOpenProfile(c.freelancerId)}>
                        <button onClick={() => onOpenChat(c.conversaId)} aria-label="Conversar" className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
                          <MessageCircle size={17} />
                        </button>
                        {aberta && (
                          <button
                            disabled={ocupado}
                            onClick={() => fazer(() => onAccept(job, c.freelancerId))}
                            className="px-3 py-2.5 rounded-lg bg-emerald-600 text-white text-[12.5px] font-bold disabled:opacity-50"
                          >
                            Aceitar
                          </button>
                        )}
                      </LinhaPessoa>
                    ))}
                  </div>
                )}
                {aberta && job.candidatos.length > 0 && (
                  <p className="text-[11.5px] text-slate-400 mt-2">
                    {job.quantidade > 1 ? (
                      <>Você pode aceitar até <b>{job.quantidade}</b> pessoas. Cada uma ganha a própria vaga em <b>Minhas Vagas</b>; as outras posições continuam no mural.</>
                    ) : (
                      <>Ao aceitar um candidato, a vaga passa para <b>Em Atendimento</b> e sai do mural.</>
                    )}
                  </p>
                )}
              </div>
            )}

            {job.status === "Em Atendimento" && (
              <>
                <BotaoCompartilharDiaria job={job} souDono outroNome={contratado?.nome} onAviso={onAviso} />
                <GreenButton disabled={ocupado} onClick={() => fazer(() => onComplete(job))}>
                  <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Marcar diária como concluída</span>
                </GreenButton>
                <SecondaryButton disabled={ocupado} onClick={() => setModal("cancelar")} className="border-red-200 text-red-500">
                  Cancelar contratação
                </SecondaryButton>
              </>
            )}

            {job.status === "Concluída" && job.contratadoId && !jaAvaliei && (
              <PrimaryButton onClick={() => onRate(job)}>
                <span className="flex items-center justify-center gap-2"><Star size={16} /> Avaliar o profissional</span>
              </PrimaryButton>
            )}
            {job.status === "Concluída" && jaAvaliei && (
              <p className="p-3 rounded-xl bg-slate-100 text-slate-500 text-[12.5px] font-semibold text-center">Diária concluída e avaliada. Obrigado!</p>
            )}

            {!job.contratadoId && (
              <button onClick={() => onDelete(job)} className="w-full py-3 rounded-xl bg-red-50 text-red-500 font-bold text-[13.5px] flex items-center justify-center gap-2">
                <Trash2 size={16} /> Excluir vaga
              </button>
            )}
          </div>
        )}

        {/* ------------------------------------------------- PROFISSIONAL -- */}
        {!job.isOwner && (
          <div className="space-y-2.5">
            {!job.candidaturaId && !job.isHired && aberta && (
              <OrangeButton disabled={ocupado} onClick={() => fazer(() => onApply(job))}>
                Tenho interesse — candidatar-me
              </OrangeButton>
            )}
            {!job.candidaturaId && !job.isHired && !aberta && (
              <p className="p-3 rounded-xl bg-slate-100 text-slate-500 text-[12.5px] font-semibold text-center">Esta vaga não está mais aberta.</p>
            )}

            {job.applicationStatus === "Em análise" && (
              <>
                <p className="p-3 rounded-xl bg-amber-50 text-amber-700 text-[12.5px] font-semibold text-center">
                  Candidatura enviada. Aguardando o contratante escolher.
                </p>
                <SecondaryButton onClick={() => onOpenChat(job.candidaturaId)}>
                  <span className="flex items-center justify-center gap-2"><MessageCircle size={16} /> Abrir conversa</span>
                </SecondaryButton>
              </>
            )}

            {job.applicationStatus === "Não selecionado" && (
              <p className="p-3 rounded-xl bg-slate-100 text-slate-500 text-[12.5px] font-semibold text-center">
                Outro profissional foi selecionado para esta vaga.
              </p>
            )}

            {job.applicationStatus === "Diária agendada" && (
              <>
                <button onClick={() => onOfficialized(job)} className="w-full p-3 rounded-xl bg-emerald-50 text-emerald-700 text-[13px] font-bold">
                  🎉 Você foi selecionado! Ver detalhes da diária
                </button>
                <BotaoCompartilharDiaria job={job} souDono={false} outroNome={perfis[job.ownerId]?.nome} onAviso={onAviso} />
                <PrimaryButton disabled={ocupado} onClick={() => fazer(() => onCheckIn(job))}>
                  <span className="flex items-center justify-center gap-2"><MapPin size={16} /> Fazer check-in</span>
                </PrimaryButton>
                <SecondaryButton onClick={() => onOpenChat(job.candidaturaId)}>
                  <span className="flex items-center justify-center gap-2"><MessageCircle size={16} /> Ir para o chat</span>
                </SecondaryButton>
                <button onClick={() => setModal("desistir")} className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-[13.5px]">
                  Desistir da diária
                </button>
              </>
            )}

            {job.applicationStatus === "Em andamento" && (
              <>
                <GreenButton disabled={ocupado} onClick={() => fazer(() => onCheckOut(job))}>
                  <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Fazer check-out e finalizar</span>
                </GreenButton>
                <SecondaryButton onClick={() => onOpenChat(job.candidaturaId)}>
                  <span className="flex items-center justify-center gap-2"><MessageCircle size={16} /> Ir para o chat</span>
                </SecondaryButton>
              </>
            )}

            {job.applicationStatus === "Finalizada" &&
              (jaAvaliei ? (
                <p className="p-3 rounded-xl bg-slate-100 text-slate-500 text-[12.5px] font-semibold text-center">Diária finalizada e avaliada. Obrigado!</p>
              ) : (
                <PrimaryButton onClick={() => onRate(job)}>
                  <span className="flex items-center justify-center gap-2"><Star size={16} /> Avaliar o contratante</span>
                </PrimaryButton>
              ))}

            <button onClick={() => setDenunciando(true)} className="w-full flex items-center justify-center gap-1.5 pt-3 text-[12.5px] text-slate-400 font-semibold">
              <Flag size={13} /> Denunciar esta vaga
            </button>
          </div>
        )}
      </div>

      {denunciando && (
        <DenunciarSheet
          pessoa={perfis[job.ownerId] ?? { id: job.ownerId, nome: job.contractorName }}
          vagaId={job.id}
          onClose={() => setDenunciando(false)}
          onAviso={onAviso}
        />
      )}

      {modal && (
        <CancelReasonModal
          texto={
            modal === "desistir"
              ? "Você vai desistir desta diária. O contratante será avisado e a vaga volta para o mural."
              : "A contratação será cancelada, o profissional será avisado e a vaga volta para o mural."
          }
          onClose={() => setModal(null)}
          onConfirm={(motivo) => {
            const tipo = modal;
            setModal(null);
            fazer(() => (tipo === "desistir" ? onWithdraw(job, motivo) : onCancelHire(job)));
          }}
        />
      )}
    </Screen>
  );
}
