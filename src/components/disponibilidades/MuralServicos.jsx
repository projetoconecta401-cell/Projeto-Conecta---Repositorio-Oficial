import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Sparkles, Users, X } from "lucide-react";
import { CardsEsqueleto, EmptyState } from "../ui.jsx";
import { DisponibilidadeCard } from "./DisponibilidadeCard.jsx";
import { DIAS, MODALIDADES, PERIODOS, buscarMural } from "../../lib/disponibilidades.js";
import { perfisPorId } from "../../lib/perfis.js";
import { UFS } from "../../lib/endereco.js";
import { useBloqueados } from "../Seguranca.jsx";

const GRADE = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4";
const caixa = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[15px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40";
const filtrosVazios = { cidade: "", uf: "", data: "", dias: [], periodo: "", modalidade: "", precoMin: "", precoMax: "" };

/*
 * Mural "Serviços disponíveis" (contratantes). Os filtros vão para o banco (buscarMural);
 * a busca de texto e a categoria vêm da barra do mural principal.
 */
export function MuralServicos({ userId, termo, categoria, podeVer, onCadastrarContratante, onOpen, onInteresse }) {
  const [f, setF] = useState(filtrosVazios);
  const [aberto, setAberto] = useState(false);
  const [lista, setLista] = useState(null);
  const [autores, setAutores] = useState({});
  const [erro, setErro] = useState("");
  const bloqueados = useBloqueados();

  const filtros = useMemo(() => ({ ...f, termo, categoria: categoria === "all" || categoria === "minhas-areas" ? "" : categoria }), [f, termo, categoria]);
  const ativos = Object.entries(f).filter(([, v]) => (Array.isArray(v) ? v.length : v)).length;

  useEffect(() => {
    if (!podeVer) return;
    let vivo = true;
    setErro("");
    const t = setTimeout(() => {
      buscarMural(filtros, userId)
        .then(async (l) => {
          if (!vivo) return;
          setLista(l);
          setAutores(await perfisPorId(l.map((x) => x.usuario_id)));
        })
        .catch((e) => vivo && (setErro(e.message), setLista([])));
    }, 300);
    return () => { vivo = false; clearTimeout(t); };
  }, [filtros, userId, podeVer]);

  if (!podeVer)
    return (
      <div className="p-5 rounded-2xl bg-white border border-slate-100 text-center flex flex-col items-center gap-3">
        <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Users size={24} /></span>
        <p className="text-[15px] font-extrabold text-slate-800">Mural disponível para contratantes</p>
        <p className="text-[13px] text-slate-500 leading-relaxed max-w-sm">
          Aqui os profissionais publicam o que fazem e quando podem trabalhar. Para proteger quem trabalha, só contratantes cadastrados (pessoa física ou empresa) veem o mural.
        </p>
        <button onClick={onCadastrarContratante} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold">Cadastrar como contratante</button>
      </div>
    );

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e?.target ? e.target.value : e }));
  const alternarDia = (v) => setF((x) => ({ ...x, dias: x.dias.includes(v) ? x.dias.filter((d) => d !== v) : [...x.dias, v] }));
  const visiveis = (lista ?? []).filter((d) => !bloqueados.has(d.usuario_id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setAberto(!aberto)} aria-expanded={aberto}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 border-emerald-600 text-emerald-700 text-[12.5px] font-bold bg-emerald-50">
          <SlidersHorizontal size={13} /> Filtros do mural
          {ativos > 0 && <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center">{ativos}</span>}
        </button>
        {ativos > 0 && (
          <button onClick={() => setF(filtrosVazios)} className="text-[12px] font-semibold text-teal-600 flex items-center gap-1"><X size={13} /> Limpar</button>
        )}
      </div>

      {aberto && (
        <div className="p-4 rounded-2xl bg-white border border-slate-100 grid grid-cols-2 gap-3">
          <label className="col-span-2 sm:col-span-1 text-[12px] font-bold text-slate-600">Cidade
            <input className={`${caixa} mt-1`} placeholder="Ex.: Cacoal" value={f.cidade} onChange={set("cidade")} />
          </label>
          <label className="col-span-2 sm:col-span-1 text-[12px] font-bold text-slate-600">Estado
            <select className={`${caixa} mt-1`} value={f.uf} onChange={set("uf")} aria-label="Estado">
              <option value="">Todos</option>{UFS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </label>
          <label className="text-[12px] font-bold text-slate-600">Disponível no dia
            <input type="date" className={`${caixa} mt-1`} value={f.data} onChange={set("data")} />
          </label>
          <label className="text-[12px] font-bold text-slate-600">Horário
            <select className={`${caixa} mt-1`} value={f.periodo} onChange={set("periodo")} aria-label="Horário">
              <option value="">Qualquer</option>{PERIODOS.map((p) => <option key={p.v} value={p.v}>{p.t}</option>)}
            </select>
          </label>
          <div className="col-span-2">
            <p className="text-[12px] font-bold text-slate-600 mb-1">Dias da semana</p>
            <div className="grid grid-cols-7 gap-1.5">
              {DIAS.map((d) => (
                <button key={d.v} type="button" aria-pressed={f.dias.includes(d.v)} onClick={() => alternarDia(d.v)}
                  className={`py-2 rounded-lg border text-[11.5px] font-bold ${f.dias.includes(d.v) ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>{d.curto}</button>
              ))}
            </div>
          </div>
          <label className="col-span-2 text-[12px] font-bold text-slate-600">Atendimento
            <select className={`${caixa} mt-1`} value={f.modalidade} onChange={set("modalidade")} aria-label="Atendimento">
              <option value="">Qualquer</option>{MODALIDADES.map((m) => <option key={m.v} value={m.v}>{m.t}</option>)}
            </select>
          </label>
          <label className="text-[12px] font-bold text-slate-600">Preço mínimo (R$)
            <input inputMode="numeric" className={`${caixa} mt-1`} value={f.precoMin} onChange={(e) => set("precoMin")(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label className="text-[12px] font-bold text-slate-600">Preço máximo (R$)
            <input inputMode="numeric" className={`${caixa} mt-1`} value={f.precoMax} onChange={(e) => set("precoMax")(e.target.value.replace(/\D/g, ""))} />
          </label>
          {(f.precoMin || f.precoMax) && <p className="col-span-2 text-[11px] text-slate-400">Com faixa de preço, publicações "a combinar" não aparecem.</p>}
        </div>
      )}

      {erro ? (
        <EmptyState icon={Users} title="Não foi possível carregar" text={erro} />
      ) : lista === null ? (
        <CardsEsqueleto n={3} />
      ) : visiveis.length ? (
        <>
          <p className="text-[12.5px] font-bold text-slate-600">Mais recentes · {visiveis.length}</p>
          <div className={GRADE}>
            {visiveis.map((d) => (
              <DisponibilidadeCard key={d.id} d={d} autor={autores[d.usuario_id]} onOpen={() => onOpen(d)} onInteresse={() => onInteresse(d)} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState icon={Sparkles} title="Nenhum serviço encontrado" text={ativos || termo ? "Tente mudar ou limpar os filtros." : "Quando os profissionais publicarem disponibilidades, elas aparecem aqui."} />
      )}
    </div>
  );
}
