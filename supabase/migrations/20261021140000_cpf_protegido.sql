-- EiFreela · CPF e data de nascimento protegidos (nem o administrador vê)
--  - CPF: o banco guarda só uma "impressão digital" (HMAC-SHA256 com chave secreta do Vault)
--    e os 2 últimos dígitos. Serve para impedir contas duplicadas; não volta a ser o número.
--  - Nascimento: só serve para conferir 18+; o banco guarda "maior_18 = true" e descarta a data.
--  - Um gatilho faz a conversão em todo cadastro, então o número nunca chega a ser gravado.

-- 1) Chave secreta (gerada aqui dentro, nunca sai do banco).
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'cpf_pepper') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'cpf_pepper', 'Chave do hash do CPF (EiFreela)');
  end if;
end $$;

create or replace function public.hash_cpf(p text)
returns text language sql stable security definer set search_path = '' as $$
  select encode(extensions.hmac(regexp_replace(coalesce(p, ''), '\D', '', 'g'),
                (select decrypted_secret from vault.decrypted_secrets where name = 'cpf_pepper' limit 1),
                'sha256'), 'hex');
$$;
revoke execute on function public.hash_cpf(text) from public, anon, authenticated;

-- 2) Colunas novas e conversão das contas existentes.
alter table public.profiles
  add column if not exists cpf_hash text,
  add column if not exists cpf_final text check (cpf_final ~ '^[0-9]{2}$'),
  add column if not exists maior_18 boolean;

update public.profiles
   set cpf_hash  = public.hash_cpf(cpf),
       cpf_final = right(cpf, 2),
       maior_18  = coalesce(data_nascimento <= (current_date - interval '18 years')::date, true)
 where cpf is not null;

alter table public.profiles drop constraint if exists profiles_cpf_check;
alter table public.profiles drop constraint if exists profiles_cpf_key;
alter table public.profiles drop constraint if exists profiles_data_nascimento_check;
alter table public.profiles alter column cpf drop not null, alter column data_nascimento drop not null;

update public.profiles set cpf = null, data_nascimento = null;

alter table public.profiles alter column cpf_hash set not null, alter column maior_18 set not null;
alter table public.profiles drop constraint if exists profiles_cpf_hash_key;
alter table public.profiles add constraint profiles_cpf_hash_key unique (cpf_hash);
-- Garantia: CPF e nascimento em texto nunca ficam gravados.
alter table public.profiles drop constraint if exists profiles_sem_dados_brutos;
alter table public.profiles add constraint profiles_sem_dados_brutos check (cpf is null and data_nascimento is null);

-- Usado pelas Edge Functions (chave de serviço) para avisar "CPF já cadastrado".
create or replace function public.cpf_em_uso(p_cpf text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where cpf_hash = public.hash_cpf(p_cpf));
$$;
revoke execute on function public.cpf_em_uso(text) from public, anon, authenticated;
grant execute on function public.cpf_em_uso(text) to service_role;


-- 3) Gatilho: converte antes de gravar.
create or replace function public.proteger_documentos()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.cpf is not null then
    new.cpf := regexp_replace(new.cpf, '\D', '', 'g');
    if not public.cpf_valido(new.cpf) then
      raise exception 'CPF inválido.' using errcode = '23514';
    end if;
    new.cpf_hash  := public.hash_cpf(new.cpf);
    new.cpf_final := right(new.cpf, 2);
    new.cpf       := null;
  end if;
  if new.data_nascimento is not null then
    if new.data_nascimento > (current_date - interval '18 years')::date then
      raise exception 'O EiFreela é apenas para maiores de 18 anos.' using errcode = '23514';
    end if;
    new.maior_18        := true;
    new.data_nascimento := null;
  end if;
  return new;
end $$;
revoke execute on function public.proteger_documentos() from public, anon, authenticated;

drop trigger if exists proteger_documentos on public.profiles;
create trigger proteger_documentos
  before insert or update on public.profiles
  for each row execute function public.proteger_documentos();

-- Ninguém altera CPF/nascimento depois do cadastro.
revoke update (data_nascimento) on public.profiles from authenticated;
