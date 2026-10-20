-- EiFreela · Aceite do Termo de Consentimento (LGPD – Lei nº 13.709/2018)
-- O perfil guarda a versão aceita e a data; a tabela aceites_termos guarda o histórico
-- (comprovante do consentimento, art. 8º, § 2º: cabe ao controlador provar o consentimento).

alter table public.profiles
  add column if not exists termos_versao    text,
  add column if not exists termos_aceite_em timestamptz;

create table if not exists public.aceites_termos (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  versao     text not null check (char_length(versao) between 1 and 40),
  aceito_em  timestamptz not null default now(),
  origem     text check (char_length(origem) <= 300)  -- navegador/aparelho usado no aceite
);
create index if not exists aceites_termos_usuario on public.aceites_termos (usuario_id, aceito_em desc);
alter table public.aceites_termos enable row level security;
revoke all on public.aceites_termos from anon, authenticated;
grant select on public.aceites_termos to authenticated;

drop policy if exists "Titular vê os próprios aceites" on public.aceites_termos;
create policy "Titular vê os próprios aceites" on public.aceites_termos for select to authenticated
  using (usuario_id = (select auth.uid()));

-- Registra o aceite de quem está logado (o app chama ao clicar em "Li e aceito").
create or replace function public.aceitar_termos(p_versao text, p_origem text default null)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_agora timestamptz := now();
begin
  if v_uid is null then
    raise exception 'Entre na sua conta.';
  end if;
  if p_versao is null or char_length(p_versao) not between 1 and 40 then
    raise exception 'Versão do termo inválida.';
  end if;
  insert into public.aceites_termos (usuario_id, versao, aceito_em, origem)
    values (v_uid, p_versao, v_agora, left(p_origem, 300));
  update public.profiles
     set termos_versao = p_versao, termos_aceite_em = v_agora
   where id = v_uid;
  return v_agora;
end
$$;
revoke execute on function public.aceitar_termos(text, text) from public, anon;
grant execute on function public.aceitar_termos(text, text) to authenticated;
