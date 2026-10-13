import { useEffect, useState } from "react";
import { Ban } from "lucide-react";
import { Avatar, Carregando, EmptyState, Screen, TopBar } from "../../components/ui.jsx";
import { desbloquear, listarBloqueados } from "../../lib/seguranca.js";

/* Perfil → Pessoas bloqueadas: lista e desbloqueio. */
export function BloqueadosScreen({ onBack, onAviso }) {
  const [lista, setLista] = useState(null);
  const [ocupado, setOcupado] = useState(null);

  useEffect(() => {
    listarBloqueados().then(setLista).catch(() => setLista([]));
  }, []);

  const tirar = async (p) => {
    setOcupado(p.id);
    try {
      await desbloquear(p.id);
      setLista((l) => l.filter((x) => x.id !== p.id));
      onAviso?.({ title: `${p.nome.split(" ")[0]} foi desbloqueado(a)` });
    } catch (e) {
      onAviso?.({ title: "Não foi possível desbloquear", body: e.message });
    } finally {
      setOcupado(null);
    }
  };

  return (
    <Screen>
      <TopBar title="Pessoas bloqueadas" onBack={onBack} />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4">
        {lista === null ? (
          <Carregando />
        ) : lista.length === 0 ? (
          <EmptyState icon={Ban} title="Ninguém bloqueado" text="Para bloquear alguém, abra o perfil ou a conversa e toque em Bloquear." />
        ) : (
          <ul className="space-y-2">
            {lista.map((p) => (
              <li key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 min-w-0">
                <Avatar url={p.avatar_url} nome={p.nome} size={44} />
                <span className="flex-1 min-w-0 font-semibold text-slate-800 text-[14px] truncate">{p.nome}</span>
                <button
                  disabled={ocupado === p.id}
                  onClick={() => tirar(p)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-[12.5px] font-bold shrink-0 disabled:opacity-50"
                >
                  Desbloquear
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Screen>
  );
}
