import { useState } from "react";
import { CircleCheck, Star } from "lucide-react";
import { PrimaryButton, Screen, TopBar } from "../../components/ui.jsx";
import { PONTOS_MELHORIA, enviarAvaliacaoApp } from "../../lib/avaliacaoApp.js";

const ROTULOS = ["", "Muito ruim", "Ruim", "Regular", "Bom", "Excelente"];
const RECOMENDA = [
  { v: "sim", t: "Sim" },
  { v: "talvez", t: "Talvez" },
  { v: "nao", t: "Não" },
];

/* Perfil → Avaliar o EiFreela: nota, recomendação, pontos a melhorar e sugestão. */
export function AvaliarAppScreen({ modo, onBack, onAviso }) {
  const [nota, setNota] = useState(0);
  const [recomendaria, setRecomendaria] = useState("");
  const [melhorias, setMelhorias] = useState([]);
  const [sugestao, setSugestao] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [pronto, setPronto] = useState(false);

  const alternar = (p) => setMelhorias((m) => (m.includes(p) ? m.filter((x) => x !== p) : [...m, p]));

  const enviar = async () => {
    if (!nota) return setErro("Escolha de 1 a 5 estrelas.");
    setErro("");
    setOcupado(true);
    try {
      await enviarAvaliacaoApp({ nota, recomendaria, melhorias, sugestao, modo });
      setPronto(true);
      onAviso?.({ title: "Obrigado! 💚", body: "Sua avaliação ajuda a melhorar o EiFreela." });
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  };

  if (pronto)
    return (
      <Screen>
        <TopBar title="Avaliar o EiFreela" onBack={onBack} />
        <div className="flex-1 w-full max-w-md mx-auto px-6 py-10 flex flex-col items-center text-center gap-3">
          <CircleCheck size={56} className="text-emerald-600" />
          <h2 className="text-lg font-extrabold text-slate-800">Avaliação enviada!</h2>
          <p className="text-[13.5px] text-slate-500 leading-relaxed">
            Obrigado por ajudar. Lemos todas as sugestões para decidir as próximas melhorias do aplicativo.
          </p>
          <PrimaryButton onClick={onBack} className="mt-4">Voltar</PrimaryButton>
        </div>
      </Screen>
    );

  return (
    <Screen>
      <TopBar title="Avaliar o EiFreela" onBack={onBack} />
      <div className="flex-1 w-full max-w-md mx-auto px-6 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-6">
        <p className="text-[13px] text-slate-500 leading-relaxed">
          Leva menos de 1 minuto. Sua opinião mostra o que está funcionando e o que precisa melhorar.
        </p>

        <section className="space-y-2">
          <p className="text-[14px] font-bold text-slate-800">Qual nota você dá para o aplicativo?</p>
          <div className="flex items-center justify-center gap-2 py-2" role="radiogroup" aria-label="Nota">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={nota === n}
                aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                onClick={() => setNota(n)}
                className="p-1.5 active:scale-90 transition"
              >
                <Star size={38} className={n <= nota ? "text-amber-400" : "text-slate-200"} fill={n <= nota ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <p className="text-center text-[13px] font-semibold text-slate-500 h-5">{ROTULOS[nota]}</p>
        </section>

        <section className="space-y-2">
          <p className="text-[14px] font-bold text-slate-800">Você indicaria o EiFreela para um amigo?</p>
          <div className="grid grid-cols-3 gap-2">
            {RECOMENDA.map((r) => (
              <button
                key={r.v}
                type="button"
                aria-pressed={recomendaria === r.v}
                onClick={() => setRecomendaria(recomendaria === r.v ? "" : r.v)}
                className={`py-2.5 rounded-xl border text-[13.5px] font-semibold ${recomendaria === r.v ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}
              >
                {r.t}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-[14px] font-bold text-slate-800">O que podemos melhorar?</p>
          <p className="text-[12px] text-slate-400">Marque quantos quiser.</p>
          <div className="flex flex-wrap gap-2">
            {PONTOS_MELHORIA.map((p) => {
              const ativo = melhorias.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => alternar(p)}
                  className={`px-3 py-2 rounded-full border text-[12.5px] font-semibold ${ativo ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-[14px] font-bold text-slate-800">Sugestões ou comentários (opcional)</p>
          <textarea
            rows={4}
            maxLength={1000}
            value={sugestao}
            onChange={(e) => setSugestao(e.target.value)}
            placeholder="Ex.: Seria bom poder filtrar vagas por horário."
            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-[16px] text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          />
          <p className="text-[11.5px] text-slate-400">Não coloque dados pessoais aqui. A avaliação não aparece para outros usuários.</p>
        </section>

        {erro && <p className="text-[12.5px] text-red-500 font-semibold">{erro}</p>}
        <PrimaryButton onClick={enviar} disabled={ocupado}>{ocupado ? "Enviando…" : "Enviar avaliação"}</PrimaryButton>
      </div>
    </Screen>
  );
}
