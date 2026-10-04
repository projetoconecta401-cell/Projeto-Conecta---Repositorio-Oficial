import { X, ArrowLeft, Phone } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, STATES } from "../../data/mock.js";
import { Field, OrangeButton } from "../ui.jsx";

export function PublishModal({ onClose, onPublish }) {
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0].label,
    value: "",
    dateISO: "",
    timeLabel: "",
    neighborhood: "",
    city: "",
    state: "RO",
    phone: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.title && form.value && form.dateISO && form.neighborhood && form.city;

  return (
    <div className="absolute inset-0 z-50 bg-black/40 flex items-end">
      <div className="w-full bg-white rounded-t-3xl p-6 max-h-[88%] overflow-y-auto">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-[16px] font-extrabold text-slate-800 flex-1">+ Publicar Vaga</h2>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="space-y-3">
          <Field placeholder="Título do serviço (ex: Garçom, Cozinheiro, Designer)" value={form.title} onChange={set("title")} />

          <div>
            <p className="text-[11.5px] font-semibold text-slate-500 mb-1.5">Categoria</p>
            <select
              value={form.category}
              onChange={set("category")}
              className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.label}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Field placeholder="Valor sugerido (R$)" value={form.value} onChange={set("value")} />
            <div>
              <p className="text-[11.5px] font-semibold text-slate-500 mb-1.5">Data do serviço</p>
              <input
                type="date"
                value={form.dateISO}
                onChange={set("dateISO")}
                className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>
          <Field placeholder="Horário (ex: 18h às 23h)" value={form.timeLabel} onChange={set("timeLabel")} />

          <Field icon={Phone} type="tel" placeholder="WhatsApp para contato (ex: 69 99999-9999)" value={form.phone} onChange={set("phone")} />

          <Field placeholder="Bairro / Região" value={form.neighborhood} onChange={set("neighborhood")} />
          <div className="grid grid-cols-2 gap-2.5">
            <Field placeholder="Cidade" value={form.city} onChange={set("city")} />
            <select
              value={form.state}
              onChange={set("state")}
              className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {STATES.filter((s) => s !== "Todos").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            O endereço exato só é liberado para o candidato aprovado — no mural fica visível apenas o bairro/região.
          </p>

          <textarea rows={3} placeholder="Detalhes do serviço (opcional)" className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
        </div>
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <button type="button" onClick={onClose} className="py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-[13.5px]">
            Cancelar
          </button>
          <OrangeButton disabled={!canSubmit} onClick={() => onPublish(form)}>
            Confirmar e Publicar
          </OrangeButton>
        </div>
      </div>
    </div>
  );
}
