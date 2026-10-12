import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { CartaoPush } from "../components/CartaoPush.jsx";
import { Carregando, EmptyState, Screen, TopBar } from "../components/ui.jsx";
import { listarNotificacoes, marcarLida, marcarTodasLidas } from "../lib/notificacoes.js";
import { timeAgo } from "../lib/time.js";

/* Alertas (item 5): novas vagas nas suas áreas, candidaturas, seleção e conclusão. */
export function NotificationsScreen({ userId, onOpenJob, onChanged }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarNotificacoes()
      .then(setLista)
      .catch((e) => setErro(e.message));
  }, []);

  const abrir = async (n) => {
    if (!n.lida) {
      await marcarLida(n.id);
      setLista((l) => l.map((x) => (x.id === n.id ? { ...x, lida: true } : x)));
      onChanged?.();
    }
    if (n.vaga_id) onOpenJob(n.vaga_id);
  };

  const lerTodas = async () => {
    await marcarTodasLidas(userId);
    setLista((l) => l.map((x) => ({ ...x, lida: true })));
    onChanged?.();
  };

  return (
    <Screen>
      <TopBar
        title="Alertas"
        right={
          lista?.some((n) => !n.lida) && (
            <button onClick={lerTodas} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[12px] font-bold shrink-0">
              <CheckCheck size={14} /> Marcar lidas
            </button>
          )
        }
      />
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 py-4 space-y-3">
        <CartaoPush />
        {erro ? (
          <EmptyState icon={Bell} title="Não foi possível carregar" text={erro} />
        ) : lista === null ? (
          <Carregando />
        ) : lista.length === 0 ? (
          <EmptyState icon={Bell} title="Nenhum alerta ainda" text="Avisamos aqui quando sair vaga nas suas áreas e sobre suas candidaturas." />
        ) : (
          <ul className="space-y-2.5">
            {lista.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => abrir(n)}
                  className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border ${
                    n.lida ? "bg-white border-slate-100" : "bg-emerald-50/60 border-emerald-100"
                  }`}
                >
                  <span className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <Bell size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-bold text-slate-800 break-words">{n.titulo}</span>
                    {n.corpo && <span className="block text-[12.5px] text-slate-500 mt-0.5 break-words">{n.corpo}</span>}
                    <span className="block text-[11px] text-slate-400 mt-1">{timeAgo(new Date(n.criado_em))}</span>
                  </span>
                  {!n.lida && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" aria-label="Não lido" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Screen>
  );
}
