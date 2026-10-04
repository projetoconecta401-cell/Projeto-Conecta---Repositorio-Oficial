import React from "react";
import ReactDOM from "react-dom/client";
import AuthGate from "./AuthGate.jsx";
import AppErrorBoundary from "./AppErrorBoundary.jsx";
import "./index.css";

/*
 * Contas (login/cadastro), vagas publicadas e mensagens de texto do chat ficam no
 * Supabase. O restante (verificação de e-mail/SMS, KYC, dados bancários/PIX,
 * candidaturas, check-in, avaliações) ainda é simulado em memória neste protótipo.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <AuthGate />
  </AppErrorBoundary>
);
