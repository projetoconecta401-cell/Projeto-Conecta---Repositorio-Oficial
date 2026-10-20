import { Phone, AlertTriangle, ShieldCheck, Navigation } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, REGIMES, STATES, TIPOS_VAGA, UNIDADES_VALOR } from "../../data/catalogo.js";
import { hojeISO } from "../../lib/vagas.js";
import { mascaraTelefone } from "../../lib/validacao.js";
import { Campo, Field, OrangeButton, Sheet } from "../ui.jsx";

const selectCls =
  "w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40";

export function PublishModal({ onClose, onPublish, profile, posicao, onPedirPosicao }) {
  const [form, setForm] = useState({
    tipo: "diaria",
    title: "",
    category: CATEGORIES[0].label,
    value: "",
    dateISO: "",
    timeLabel: "",
    neighborhood: "",
    city: "",
    state: "RO",
    phone: "",
    details: "",
    usarLocal: !!posicao,
    dataFimISO: "",
    cargaHoraria: "",
    regime: "a_combinar",
    valorUnidade: "dia",
    quantidade: "1",
    livre: false,
    remoto: false,
  });
  const tipo = form.tipo;
  const unidades = { diaria: ["dia", "hora"], temporario: ["mes", "semana", "dia", "hora"], freela: ["projeto", "hora"] }[tipo];
  const escolherTipo = (t) =>
    setForm((f) => ({ ...f, tipo: t, valorUnidade: { diaria: "dia", temporario: "mes", freela: "projeto" }[t], remoto: t === "freela" ? f.remoto : false }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit =
    form.title && form.value && form.dateISO && (form.remoto || form.neighborhood) && form.city &&
    (tipo !== "temporario" || form.dataFimISO) && !saving;

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
        <Campo label="Tipo de contratação" ajuda={TIPOS_VAGA.find((t) => t.id === tipo)?.ajuda}>
          <div className="grid grid-cols-3 gap-2" role="radiogroup">
            {TIPOS_VAGA.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={tipo === t.id}
                onClick={() => escolherTipo(t.id)}
                className={`py-2.5 px-1 rounded-xl border-2 text-[12.5px] font-bold leading-tight ${tipo === t.id ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Campo>

        <Campo label="O que você precisa?">
          <Field
            placeholder={tipo === "temporario" ? "Ex.: Vendedor(a) para o fim de ano" : tipo === "freela" ? "Ex.: Criar logotipo e artes para Instagram" : "Ex.: Garçom para casamento"}
            maxLength={120}
            value={form.title}
            onChange={set("title")}
          />
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
            <Field placeholder={tipo === "temporario" ? "1.800,00" : "150,00"} inputMode="decimal" value={form.value} onChange={set("value")} />
          </Campo>
          <Campo label="Valor é">
            <select value={form.valorUnidade} onChange={set("valorUnidade")} className={selectCls}>
              {UNIDADES_VALOR.filter((u) => unidades.includes(u.id)).map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </Campo>
        </div>

        {tipo === "temporario" ? (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <Campo label="Início">
                <input type="date" min={hojeISO()} value={form.dateISO} onChange={set("dateISO")} className={selectCls} />
              </Campo>
              <Campo label="Término">
                <input type="date" min={form.dateISO || hojeISO()} value={form.dataFimISO} onChange={set("dataFimISO")} className={selectCls} />
              </Campo>
            </div>
            <Campo label="Carga horária / escala (opcional)">
              <Field placeholder="Ex.: 44h semanais, seg a sáb 8h–14h" maxLength={80} value={form.cargaHoraria} onChange={set("cargaHoraria")} />
            </Campo>
            <Campo label="Regime">
              <select value={form.regime} onChange={set("regime")} className={selectCls}>
                {REGIMES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </Campo>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <Campo label={tipo === "freela" ? "Entrega até" : "Data"}>
              <input type="date" min={hojeISO()} value={form.dateISO} onChange={set("dateISO")} className={selectCls} />
            </Campo>
            <Campo label="Horário (opcional)">
              <Field placeholder={tipo === "freela" ? "Ex.: Flexível" : "Ex.: 18h às 23h"} maxLength={60} value={form.timeLabel} onChange={set("timeLabel")} />
            </Campo>
          </div>
        )}

        {tipo !== "freela" && (
          <Campo label="Quantas pessoas você precisa?" ajuda="Você escolhe quem aceitar. Cada pessoa aceita recebe a própria vaga; as outras posições continuam abertas.">
            {!form.livre && (
              <input type="number" min={1} max={50} inputMode="numeric" value={form.quantidade} onChange={set("quantidade")} className={selectCls} />
            )}
            <label className="flex items-start gap-2.5 p-3 mt-2 rounded-xl border border-slate-200 bg-white">
              <input type="checkbox" checked={!!form.livre} onChange={(e) => setForm((f) => ({ ...f, livre: e.target.checked }))} className="mt-0.5 w-5 h-5 shrink-0 accent-emerald-600" />
              <span className="text-[13px] text-slate-600 leading-snug">
                <b className="text-slate-800">Sem número fixo.</b> Vou aceitar quantas pessoas quiser e encerro a vaga quando completar a equipe.
              </span>
            </label>
          </Campo>
        )}

        {tipo === "freela" && (
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white">
            <input type="checkbox" checked={form.remoto} onChange={(e) => setForm((f) => ({ ...f, remoto: e.target.checked }))} className="mt-0.5 w-5 h-5 shrink-0 accent-emerald-600" />
            <span className="text-[12.5px] text-slate-600 leading-snug">
              <span className="font-bold text-slate-700 block">Pode ser feito à distância (remoto)</span>
              Bom para design, conteúdo, edição de vídeo e tecnologia.
            </span>
          </label>
        )}

        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[12px] text-emerald-800 leading-snug flex gap-2">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <span>
            <b>Privacidade:</b> informe só o bairro e a cidade. O endereço exato é combinado pelo chat com o profissional escolhido.
          </span>
        </div>

        {!form.remoto && (
          <Campo label="Bairro / região">
            <Field placeholder="Ex.: Centro (sem rua e número)" maxLength={80} value={form.neighborhood} onChange={set("neighborhood")} />
          </Campo>
        )}
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

        <Campo label="WhatsApp para contato (opcional)" ajuda="Por segurança, aparece só para o profissional que você contratar.">
          <Field icon={Phone} type="tel" inputMode="tel" placeholder="(69) 99999-9999" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: mascaraTelefone(e.target.value) }))} />
        </Campo>

        <Campo label="Detalhes (opcional)">
          <textarea
            rows={3}
            maxLength={1000}
            value={form.details}
            onChange={set("details")}
            placeholder={tipo === "temporario" ? "Funções, requisitos, benefícios (vale-transporte, alimentação)…" : tipo === "freela" ? "O que precisa ser entregue, referências, formato dos arquivos…" : "Função, traje, experiência desejada…"}
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
