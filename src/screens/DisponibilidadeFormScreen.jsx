import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ImagePlus, Trash2 } from "lucide-react";
import { Campo, Carregando, Field, PrimaryButton, Screen, TopBar } from "../components/ui.jsx";
import { CATEGORIES } from "../data/catalogo.js";
import { UFS } from "../lib/endereco.js";
import { reduzirImagem } from "../lib/validacao.js";
import {
  DIAS, MODALIDADES, PRECOS, apagarFotos, disponibilidadePorId, enviarFoto, hojeISO, salvarDisponibilidade, validarDisponibilidade,
} from "../lib/disponibilidades.js";

const caixa = "w-full px-3.5 py-3 rounded-xl border bg-white text-[16px] text-slate-800 focus:outline-none focus:ring-2";
const borda = (erro) => (erro ? "border-red-300 focus:ring-red-500/30" : "border-slate-200 focus:ring-emerald-500/40 focus:border-emerald-500");

const vazio = (profile) => ({
  titulo: "", categoria: profile?.areas?.[0] ?? "", descricao: "",
  dataInicio: hojeISO(), dataFim: "", dias: [], horarioInicio: "", horarioFim: "",
  modalidades: [], cidade: profile?.cidade ?? "", uf: profile?.uf ?? "",
  precoTipo: "combinar", preco: "",
});

const doBanco = (d) => ({
  titulo: d.titulo, categoria: d.categoria, descricao: d.descricao ?? "",
  dataInicio: d.data_inicio < hojeISO() ? hojeISO() : d.data_inicio, dataFim: d.data_fim ?? "",
  dias: d.dias_semana ?? [], horarioInicio: d.horario_inicio?.slice(0, 5) ?? "", horarioFim: d.horario_fim?.slice(0, 5) ?? "",
  modalidades: d.modalidades ?? [], cidade: d.cidade, uf: d.uf,
  precoTipo: d.preco_tipo, preco: d.preco != null ? String(d.preco).replace(".", ",") : "",
});

/* Publicar ou editar uma disponibilidade (profissional). Só título, categoria, início e local são obrigatórios. */
export function DisponibilidadeFormScreen({ profile, dispId, onSaved, onBack }) {
  const [form, setForm] = useState(() => vazio(profile));
  const [fotosAntigas, setFotosAntigas] = useState([]); // [{caminho, url}]
  const [fotosNovas, setFotosNovas] = useState([]); // [{blob, url}]
  const [removidas, setRemovidas] = useState([]);
  const [carregando, setCarregando] = useState(!!dispId);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    if (!dispId) return;
    disponibilidadePorId(dispId)
      .then((d) => {
        if (!d || d.usuario_id !== profile.id) return setErroGeral("Publicação não encontrada.");
        setForm(doBanco(d));
        setFotosAntigas((d.fotos ?? []).map((c, i) => ({ caminho: c, url: d.fotosUrl?.[i] })));
      })
      .catch((e) => setErroGeral(e.message))
      .finally(() => setCarregando(false));
  }, [dispId, profile.id]);

  useEffect(() => () => fotosNovas.forEach((f) => URL.revokeObjectURL(f.url)), [fotosNovas]);

  const set = (campo) => (e) => {
    const v = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [campo]: v }));
    if (erros[campo]) setErros((x) => ({ ...x, [campo]: undefined }));
  };
  const alternar = (campo, v) => setForm((f) => ({ ...f, [campo]: f[campo].includes(v) ? f[campo].filter((x) => x !== v) : [...f[campo], v] }));
  const totalFotos = fotosAntigas.length + fotosNovas.length;

  const addFotos = async (arquivos) => {
    for (const a of [...arquivos].slice(0, 4 - totalFotos)) {
      try {
        const blob = await reduzirImagem(a, 1080, 0.82);
        setFotosNovas((x) => [...x, { blob, url: URL.createObjectURL(blob) }]);
      } catch (e) {
        setErroGeral(e.message);
      }
    }
  };

  const salvar = async () => {
    const er = validarDisponibilidade(form);
    setErros(er);
    setErroGeral("");
    if (Object.keys(er).length) {
      setTimeout(() => document.querySelector("[data-erro='1']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return setErroGeral("Confira os campos destacados em vermelho.");
    }
    setSalvando(true);
    const enviadas = [];
    try {
      for (const f of fotosNovas) enviadas.push(await enviarFoto(profile.id, f.blob));
      await salvarDisponibilidade({ id: dispId, form, fotos: [...fotosAntigas.map((f) => f.caminho), ...enviadas] });
      await apagarFotos(removidas);
      await onSaved(!dispId);
    } catch (e) {
      await apagarFotos(enviadas);
      setErroGeral(e.message);
      setSalvando(false);
    }
  };

  const marca = (c) => (erros[c] ? { "data-erro": "1" } : {});
  if (carregando) return <Screen><TopBar title="Editar publicação" onBack={onBack} /><Carregando /></Screen>;

  return (
    <Screen>
      <TopBar title={dispId ? "Editar publicação" : "Publicar disponibilidade"} onBack={onBack} />
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-4">
        <p className="text-[12.5px] text-slate-500 leading-relaxed">
          Conte o que você faz, quando pode trabalhar e onde atende. Só contratantes cadastrados veem o mural.
        </p>

        <div {...marca("titulo")}>
          <Campo label="Título" erro={erros.titulo}>
            <Field maxLength={100} placeholder="Ex.: Faço faxinas e tenho horários durante a semana" value={form.titulo} onChange={set("titulo")} invalid={!!erros.titulo} />
          </Campo>
        </div>

        <div {...marca("categoria")}>
          <Campo label="Categoria" erro={erros.categoria}>
            <select value={form.categoria} onChange={set("categoria")} aria-label="Categoria" className={`${caixa} ${borda(erros.categoria)}`}>
              <option value="">Escolha</option>
              {CATEGORIES.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
            </select>
          </Campo>
        </div>

        <Campo label="Descrição (opcional)" erro={erros.descricao}>
          <textarea rows={4} maxLength={1000} value={form.descricao} onChange={set("descricao")} placeholder="Ex.: Tenho 3 anos de experiência, levo os produtos de limpeza e atendo casas e escritórios." className={`${caixa} ${borda(erros.descricao)} resize-none`} />
        </Campo>

        <div className="grid grid-cols-2 gap-3">
          <div {...marca("dataInicio")}>
            <Campo label="Disponível a partir de" erro={erros.dataInicio}>
              <input type="date" min={hojeISO()} value={form.dataInicio} onChange={set("dataInicio")} className={`${caixa} ${borda(erros.dataInicio)}`} />
            </Campo>
          </div>
          <div {...marca("dataFim")}>
            <Campo label="Até (opcional)" erro={erros.dataFim}>
              <input type="date" min={form.dataInicio || hojeISO()} value={form.dataFim} onChange={set("dataFim")} className={`${caixa} ${borda(erros.dataFim)}`} />
            </Campo>
          </div>
        </div>

        <Campo label="Dias da semana (opcional)" ajuda="Sem nenhum marcado, aparece como “Todos os dias”.">
          <div className="grid grid-cols-7 gap-1.5">
            {DIAS.map((d) => (
              <button key={d.v} type="button" aria-pressed={form.dias.includes(d.v)} onClick={() => alternar("dias", d.v)}
                className={`py-2.5 rounded-xl border text-[12px] font-bold ${form.dias.includes(d.v) ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>
                {d.curto}
              </button>
            ))}
          </div>
        </Campo>

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Das (opcional)">
            <input type="time" value={form.horarioInicio} onChange={set("horarioInicio")} className={`${caixa} ${borda()}`} />
          </Campo>
          <div {...marca("horarioFim")}>
            <Campo label="Até" erro={erros.horarioFim}>
              <input type="time" value={form.horarioFim} onChange={set("horarioFim")} className={`${caixa} ${borda(erros.horarioFim)}`} />
            </Campo>
          </div>
        </div>

        <Campo label="Como você atende? (opcional)">
          <div className="flex flex-wrap gap-2">
            {MODALIDADES.map((m) => (
              <button key={m.v} type="button" aria-pressed={form.modalidades.includes(m.v)} onClick={() => alternar("modalidades", m.v)}
                className={`px-3.5 py-2 rounded-full border text-[12.5px] font-semibold ${form.modalidades.includes(m.v) ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-600"}`}>
                {m.t}
              </button>
            ))}
          </div>
        </Campo>

        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3">
          <div {...marca("cidade")}>
            <Campo label="Cidade de atendimento" erro={erros.cidade}>
              <Field maxLength={80} placeholder="Ex.: Cacoal" value={form.cidade} onChange={set("cidade")} invalid={!!erros.cidade} />
            </Campo>
          </div>
          <div {...marca("uf")}>
            <Campo label="Estado" erro={erros.uf}>
              <select value={form.uf} onChange={set("uf")} aria-label="Estado" className={`${caixa} ${borda(erros.uf)}`}>
                <option value="">UF</option>
                {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Campo>
          </div>
        </div>

        <div {...marca("preco")}>
          <Campo label="Valor" erro={erros.preco}>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.precoTipo} onChange={set("precoTipo")} aria-label="Tipo de valor" className={`${caixa} ${borda()}`}>
                {PRECOS.map((p) => <option key={p.v} value={p.v}>{p.t}</option>)}
              </select>
              {form.precoTipo !== "combinar" && (
                <Field inputMode="decimal" placeholder="R$ 0,00" value={form.preco} onChange={set("preco")} invalid={!!erros.preco} />
              )}
            </div>
          </Campo>
        </div>

        <Campo label={`Fotos do trabalho (opcional, até 4)`} ajuda="Mostre exemplos do que você faz. Evite fotos com documentos ou endereço.">
          <div className="grid grid-cols-4 gap-2">
            {fotosAntigas.map((f, i) => (
              <div key={f.caminho} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                {f.url && <img src={f.url} alt="" className="w-full h-full object-cover" />}
                <button type="button" aria-label="Remover foto" onClick={() => { setRemovidas((r) => [...r, f.caminho]); setFotosAntigas((x) => x.filter((_, k) => k !== i)); }}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-white/90 text-red-500 flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            ))}
            {fotosNovas.map((f, i) => (
              <div key={f.url} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img src={f.url} alt="" className="w-full h-full object-cover" />
                <button type="button" aria-label="Remover foto" onClick={() => setFotosNovas((x) => x.filter((_, k) => k !== i))}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-white/90 text-red-500 flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            ))}
            {totalFotos < 4 && (
              <button type="button" onClick={() => input.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-1">
                <ImagePlus size={20} /><span className="text-[10.5px] font-semibold">Adicionar</span>
              </button>
            )}
          </div>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { addFotos(e.target.files); e.target.value = ""; }} />
        </Campo>

        <p className="text-[11.5px] text-slate-400 leading-snug">
          Os contratantes entram em contato com você pelo chat do EiFreela. Seu telefone e endereço não aparecem na publicação.
        </p>

        {erroGeral && (
          <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-[12.5px] text-red-600 font-semibold flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" /> {erroGeral}
          </p>
        )}
        <PrimaryButton disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : dispId ? "Salvar alterações" : "Publicar"}</PrimaryButton>
      </div>
    </Screen>
  );
}
