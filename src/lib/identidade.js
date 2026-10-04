/*
 * Gera ids únicos no navegador (usados nas mensagens do chat: o mesmo id aparece na
 * tela na hora e é gravado no banco, sem duplicar ao recarregar o histórico).
 * A identidade de quem usa o app agora vem da conta (Supabase Auth) — veja lib/auth.js.
 */
export const novoId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (c ^ (Math.random() * 16) >> (c / 4)).toString(16)
      );
