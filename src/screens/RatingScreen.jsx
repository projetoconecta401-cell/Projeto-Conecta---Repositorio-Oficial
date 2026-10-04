import { Star } from "lucide-react";
import { useState } from "react";
import { RATING_CRITERIA, CriteriaStars } from "../components/CriteriaStars.jsx";
import { Screen, TopBar, GreenButton } from "../components/ui.jsx";

export function RatingScreen({ job, onBack, onSubmit }) {
  const [stars, setStars] = useState(0);
  const [criteria, setCriteria] = useState(() => Object.fromEntries(RATING_CRITERIA.map((c) => [c.key, 0])));
  const [wouldWorkAgain, setWouldWorkAgain] = useState(null);
  const [comment, setComment] = useState("");

  const setCriterion = (key, value) => setCriteria((c) => ({ ...c, [key]: value }));

  return (
    <Screen>
      <TopBar title="Avaliar empresa" onBack={onBack} />
      <div className="flex-1 px-6 py-7 overflow-y-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center text-lg mb-4">
            {job.contractor.slice(0, 2).toUpperCase()}
          </div>
          <h2 className="font-extrabold text-slate-800 text-[16px]">Diária concluída! Como foi com {job.contractor}?</h2>
          <p className="text-[12.5px] text-slate-500 mt-1">Sua avaliação ajuda outros profissionais da comunidade.</p>
          <div className="flex gap-1.5 my-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setStars(n)}>
                <Star size={32} className={n <= stars ? "text-emerald-500" : "text-slate-200"} fill={n <= stars ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 mb-5">
          {RATING_CRITERIA.map((c) => (
            <div key={c.key} className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-slate-600">{c.label}</span>
              <CriteriaStars value={criteria[c.key]} onChange={(v) => setCriterion(c.key, v)} />
            </div>
          ))}
        </div>

        <p className="text-[13px] font-bold text-slate-700 mb-2">Você trabalharia novamente com esta empresa?</p>
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

        <p className="text-[13px] font-bold text-slate-700 mb-2">Conte como foi sua experiência (opcional)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Deixe um comentário sobre o serviço..."
          className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />

        <GreenButton
          className="mt-6"
          disabled={!stars || !wouldWorkAgain}
          onClick={() => onSubmit({ stars, criteria, wouldWorkAgain, comment })}
        >
          Enviar avaliação
        </GreenButton>
      </div>
    </Screen>
  );
}
