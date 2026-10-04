import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" gera caminhos relativos no build: o site funciona em qualquer
// subpasta (ex.: GitHub Pages em /<repositorio>/) sem ajuste extra.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
