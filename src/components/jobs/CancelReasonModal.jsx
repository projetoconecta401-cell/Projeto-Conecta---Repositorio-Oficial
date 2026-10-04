import { X } from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  MODULE 4 — DETALHE DA VAGA / CANDIDATURA / AGENDA                  */
/* ------------------------------------------------------------------ */

export function CancelReasonModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-end justify-center">
      <div className="w-full max-w-sm bg-white rounded-t-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-extrabold text-slate-800 text-[15px]">Cancelar negociação</h3>
          <button type="button" onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>
        <p className="text-[12.5px] text-slate-500 mb-4 leading-relaxed">
          Você está cancelando uma diária confirmada. Tem certeza? A vaga voltará a ficar disponível no mural.
        </p>
        <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Motivo do cancelamento (opcional)</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Ex: imprevisto pessoal, conflito de horário..."
          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-[13.5px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <button type="button" onClick={onClose} className="py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-[13.5px]">
            Voltar
          </button>
          <button type="button" onClick={() => onConfirm(reason)} className="py-3 rounded-xl bg-red-500 text-white font-bold text-[13.5px]">
            Confirmar cancelamento
          </button>
        </div>
      </div>
    </div>
  );
}
