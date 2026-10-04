-- Conexão Free — mensagens do chat (chat da vaga e chat direto com profissionais).
--
-- Sem login: cada navegador gera uma "chave do chat" aleatória (uuid) e a envia no
-- cabeçalho HTTP x-chat-key em toda requisição. As políticas abaixo só deixam LER e
-- GRAVAR mensagens cuja coluna `chave` é igual ao cabeçalho. Assim cada visitante vê
-- apenas as próprias conversas, sem que ninguém liste as conversas dos outros.
-- Alterar/excluir pela API é bloqueado. Com autenticação, trocar `chave` por
-- auth.uid() e as políticas por (select auth.uid()) = usuario_id.

create table if not exists public.mensagens (
  id        uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  chave     text not null check (chave ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
  -- "vaga:<id da vaga>" ou "direto:<id da conversa>"
  conversa  text not null check (conversa ~ '^(vaga|direto):[A-Za-z0-9_-]{1,64}$'),
  remetente text not null default 'me' check (remetente in ('me', 'them')),
  texto     text not null check (char_length(btrim(texto)) between 1 and 2000)
);

comment on table public.mensagens is
  'Mensagens do chat do Conexão Free; cada navegador só acessa as linhas da sua chave (cabeçalho x-chat-key).';

-- Consulta típica: mensagens de uma conversa desta chave, em ordem.
create index if not exists mensagens_chave_conversa_idx
  on public.mensagens (chave, conversa, criado_em);

alter table public.mensagens enable row level security;

-- (select ...) faz o cabeçalho ser lido uma vez por consulta, não por linha.
drop policy if exists "Ler só as mensagens da própria chave" on public.mensagens;
create policy "Ler só as mensagens da própria chave"
  on public.mensagens for select
  to anon, authenticated
  using (
    chave = (select current_setting('request.headers', true)::json ->> 'x-chat-key')
  );

drop policy if exists "Gravar só com a própria chave" on public.mensagens;
create policy "Gravar só com a própria chave"
  on public.mensagens for insert
  to anon, authenticated
  with check (
    chave = (select current_setting('request.headers', true)::json ->> 'x-chat-key')
    and remetente = 'me'
  );

grant select, insert on public.mensagens to anon, authenticated;
revoke update, delete, truncate on public.mensagens from anon, authenticated;
