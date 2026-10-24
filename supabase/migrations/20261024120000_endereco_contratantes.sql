-- EiFreela · Endereço de todos os usuários, cadastro de contratante (CNPJ ou pessoa física)
-- e lista de profissionais visível só para contratantes válidos.
--
-- Nada é apagado: as colunas novas começam vazias. Contas antigas continuam entrando;
-- o app pede o endereço ao editar o perfil ou ao se candidatar a uma vaga.
--
-- Quem é "contratante válido" é calculado pelo próprio banco (coluna gerada): ninguém
-- consegue se marcar como contratante pela API.

-- ----------------------------------------------------------- 1) CNPJ válido --
-- Aceita o CNPJ numérico e o novo CNPJ alfanumérico da Receita (12 caracteres 0-9/A-Z
-- + 2 dígitos verificadores). Só confere formato e dígitos; NÃO consulta a Receita.
create or replace function public.cnpj_valido(p text)
returns boolean language plpgsql immutable set search_path = '' as $$
declare
  pesos1 int[] := array[5,4,3,2,9,8,7,6,5,4,3,2];
  pesos2 int[] := array[6,5,4,3,2,9,8,7,6,5,4,3,2];
  s int; r int; dv1 int; dv2 int; k int;
begin
  if p is null or p !~ '^[0-9A-Z]{12}[0-9]{2}$' or p = repeat(substr(p, 1, 1), 14) then
    return false;
  end if;
  s := 0;
  for k in 1..12 loop s := s + (ascii(substr(p, k, 1)) - 48) * pesos1[k]; end loop;
  r := s % 11; dv1 := case when r < 2 then 0 else 11 - r end;
  if dv1 <> (ascii(substr(p, 13, 1)) - 48) then return false; end if;
  s := 0;
  for k in 1..13 loop s := s + (ascii(substr(p, k, 1)) - 48) * pesos2[k]; end loop;
  r := s % 11; dv2 := case when r < 2 then 0 else 11 - r end;
  return dv2 = (ascii(substr(p, 14, 1)) - 48);
end $$;

-- ------------------------------------------------------- 2) colunas novas --
alter table public.profiles
  add column if not exists cep text check (cep ~ '^[0-9]{8}$'),
  add column if not exists logradouro text check (char_length(btrim(logradouro)) between 2 and 120),
  add column if not exists numero text check (char_length(btrim(numero)) between 1 and 20),
  add column if not exists complemento text check (char_length(complemento) <= 60),
  add column if not exists bairro text check (char_length(btrim(bairro)) between 2 and 80),
  add column if not exists cidade text check (char_length(btrim(cidade)) between 2 and 80),
  add column if not exists uf text check (uf ~ '^[A-Z]{2}$'),
  add column if not exists contratante_tipo text check (contratante_tipo in ('pj', 'pf')),
  add column if not exists empresa text check (char_length(btrim(empresa)) between 2 and 120),
  add column if not exists cnpj text check (cnpj is null or public.cnpj_valido(cnpj)),
  add column if not exists contratante_em timestamptz;

-- PJ precisa de CNPJ; PF não tem CNPJ.
alter table public.profiles drop constraint if exists profiles_contratante_cnpj_check;
alter table public.profiles add constraint profiles_contratante_cnpj_check check (
  (contratante_tipo = 'pj' and cnpj is not null)
  or (contratante_tipo = 'pf' and cnpj is null)
  or (contratante_tipo is null and cnpj is null)
);

-- Endereço: ou está completo, ou ainda não foi informado (contas antigas).
alter table public.profiles drop constraint if exists profiles_endereco_completo_check;
alter table public.profiles add constraint profiles_endereco_completo_check check (
  (cep is null and logradouro is null and numero is null and bairro is null and cidade is null and uf is null and complemento is null)
  or (cep is not null and logradouro is not null and numero is not null and bairro is not null and cidade is not null and uf is not null)
);

-- Um CNPJ só pode estar em uma conta.
create unique index if not exists profiles_cnpj_unico on public.profiles (cnpj) where cnpj is not null;

-- Calculado pelo banco: contratante com cadastro completo.
alter table public.profiles drop column if exists contratante_valido;
alter table public.profiles add column contratante_valido boolean generated always as (
  contratante_tipo is not null
  and (contratante_tipo = 'pf' or cnpj is not null)
  and cep is not null and logradouro is not null and numero is not null
  and bairro is not null and cidade is not null and uf is not null
) stored;

create index if not exists profiles_cidade_uf_idx on public.profiles (uf, cidade);

-- ---------------------------------------------------- 3) limpeza na gravação --
create or replace function public.normalizar_endereco_contratante()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.cep         := nullif(regexp_replace(coalesce(new.cep, ''), '\D', '', 'g'), '');
  new.logradouro  := nullif(btrim(new.logradouro), '');
  new.numero      := nullif(btrim(new.numero), '');
  new.complemento := nullif(btrim(new.complemento), '');
  new.bairro      := nullif(btrim(new.bairro), '');
  new.cidade      := nullif(btrim(new.cidade), '');
  new.uf          := nullif(upper(btrim(new.uf)), '');
  new.empresa     := nullif(btrim(new.empresa), '');
  new.cnpj        := nullif(upper(regexp_replace(coalesce(new.cnpj, ''), '[^0-9A-Za-z]', '', 'g')), '');
  if new.contratante_tipo = 'pf' then
    new.cnpj := null;
  end if;
  if new.cnpj is not null and not public.cnpj_valido(new.cnpj) then
    raise exception 'CNPJ inválido. Confira os números.' using errcode = '23514';
  end if;
  -- Quem já está como contratante não volta a ser "não contratante" sozinho.
  if tg_op = 'UPDATE' and old.contratante_tipo is not null and new.contratante_tipo is null then
    new.contratante_tipo := old.contratante_tipo;
    new.cnpj := coalesce(new.cnpj, old.cnpj);
  end if;
  if new.contratante_tipo is not null and (tg_op = 'INSERT' or old.contratante_tipo is null) then
    new.contratante_em := now();
  end if;
  return new;
end $$;
revoke execute on function public.normalizar_endereco_contratante() from public, anon, authenticated;

drop trigger if exists normalizar_endereco_contratante on public.profiles;
create trigger normalizar_endereco_contratante
  before insert or update on public.profiles
  for each row execute function public.normalizar_endereco_contratante();

-- Contas NOVAS precisam informar o endereço completo (as antigas completam depois).
create or replace function public.exigir_endereco_novo_perfil()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.cep is null then
    raise exception 'Informe o endereço completo (CEP, rua, número, bairro, cidade e UF).' using errcode = '23514';
  end if;
  return new;
end $$;
revoke execute on function public.exigir_endereco_novo_perfil() from public, anon, authenticated;

-- Nome com "zz_" para rodar depois da limpeza (gatilhos rodam em ordem alfabética).
drop trigger if exists exigir_endereco_novo_perfil on public.profiles;
drop trigger if exists zz_exigir_endereco_novo_perfil on public.profiles;
create trigger zz_exigir_endereco_novo_perfil
  before insert on public.profiles
  for each row execute function public.exigir_endereco_novo_perfil();

-- ----------------------------------------------- 4) quem pode ler e gravar --
-- Outros usuários só leem: nome, foto, áreas, resumo profissional, cidade/UF, empresa
-- e se a conta é contratante válida. Endereço completo e CNPJ só o dono (meu_perfil).
grant select (cidade, uf, empresa, contratante_valido) on public.profiles to authenticated;
grant insert (cep, logradouro, numero, complemento, bairro, cidade, uf, contratante_tipo, empresa, cnpj)
  on public.profiles to authenticated;
grant update (cep, logradouro, numero, complemento, bairro, cidade, uf, contratante_tipo, empresa, cnpj)
  on public.profiles to authenticated;

-- Sou contratante válido? (usado nas regras abaixo)
create or replace function public.sou_contratante()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select p.contratante_valido and not p.suspenso
                   from public.profiles p where p.id = (select auth.uid())), false);
$$;
revoke execute on function public.sou_contratante() from public, anon;
grant execute on function public.sou_contratante() to authenticated;

-- Posso ver o perfil de p_id? Sim quando:
--  - é o meu;
--  - sou contratante válido (lista e perfis de profissionais);
--  - a pessoa é contratante válida ou publicou vaga (quem trabalha vê quem contrata);
--  - temos uma conversa (candidato <-> dono da vaga, conversa direta).
create or replace function public.pode_ver_perfil(p_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select p_id = (select auth.uid())
      or public.sou_contratante()
      or exists (select 1 from public.profiles x where x.id = p_id and x.contratante_valido)
      or exists (select 1 from public.vagas v where v.usuario_id = p_id)
      or exists (select 1 from public.conversas c
                  where (c.contratante_id = (select auth.uid()) and c.freelancer_id = p_id)
                     or (c.freelancer_id = (select auth.uid()) and c.contratante_id = p_id));
$$;
revoke execute on function public.pode_ver_perfil(uuid) from public, anon;
grant execute on function public.pode_ver_perfil(uuid) to authenticated;

drop policy if exists "Logados veem perfis ativos" on public.profiles;
drop policy if exists "Perfis visíveis conforme o papel" on public.profiles;
create policy "Perfis visíveis conforme o papel" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (not suspenso and public.pode_ver_perfil(id)));
-- (anon continua sem nenhum acesso à tabela profiles)
