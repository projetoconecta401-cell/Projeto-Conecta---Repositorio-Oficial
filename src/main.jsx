import React from "react";
import ReactDOM from "react-dom/client";
import AuthGate from "./AuthGate.jsx";
import AppErrorBoundary from "./AppErrorBoundary.jsx";
import { registrarServiceWorker } from "./registrarSW.js";
import "./index.css";

/*
 * EiFreela — tudo no Supabase: contas, perfis, vagas, candidaturas, chat (texto e áudio),
 * avaliações e notificações. Nenhum dado de exemplo e nenhum dado bancário.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <AuthGate />
  </AppErrorBoundary>
);

registrarServiceWorker();
