import { useCallback, useEffect, useState } from "react";
import { CheckCheck, Pause, Pencil, Play, Plus, Sparkles, Trash2 } from "lucide-react";
import { CardsEsqueleto, EmptyState } from "../ui.jsx";
import { DisponibilidadeCard } from "./DisponibilidadeCard.jsx";
import { excluirDisponibilidade, minhasDisponibilidades, mudarStatus, statusReal } from "../../lib/disponibilidades.js";

const GRADE = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4";
const btn = "px-3 py-2 rounded-xl border text-[12px] font-bold flex items-center gap-1.5";

/* Aba do profissional: publicar e gerenciar as próprias disponibilidades. */
export function MinhasOfertas({ userId, versao, onNova, onEditar, onOpen, onAviso }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState("");

  const carregar = useCallback(() => {
    setErro("");
    minhasDisponibilidades(userId).then(setLista).catch((e) => { setErro(e.message); setLista([]); });
  }, [userId]);
  useEffect(carregar, [carregar, versao]);

  const acao = async (fazer, aviso) => {
    try { await fazer(); onAviso?.(aviso); carregar(); } catch (e) { onAviso?.({ title: "Não foi possível", body: e.message }); }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="flex-1 text-[13px] text-emerald-900 leading-relaxed">
          Conte o que você faz e quando pode trabalhar. Contratantes da sua região veem sua publicação e falam com você pelo chat.
        </p>
        <button onClick={onNova} className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold flex items-center justify-center gap-1.5">
          <Plus size={16} /> Publicar disponibilidade
        </button>
      </div>

      {erro ? (
        <EmptyState icon={Sparkles} title="Não foi possível carregar" text={erro} />
      ) : lista === null ? (
        <CardsEsqueleto n={2} />
      ) : lista.length === 0 ? (
        <EmptyState icon={Sparkles} title="Você ainda não publicou" text="Ex.: “Faço faxinas e tenho horários durante a semana” ou “Estou disponível para trabalhar como babá”." />
      ) : (
        <div className={GRADE}>
          {lista.map((d) => {
            const st = statusReal(d);
            return (
              <DisponibilidadeCard
                key={d.id}
                d={d}
                onOpen={() => onOpen(d)}
                acoes={
                  <>
                    <button className={`${btn} border-slate-200 text-slate-600`} onClick={() => onEditar(d)}><Pencil size={13} /> Editar</button>
                    {st === "ativa" && (
                      <button className={`${btn} border-amber-200 text-amber-700`} onClick={() => acao(() => mudarStatus(d.id, "pausada"), { title: "Publicação pausada", body: "Ela saiu do mural até você reativar." })}>
                        <Pause size={13} /> Pausar
                      </button>
                    )}
                    {st === "pausada" && (
                      <button className={`${btn} border-emerald-200 text-emerald-700`} onClick={() => acao(() => mudarStatus(d.id, "ativa"), { title: "Publicação reativada" })}>
                        <Play size={13} /> Reativar
                      </button>
                    )}
                    {st === "expirada" && (
                      <button className={`${btn} border-emerald-200 text-emerald-700`} onClick={() => onEditar(d)}><Play size={13} /> Renovar datas</button>
                    )}
                    {(st === "ativa" || st === "pausada") && (
                      <button className={`${btn} border-slate-200 text-slate-600`} onClick={() => acao(() => mudarStatus(d.id, "concluida"), { title: "Publicação concluída" })}>
                        <CheckCheck size={13} /> Concluir
                      </button>
                    )}
                    <button className={`${btn} border-red-200 text-red-500`} onClick={() => window.confirm(`Excluir "${d.titulo}"?`) && acao(() => excluirDisponibilidade(d), { title: "Publicação excluída" })}>
                      <Trash2 size={13} /> Excluir
                    </button>
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
