-- Reescreve as políticas de public.mensagens com current_setting() direto dentro de
-- (select ...): o cabeçalho é lido uma vez por consulta (initplan) e o verificador de
-- desempenho do Supabase (lint 0003_auth_rls_initplan) deixa de acusar. Mesmo efeito.

alter policy "Ler só as mensagens da própria chave" on public.mensagens
  using (chave = ((select current_setting('request.headers', true))::json ->> 'x-chat-key'));

alter policy "Gravar só com a própria chave" on public.mensagens
  with check (
    chave = ((select current_setting('request.headers', true))::json ->> 'x-chat-key')
    and remetente = 'me'
  );
