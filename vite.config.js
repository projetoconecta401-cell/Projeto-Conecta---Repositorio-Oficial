import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Duas páginas:
//   /      -> index.html      (landing page institucional)
//   /app/  -> app/index.html  (o app Conexão Free)
// base "./" gera caminhos relativos no build: o site funciona em qualquer
// subpasta (ex.: GitHub Pages em /<repositorio>/) sem ajuste extra.

// No servidor local (dev e preview), "/app" sem barra abriria a landing.
// Redireciona para "/app/". Netlify, Vercel e GitHub Pages já fazem isso sozinhos.
const appTrailingSlash = () => {
  const redirect = (req, res, next) => {
    const [path, query] = req.url.split("?");
    if (path === "/app") {
      res.statusCode = 301;
      res.setHeader("Location", "/app/" + (query ? `?${query}` : ""));
      res.end();
      return;
    }
    next();
  };
  return {
    name: "app-trailing-slash",
    configureServer(server) {
      server.middlewares.use(redirect);
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirect);
    },
  };
};

export default defineConfig({
  plugins: [react(), appTrailingSlash()],
  base: "./",
  // Variáveis expostas ao navegador: VITE_* (padrão do Vite) e NEXT_PUBLIC_*
  // (nomes usados pelo Supabase). Nunca coloque chaves secretas com esses prefixos.
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  // Porta padrão 5173 (dev) / 4173 (preview); a variável PORT, se definida, tem prioridade.
  server: { port: Number(process.env.PORT) || 5173 },
  preview: { port: Number(process.env.PORT) || 4173 },
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        app: resolve(import.meta.dirname, "app/index.html"),
      },
      // Aviso informativo do Vite 8 (tempo do Tailwind no build), não é erro.
      checks: { pluginTimings: false },
    },
  },
});
