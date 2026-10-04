import { Pill } from "../ui.jsx";

/* ------------------------------------------------------------------ */
/*  MINHAS CANDIDATURAS / MINHAS DIÁRIAS — rastreador de candidaturas  */
/* ------------------------------------------------------------------ */

export function ApplicationStatusPill({ status }) {
  const map = {
    "Em análise": "orange",
    "Candidatura oficializada": "blue",
    "Diária agendada": "green",
    "Em andamento": "blue",
    "Diária concluída": "slate",
    "Finalizada": "slate",
    "Cancelada": "red",
  };
  return <Pill tone={map[status] || "slate"}>{status || "—"}</Pill>;
}
