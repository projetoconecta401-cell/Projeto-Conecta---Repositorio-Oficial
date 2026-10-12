import { Phone, AlertTriangle, ShieldCheck, Navigation } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, STATES } from "../../data/catalogo.js";
import { hojeISO } from "../../lib/vagas.js";
import { mascaraTelefone } from "../../lib/validacao.js";
import { Campo, Field, OrangeButton, Sheet } from "../ui.jsx";

const selectCls =
  "w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40";

export function PublishModal({ onClose, onPublish, profile, posicao, onPedirPosicao }) {
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0].label,
    value: "",
    dateISO: "",
    timeLabel: "",
    neighborhood: "",
    city: "",
    state: "RO",
    phone: profile?.telefone ? mascaraTelefone(profile.telefone) : "",
    details: "",
    usarLocal: !!posicao,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.title && form.value && form.dateISO && form.neighborhood && form.city && !saving;

  const alternarLocal = async (marcado) => {
    if (!marcado) return setForm((f) => ({ ...f, usarLocal: false }));
    const p = posicao ?? (await onPedirPosicao());
    setForm((f) => ({ ...f, usarLocal: !!p }));
  };

  // Só fecha quando a vaga foi salva no Supabase; se der erro, mostra aqui.
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError("");
    setSaving(true);
    try {
      await onPublish(form);
      onClose();
    } catch (err) {
      setError(err?.message || "Não foi possível publicar a vaga.");
      setSaving(false);
    }
  };

  return (
    <Sheet
      title="Publicar vaga"
      onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={onClose} disabled={saving} className="py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-[14px]">
            Cancelar
          </button>
          <OrangeButton disabled={!canSubmit} onClick={handleSubmit}>
            {saving ? "Publicando…" : "Publicar"}
          </OrangeButton>
        </div>
      }
    >
      <div className="space-y-3.5 pt-1">
        <Campo label="O que você precisa?">
          <Field placeholder="Ex.: Garçom para casamento" maxLength={120} value={form.title} onChange={set("title")} />
        </Campo>

        <Campo label="Categoria">
          <select value={form.category} onChange={set("category")} className={selectCls}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.label}>{c.label}</option>
            ))}
          </select>
        </Campo>

        <div className="grid grid-cols-2 gap-2.5">
          <Campo label="Valor (R$)">
            <Field placeholder="150,00" inputMode="decimal" value={form.value} onChange={set("value")} />
          </Campo>
          <Campo label="Data">
            <input type="date" min={hojeISO()} value={form.dateISO} onChange={set("dateISO")} className={selectCls} />
          </Campo>
        </div>
        <Campo label="Horário (opcional)">
          <Field placeholder="Ex.: 18h às 23h" maxLength={60} value={form.timeLabel} onChange={set("timeLabel")} />
        </Campo>

        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[12px] text-emerald-800 leading-snug flex gap-2">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <span>
            <b>Privacidade:</b> informe só o bairro e a cidade. O endereço exato é combinado pelo chat com o profissional escolhido.
          </span>
        </div>

        <Campo label="Bairro / região">
          <Field placeholder="Ex.: Centro (sem rua e número)" maxLength={80} value={form.neighborhood} onChange={set("neighborhood")} />
        </Campo>
        <div className="grid grid-cols-[1fr_96px] gap-2.5">
          <Campo label="Cidade">
            <Field placeholder="Ex.: Cacoal" maxLength={80} value={form.city} onChange={set("city")} />
          </Campo>
          <Campo label="UF">
            <select value={form.state} onChange={set("state")} className={selectCls}>
              {STATES.filter((s) => s !== "Todos").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Campo>
        </div>

        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white">
          <input type="checkbox" checked={form.usarLocal} onChange={(e) => alternarLocal(e.target.checked)} className="mt-0.5 w-5 h-5 shrink-0 accent-emerald-600" />
          <span className="text-[12.5px] text-slate-600 leading-snug">
            <span className="font-bold text-slate-700 flex items-center gap-1"><Navigation size={13} /> Mostrar distância aproximada</span>
            Usa sua localização arredondada (~1 km). O ponto exato nunca é salvo.
          </span>
        </label>

        <Campo label="WhatsApp para contato (opcional)" ajuda="Aparece só para quem estiver logado.">
          <Field icon={Phone} type="tel" inputMode="tel" placeholder="(69) 99999-9999" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: mascaraTelefone(e.target.value) }))} />
        </Campo>

        <Campo label="Detalhes (opcional)">
          <textarea
            rows={3}
            maxLength={1000}
            value={form.details}
            onChange={set("details")}
            placeholder="Função, traje, experiência desejada…"
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-[16px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </Campo>

        {error && (
          <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-[12.5px] text-red-600 font-semibold flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" /> {error}
          </p>
        )}
      </div>
    </Sheet>
  );
}
