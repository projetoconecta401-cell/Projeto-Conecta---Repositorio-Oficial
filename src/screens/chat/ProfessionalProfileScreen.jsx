import { MessageSquare, Star, History, AlertTriangle, EllipsisVertical, Ban } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, Carregando, EmptyState, Estrelas, PrimaryButton, Screen, TopBar } from "../../components/ui.jsx";
import { perfilPublico } from "../../lib/perfis.js";
import { timeAgo } from "../../lib/time.js";
import { AcoesPessoaSheet, useBloqueados } from "../../components/Seguranca.jsx";

/* Perfil público: nome, foto, áreas e avaliações recebidas (sem dados pessoais). */
export function ProfessionalProfileScreen({ profId, userId, onBack, onMessage, onAviso }) {
  const [p, setP] = useState(undefined);
  const [menu, setMenu] = useState(false);
  const bloqueados = useBloqueados();

  useEffect(() => {
    perfilPublico(profId).then(setP).catch(() => setP(null));
  }, [profId]);

  if (p === undefined)
    return (
      <Screen>
        <TopBar title="Perfil" onBack={onBack} />
        <Carregando />
      </Screen>
    );
  if (!p)
    return (
      <Screen>
        <TopBar title="Perfil" onBack={onBack} />
        <EmptyState icon={AlertTriangle} title="Perfil não encontrado" />
      </Screen>
    );

  const outro = p.id !== userId;
  const bloqueado = bloqueados.has(p.id);

  return (
    <Screen>
      <TopBar
        title="Perfil"
        onBack={onBack}
        right={
          outro && (
            <button onClick={() => setMenu(true)} aria-label="Denunciar ou bloquear" className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-500">
              <EllipsisVertical size={20} />
            </button>
          )
        }
      />
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 py-6 space-y-6">
        <div className="flex flex-col items-center text-center">
          <Avatar url={p.avatar_url} nome={p.nome} size={88} />
          <h2 className="font-extrabold text-slate-800 text-[18px] mt-3 break-words">{p.nome}</h2>
          <div className="flex items-center gap-1.5 mt-1.5">
            {p.nota ? (
              <>
                <Star size={16} className="text-amber-400" fill="currentColor" />
                <span className="font-bold text-slate-800 text-[15px]">{p.nota.media.toFixed(1)}</span>
                <span className="text-[12px] text-slate-400">· {p.nota.total} avaliaç{p.nota.total === 1 ? "ão" : "ões"}</span>
              </>
            ) : (
              <span className="text-[12.5px] text-slate-400">Ainda sem avaliações</span>
            )}
          </div>
          <p className="text-[11.5px] text-slate-400 mt-1">
            No EiFreela desde {new Date(p.criado_em).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2">Áreas de atuação</p>
          <div className="flex flex-wrap gap-2">
            {p.areas.map((a) => (
              <span key={a} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[12px] font-semibold">{a}</span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
            <History size={14} /> Avaliações recebidas
          </p>
          {p.avaliacoes.length === 0 ? (
            <p className="text-[12.5px] text-slate-400">As avaliações aparecem depois que uma diária é concluída.</p>
          ) : (
            <div className="space-y-2.5">
              {p.avaliacoes.map((a) => (
                <div key={a.id} className="p-3.5 rounded-xl bg-white border border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar url={a.autor?.avatar_url} nome={a.autor?.nome} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-slate-800 truncate">{a.autor?.nome ?? "Usuário"}</span>
                      <span className="block text-[11px] text-slate-400 truncate">
                        {a.vagas?.titulo ?? "Diária"} · {timeAgo(new Date(a.criado_em))}
                      </span>
                    </span>
                    <Estrelas valor={a.nota} />
                  </div>
                  {a.comentario && <p className="text-[13px] text-slate-600 break-words">{a.comentario}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {outro && (
        <div className="sticky bottom-0 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-slate-100 bg-white">
          <div className="w-full max-w-2xl mx-auto">
            {bloqueado ? (
              <button onClick={() => setMenu(true)} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-[14px]">
                <Ban size={16} /> Você bloqueou esta pessoa
              </button>
            ) : (
              <PrimaryButton onClick={() => onMessage(p)}>
                <span className="flex items-center justify-center gap-2"><MessageSquare size={16} /> Enviar mensagem</span>
              </PrimaryButton>
            )}
          </div>
        </div>
      )}
      {menu && <AcoesPessoaSheet pessoa={p} onClose={() => setMenu(false)} onAviso={onAviso} />}
    </Screen>
  );
}
