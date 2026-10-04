import React from "react";
import ReactDOM from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.jsx";
import AppErrorBoundary from "./AppErrorBoundary.jsx";
import "./index.css";

/*
 * Protótipo: todos os dados do Conexão Free vivem só em memória (estado React).
 * Recarregar a página volta ao estado inicial. Em produção, cadastro, login,
 * verificação de e-mail/SMS, KYC (documento e selfie), dados bancários/PIX,
 * vagas, candidaturas, chat e avaliações dependeriam de um backend real.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <App />
    <SpeedInsights />
  </AppErrorBoundary>
);
