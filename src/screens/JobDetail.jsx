import { MapPin, Star, MessageCircle, AlertTriangle, CheckCircle2, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { ApplicationStatusPill } from "../components/jobs/ApplicationStatusPill.jsx";
import { CancelReasonModal } from "../components/jobs/CancelReasonModal.jsx";
import {
  Screen, TopBar, PrimaryButton, OrangeButton, GreenButton, Pill, WhatsAppIcon
} from "../components/ui.jsx";

export function JobDetail({ job, onBack, onApply, onAccept, onReopen, onGoChat, onCheckIn, onCheckOut }) {
  const isMine = job.candidate === "Você";
  const [showCancelModal, setShowCancelModal] = useState(false);
  const whatsappMessage = encodeURIComponent(
    `Olá! Vi a vaga "${job.title}" na Conexão Free e gostaria de conversar sobre ela.`
  );
  const whatsappLink = job.contractorPhone
    ? `https://wa.me/55${job.contractorPhone.replace(/\D/g, "")}?text=${whatsappMessage}`
    : null;
  return (
    <Screen>
      <TopBar title="Detalhe da vaga" onBack={onBack} />
      <div className="flex-1 px-5 py-5 space-y-5 relative">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Pill tone="blue">{job.category}</Pill>
            <Pill tone={job.status === "Disponível" ? "green" : job.status === "Em Negociação" ? "orange" : job.status === "Concluída" ? "slate" : "blue"}>{job.status}</Pill>
            {isMine && job.applicationStatus && <ApplicationStatusPill status={job.applicationStatus} />}
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 mt-2.5">{job.title}</h2>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <p className="text-[13px] text-slate-500">
              Publicado por {job.contractor} {job.verified && <BadgeCheck size={13} className="inline text-emerald-500 -mt-0.5 ml-0.5" />}
            </p>
            {job.companyRating && (
              <span className="text-[12px] text-slate-500 flex items-center gap-1">
                · <Star size={11} className="text-teal-500" fill="currentColor" /> {job.companyRating}
                <span className="text-slate-400">({job.companyRatingCount})</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[11px] text-slate-400">Valor sugerido</p>
            <p className="text-[16px] font-extrabold text-emerald-700">R$ {job.value}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[11px] text-slate-400">Data e horário</p>
            <p className="text-[13px] font-bold text-slate-700 mt-1">{job.date}</p>
          </div>
        </div>

        {job.details && (
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[11px] text-slate-400 mb-1.5">Detalhes do serviço</p>
            <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line break-words">{job.details}</p>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-white border border-slate-100">
          <p className="text-[11px] text-slate-400 mb-1.5">Localização</p>
          {/* RN: endereço exato só para o candidato aprovado (vaga "Em Atendimento").
              Em análise ("Em Negociação"), mesmo quem se candidatou vê só o bairro. */}
          {job.status === "Em Atendimento" ? (
            <p className="text-[13.5px] font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-500" /> {job.address} — {job.neighborhood}
            </p>
          ) : (
            <div className="relative">
              {/* Texto fictício borrado: o endereço real não vai para o HTML (não dá para
                  copiar, inspecionar nem ler por leitor de tela). Em produção, a API
                  nem deveria enviar o endereço antes da aprovação. */}
              <p aria-hidden="true" className="text-[13.5px] font-semibold text-slate-400 blur-[3px] select-none">Rua Xxxxxxxx Xxxxx, 000</p>
              <p className="text-[12px] text-slate-500 mt-1">Bairro: <span className="font-semibold text-slate-700">{job.neighborhood}</span></p>
              <p className="text-[10.5px] text-slate-400 mt-1 italic">Endereço exato liberado após aprovação da candidatura</p>
            </div>
          )}
        </div>

        {(job.checkInAt || job.checkOutAt) && (
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 flex gap-4">
            {job.checkInAt && (
              <div>
                <p className="text-[11px] text-slate-400">Check-in</p>
                <p className="text-[13px] font-bold text-slate-700 mt-0.5">
                  {new Date(job.checkInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            )}
            {job.checkOutAt && (
              <div>
                <p className="text-[11px] text-slate-400">Check-out</p>
                <p className="text-[13px] font-bold text-slate-700 mt-0.5">
                  {new Date(job.checkOutAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            )}
          </div>
        )}

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#25D366] text-[#128C4A] font-bold text-[13.5px] bg-[#25D366]/10 hover:bg-[#25D366]/20 transition"
          >
            <WhatsAppIcon size={17} /> Falar com {job.contractor} no WhatsApp
          </a>
        )}

        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[12px] text-emerald-700 leading-relaxed">
          Ao clicar em "Aceitar Candidato", a vaga passa automaticamente para <b>Em Atendimento</b> e some do mural
          público. Se a negociação for cancelada, a vaga reabre sozinha.
        </div>

        <div className="pt-2 space-y-2.5">
          {job.status === "Disponível" && job.contractor === "Você" && (
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[12.5px] text-slate-500 flex items-center gap-2">
              <AlertTriangle size={15} className="text-slate-400 shrink-0" />
              Esta vaga foi publicada por você — não é possível se candidatar à própria vaga.
            </div>
          )}
          {job.status === "Disponível" && job.contractor !== "Você" && (
            <OrangeButton onClick={() => onApply(job)}>Candidatar-se à vaga</OrangeButton>
          )}

          {job.status === "Em Negociação" && !isMine && (
            <PrimaryButton onClick={() => onAccept(job)}>Aceitar candidato</PrimaryButton>
          )}

          {job.status === "Em Negociação" && isMine && (
            <div className="p-3 rounded-xl bg-teal-50 text-teal-700 text-[12.5px] font-semibold text-center">
              Aguardando o contratante aceitar sua candidatura...
            </div>
          )}

          {job.status === "Em Atendimento" && job.applicationStatus === "Diária agendada" && (
            <>
              <PrimaryButton onClick={() => onCheckIn(job)}>
                <span className="flex items-center justify-center gap-2"><MapPin size={16} /> Fazer check-in</span>
              </PrimaryButton>
              <button onClick={() => onGoChat(job)} className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-[13.5px] flex items-center justify-center gap-2">
                <MessageCircle size={16} /> Ir para o chat
              </button>
              <button onClick={() => setShowCancelModal(true)} className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-[13.5px]">
                Desistir / Cancelar negociação
              </button>
            </>
          )}

          {job.status === "Em Atendimento" && job.applicationStatus === "Em andamento" && (
            <>
              <GreenButton onClick={() => onCheckOut(job)}>
                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Fazer check-out / Finalizar diária</span>
              </GreenButton>
              <button onClick={() => onGoChat(job)} className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-[13.5px] flex items-center justify-center gap-2">
                <MessageCircle size={16} /> Ir para o chat
              </button>
            </>
          )}

          {job.status === "Em Atendimento" && !["Diária agendada", "Em andamento"].includes(job.applicationStatus) && (
            <>
              <PrimaryButton onClick={() => onGoChat(job)}>
                <span className="flex items-center justify-center gap-2"><MessageCircle size={16} /> Ir para o chat</span>
              </PrimaryButton>
              <button onClick={() => setShowCancelModal(true)} className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-[13.5px]">
                Desistir / Cancelar negociação
              </button>
            </>
          )}

          {job.status === "Concluída" && (
            <div className="p-3 rounded-xl bg-slate-100 text-slate-500 text-[12.5px] font-semibold text-center">
              Diária finalizada{job.rating?.stars ? ` · você avaliou com ${job.rating.stars} estrelas` : ""}.
            </div>
          )}
        </div>

        {showCancelModal && (
          <CancelReasonModal
            onClose={() => setShowCancelModal(false)}
            onConfirm={(reason) => {
              setShowCancelModal(false);
              onReopen(job, "profissional", reason);
            }}
          />
        )}
      </div>
    </Screen>
  );
}
