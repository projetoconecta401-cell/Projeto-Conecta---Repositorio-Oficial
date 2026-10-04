import { createBrowserClient } from "@supabase/ssr";
import { getChatKey } from "./identidade.js";

/*
 * Cliente Supabase do navegador.
 * As variáveis vêm do arquivo .env (veja .env.example) e são públicas por natureza:
 * use somente a chave "publishable", nunca a secret/service_role.
 * Sem as variáveis, o app continua funcionando só com os dados de exemplo (mock).
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase =
  url && publishableKey
    ? createBrowserClient(url, publishableKey, {
        // Chave anônima das conversas deste navegador (veja lib/identidade.js).
        global: { headers: { "x-chat-key": getChatKey() } },
      })
    : null;

if (!supabase) {
  console.warn(
    "Conexão Free: Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY). Usando só dados de exemplo."
  );
}
