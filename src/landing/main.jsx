import React from "react";
import ReactDOM from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Landing from "./Landing.jsx";
import "./landing.css";

ReactDOM.createRoot(document.getElementById("landing")).render(
  <React.StrictMode>
    <Landing />
    <SpeedInsights />
  </React.StrictMode>
);
