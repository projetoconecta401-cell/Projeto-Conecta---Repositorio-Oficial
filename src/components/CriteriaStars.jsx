import { Star } from "lucide-react";

export const RATING_CRITERIA = [
  { key: "organizacao", label: "Organização" },
  { key: "comunicacao", label: "Comunicação" },
  { key: "respeito", label: "Respeito" },
  { key: "cumprimento", label: "Cumprimento do combinado" },
  { key: "ambiente", label: "Ambiente de trabalho" },
  { key: "pontualidadePagamento", label: "Pontualidade no pagamento" },
];

export function CriteriaStars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={16} className={n <= value ? "text-emerald-500" : "text-slate-200"} fill={n <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}
