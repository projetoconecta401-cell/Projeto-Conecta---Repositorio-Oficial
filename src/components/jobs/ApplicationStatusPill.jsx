import { Pill } from "../ui.jsx";

/* Situação da candidatura do profissional. */
export function ApplicationStatusPill({ status }) {
  const map = {
    "Em análise": "orange",
    "Diária agendada": "green",
    "Em andamento": "blue",
    Finalizada: "slate",
    "Não selecionado": "red",
  };
  return <Pill tone={map[status] || "slate"}>{status || "—"}</Pill>;
}
