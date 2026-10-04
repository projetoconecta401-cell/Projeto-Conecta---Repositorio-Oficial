-- Conexão Free — contas reais (Supabase Auth).
-- Vagas e mensagens passam a pertencer a uma conta (usuario_id = auth.uid()).
--   vagas:     todos LEEM; só usuários logados PUBLICAM; só o dono EXCLUI.
--   mensagens: cada conta LÊ e GRAVA só as próprias (em qualquer aparelho).
-- Excluir a conta (auth.users) apaga em cascata as vagas e mensagens dela.
-- Linhas antigas (sem usuario_id, da fase sem login) ficam sem dono: vagas antigas
-- continuam visíveis no mural e ninguém consegue excluí-las pela API; mensagens
-- antigas ficam inacessíveis pela API.

-- VAGAS ---------------------------------------------------------------------
alter table public.vagas
  add column if not exists usuario_id uuid default auth.uid()
    references auth.users (id) on delete cascade;

create index if not exists vagas_usuario_id_idx on public.vagas (usuario_id);

drop policy if exists "Todos podem publicar vagas disponíveis" on public.vagas;
drop policy if exists "Usuário logado publica as próprias vagas" on public.vagas;
create policy "Usuário logado publica as próprias vagas"
  on public.vagas for insert
  to authenticated
  with check (
    usuario_id = (select auth.uid())
    and status = 'Disponível'
    and data >= current_date - 1
  );

drop policy if exists "Dono exclui a própria vaga" on public.vagas;
create policy "Dono exclui a própria vaga"
  on public.vagas for delete
  to authenticated
  using (usuario_id = (select auth.uid()));

revoke insert, update, delete, truncate on public.vagas from anon;
grant select on public.vagas to anon;
grant select, insert, delete on public.vagas to authenticated;
revoke update, truncate on public.vagas from authenticated;

-- MENSAGENS -----------------------------------------------------------------
alter table public.mensagens
  add column if not exists usuario_id uuid default auth.uid()
    references auth.users (id) on delete cascade;

-- A chave anônima do navegador deixa de ser usada.
alter table public.mensagens alter column chave drop not null;

drop index if exists public.mensagens_chave_conversa_idx;
create index if not exists mensagens_usuario_conversa_idx
  on public.mensagens (usuario_id, conversa, criado_em);

drop policy if exists "Ler só as mensagens da própria chave" on public.mensagens;
drop policy if exists "Gravar só com a própria chave" on public.mensagens;
drop policy if exists "Conta lê as próprias mensagens" on public.mensagens;
drop policy if exists "Conta grava as próprias mensagens" on public.mensagens;

create policy "Conta lê as próprias mensagens"
  on public.mensagens for select
  to authenticated
  using (usuario_id = (select auth.uid()));

create policy "Conta grava as próprias mensagens"
  on public.mensagens for insert
  to authenticated
  with check (
    usuario_id = (select auth.uid())
    and remetente = 'me'
  );

revoke all on public.mensagens from anon;
grant select, insert on public.mensagens to authenticated;
revoke update, delete, truncate on public.mensagens from authenticated;
