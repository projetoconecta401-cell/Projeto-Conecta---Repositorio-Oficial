import { Star, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { RATING_CRITERIA, CriteriaStars } from "../components/CriteriaStars.jsx";
import { Avatar, Carregando, EmptyState, GreenButton, Screen, TopBar } from "../components/ui.jsx";
import { avaliar } from "../lib/avaliacoes.js";
import { perfisPorId } from "../lib/perfis.js";

/* Avaliação (item 6): nota geral, critérios, "trabalharia novamente" e comentário.
   O profissional avalia o contratante; o contratante avalia o profissional. */
const CRITERIOS_PROFISSIONAL = [
  { key: "pontualidade", label: "Pontualidade" },
  { key: "qualidade", label: "Qualidade do serviço" },
  { key: "comunicacao", label: "Comunicação" },
  { key: "respeito", label: "Respeito" },
  { key: "cumprimento", label: "Cumprimento do combinado" },
];

export function RatingScreen({ job, userId, onBack, onSubmitted }) {
  const avaliadoId = job ? (job.isOwner ? job.contratadoId : job.ownerId) : null;
  const avaliandoProfissional = !!job?.isOwner;
  const criterios = avaliandoProfissional ? CRITERIOS_PROFISSIONAL : RATING_CRITERIA;
  const [avaliado, setAvaliado] = useState(null);
  const [stars, setStars] = useState(0);
  const [criteria, setCriteria] = useState(() => Object.fromEntries(criterios.map((c) => [c.key, 0])));
  const [wouldWorkAgain, setWouldWorkAgain] = useState(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (avaliadoId) perfisPorId([avaliadoId]).then((p) => setAvaliado(p[avaliadoId] ?? null));
  }, [avaliadoId]);

  if (!job || !avaliadoId || avaliadoId === userId) {
    return (
      <Screen>
        <TopBar title="Avaliar" onBack={onBack} />
        {job ? <EmptyState icon={AlertTriangle} title="Não há quem avaliar nesta vaga" /> : <Carregando />}
      </Screen>
    );
  }

  const nome = avaliado?.nome ?? (avaliandoProfissional ? "o profissional" : job.contractorName);

  const enviar = async () => {
    setError("");
    setSaving(true);
    try {
      const preenchidos = Object.fromEntries(Object.entries(criteria).filter(([, v]) => v > 0));
      await avaliar({
        vagaId: job.id,
        avaliadoId,
        nota: stars,
        criterios: Object.keys(preenchidos).length ? preenchidos : null,
        trabalhariaNovamente: wouldWorkAgain,
        comentario: comment,
      });
      await onSubmitted();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TopBar title={avaliandoProfissional ? "Avaliar profissional" : "Avaliar contratante"} onBack={onBack} />
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-7 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar url={avaliado?.avatar_url} nome={nome} size={64} className="mb-3" />
          <h2 className="font-extrabold text-slate-800 text-[16px] break-words">Diária concluída! Como foi com {nome}?</h2>
          <p className="text-[12.5px] text-slate-500 mt-1 break-words">"{job.title}"</p>
          <div className="flex gap-1.5 my-5" role="radiogroup" aria-label="Nota geral">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setStars(n)} role="radio" aria-checked={stars === n} aria-label={`${n} estrela${n > 1 ? "s" : ""}`}>
                <Star size={34} className={n <= stars ? "text-amber-400" : "text-slate-200"} fill="currentColor" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 mb-5">
          {criterios.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-[13px] text-slate-600 min-w-0">{c.label}</span>
              <CriteriaStars value={criteria[c.key]} onChange={(v) => setCriteria((x) => ({ ...x, [c.key]: v }))} />
            </div>
          ))}
        </div>

        <p className="text-[13px] font-bold text-slate-700 mb-2">Você trabalharia novamente com {avaliandoProfissional ? "este profissional" : "este contratante"}?</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {["Sim", "Talvez", "Não"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setWouldWorkAgain(opt)}
              className={`py-2.5 rounded-xl text-[13px] font-bold border-2 transition ${
                wouldWorkAgain === opt ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <p className="text-[13px] font-bold text-slate-700 mb-2">Conte como foi (opcional)</p>
        <textarea
          value={comment}
          maxLength={500}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Deixe um comentário sobre a diária…"
          className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-[16px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />

        {error && (
          <p role="alert" className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[12.5px] text-red-600 font-semibold">{error}</p>
        )}
        <GreenButton className="mt-6" disabled={!stars || !wouldWorkAgain || saving} onClick={enviar}>
          {saving ? "Enviando…" : "Enviar avaliação"}
        </GreenButton>
      </div>
    </Screen>
  );
}
