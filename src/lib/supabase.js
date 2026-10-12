import { createBrowserClient } from "@supabase/ssr";

/*
 * Cliente Supabase do navegador.
 * As variáveis vêm da Vercel/arquivo .env (veja .env.example) e são públicas por natureza:
 * use somente a chave "publishable", nunca a secret/service_role.
 * Se as variáveis não existirem, usa os valores públicos do projeto EiFreela.
 */
const url = import.meta.env.VITE_SUPABASE_URL || "https://yrnxekmviprbhlviuwvt.supabase.co";
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_5tqZYwmASn7WkUhb9oiTHg_-w2a_IB-";

export const supabase = createBrowserClient(url, publishableKey);

/** Converte erros do banco/rede em mensagens curtas em português. */
export function mensagemDeErro(error, padrao = "Não foi possível concluir agora. Tente novamente.") {
  if (!error) return padrao;
  console.error("Supabase:", error);
  const msg = `${error.code ?? ""} ${error.message ?? ""}`;
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return "Sem conexão. Verifique sua internet e tente de novo.";
  if (/PGRST205|42P01|Could not find the (table|function)|42703|column .* does not exist/i.test(msg))
    return "O banco ainda não foi atualizado para esta versão do app. Avise o administrador.";
  if (/42501|row-level security|permission denied/i.test(msg)) return "Você não tem permissão para fazer isso.";
  if (/23505|duplicate key/i.test(msg)) return "Isso já foi registrado.";
  if (/23514|check constraint/i.test(msg)) return "Algum campo está fora do formato aceito.";
  if (error.code === "P0001" && error.message) return error.message; // mensagens das funções do banco
  return padrao;
}
