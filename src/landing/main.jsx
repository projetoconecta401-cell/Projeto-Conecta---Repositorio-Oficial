import React from "react";
import ReactDOM from "react-dom/client";
import Landing from "./Landing.jsx";
import { registrarServiceWorker } from "../registrarSW.js";
import "./landing.css";

ReactDOM.createRoot(document.getElementById("landing")).render(
  <React.StrictMode>
    <Landing />
  </React.StrictMode>
);

registrarServiceWorker();
