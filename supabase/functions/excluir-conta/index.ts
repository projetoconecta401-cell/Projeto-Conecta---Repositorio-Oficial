// Conexão Free — exclusão permanente da própria conta.
//
// Só o próprio usuário logado pode chamar (JWT da sessão, auth: "user"). A conta é
// apagada do Supabase Auth com a chave secreta (ambiente das Edge Functions); as vagas
// e mensagens dela somem junto (on delete cascade nas tabelas).
import { withSupabase } from "npm:@supabase/server@1.9.0";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") return Response.json({ erro: "Método não permitido." }, { status: 405 });

    const userId = ctx.userClaims?.id;
    if (!userId) return Response.json({ erro: "Sessão inválida. Entre novamente." }, { status: 401 });

    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("deleteUser:", error.message);
      return Response.json({ erro: "Não foi possível excluir a conta agora." }, { status: 500 });
    }
    return Response.json({ ok: true });
  }),
};
