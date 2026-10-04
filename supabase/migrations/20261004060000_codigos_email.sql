-- Conexão Free — códigos de 6 dígitos enviados por e-mail (cadastro e recuperação de senha).
--
-- Tabela INTERNA: só as Edge Functions (chave secreta) leem e gravam. RLS ligado e sem
-- políticas + permissões revogadas = inacessível pela API pública.
-- Guarda só o hash (SHA-256) do código, com validade de 10 minutos e limite de tentativas.

create table if not exists public.codigos_email (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),
  email       text not null check (char_length(email) between 3 and 254),
  finalidade  text not null check (finalidade in ('cadastro', 'senha')),
  codigo_hash text not null,
  expira_em   timestamptz not null,
  tentativas  int not null default 0,
  usado_em    timestamptz
);

comment on table public.codigos_email is
  'Códigos de verificação por e-mail (uso interno das Edge Functions; sem acesso pela API pública).';

create index if not exists codigos_email_busca_idx
  on public.codigos_email (email, finalidade, criado_em desc);

alter table public.codigos_email enable row level security;
revoke all on public.codigos_email from anon, authenticated;

-- Existe conta com este e-mail? Usada só pela Edge Function de recuperação de senha
-- (para não enviar códigos a e-mails sem conta). Só a chave secreta (service_role) executa.
create or replace function public.conta_por_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

revoke execute on function public.conta_por_email(text) from public, anon, authenticated;
grant execute on function public.conta_por_email(text) to service_role;
