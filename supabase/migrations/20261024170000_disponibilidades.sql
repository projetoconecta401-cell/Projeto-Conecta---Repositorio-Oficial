-- EiFreela · Mural de serviços e disponibilidades
-- Profissionais publicam o que fazem, quando podem trabalhar e onde atendem.
-- Só contratantes válidos (public.sou_contratante()) veem o mural; cada profissional
-- gerencia apenas as próprias publicações. Nada existente é alterado ou apagado.

-- ------------------------------------------------------------- 1) tabela --
create table if not exists public.disponibilidades (
  id             uuid primary key default gen_random_uuid(),
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  usuario_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  titulo         text not null check (char_length(btrim(titulo)) between 3 and 100),
  categoria      text not null check (categoria = any (public.categorias_eifreela())),
  descricao      text check (char_length(descricao) <= 1000),
  data_inicio    date not null default current_date,
  data_fim       date,
  dias_semana    smallint[] not null default '{}'
                 check (dias_semana <@ array[0,1,2,3,4,5,6]::smallint[]),   -- 0 = domingo
  horario_inicio time,
  horario_fim    time,
  modalidades    text[] not null default '{}'
                 check (modalidades <@ array['presencial','domicilio','remoto','outro']::text[]),
  cidade         text not null check (char_length(btrim(cidade)) between 2 and 80),
  uf             text not null check (uf ~ '^[A-Z]{2}$'),
  preco_tipo     text not null default 'combinar' check (preco_tipo in ('fixo','hora','diaria','combinar')),
  preco          numeric(10,2) check (preco is null or (preco > 0 and preco <= 100000)),
  fotos          text[] not null default '{}' check (cardinality(fotos) <= 4),
  status         text not null default 'ativa' check (status in ('ativa','pausada','expirada','concluida')),
  destaque       boolean not null default false,   -- reservado para planos pagos no futuro
  constraint disponibilidades_datas_check check (data_fim is null or data_fim >= data_inicio),
  constraint disponibilidades_horas_check check (horario_inicio is null or horario_fim is null or horario_fim > horario_inicio),
  constraint disponibilidades_preco_check check ((preco_tipo = 'combinar') = (preco is null))
);

create index if not exists disponibilidades_mural_idx on public.disponibilidades (status, criado_em desc);
create index if not exists disponibilidades_usuario_idx on public.disponibilidades (usuario_id, criado_em desc);
create index if not exists disponibilidades_local_idx on public.disponibilidades (uf, cidade);

-- --------------------------------------- 2) gatilho: datas, validade e limites --
create or replace function public.preparar_disponibilidade()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.atualizado_em := now();
  new.titulo := btrim(new.titulo);
  new.descricao := nullif(btrim(new.descricao), '');
  new.cidade := btrim(new.cidade);
  new.uf := upper(btrim(new.uf));
  if new.preco_tipo = 'combinar' then new.preco := null; end if;
  -- Período terminou: vira "expirada" sozinha.
  if new.status = 'ativa' and new.data_fim is not null and new.data_fim < current_date then
    new.status := 'expirada';
  end if;
  -- Ao reabrir uma expirada com datas novas, volta a ser ativa.
  if tg_op = 'UPDATE' and old.status = 'expirada' and new.status = 'expirada'
     and (new.data_fim is null or new.data_fim >= current_date)
     and (new.data_fim is distinct from old.data_fim) then
    new.status := 'ativa';
  end if;
  if tg_op = 'INSERT' then
    if public.conta_suspensa(new.usuario_id) then
      raise exception 'Sua conta está em análise por causa de denúncias.' using errcode = '42501';
    end if;
    if not exists (select 1 from public.profiles p where p.id = new.usuario_id and p.cep is not null) then
      raise exception 'Complete seu endereço em Perfil antes de publicar.' using errcode = '23514';
    end if;
    if (select count(*) from public.disponibilidades x
         where x.usuario_id = new.usuario_id and x.criado_em > now() - interval '24 hours') >= 10 then
      raise exception 'Limite de 10 publicações por dia atingido.' using errcode = '23514';
    end if;
    if (select count(*) from public.disponibilidades x
         where x.usuario_id = new.usuario_id and x.status in ('ativa','pausada')) >= 15 then
      raise exception 'Você já tem 15 publicações abertas. Conclua ou exclua alguma antes.' using errcode = '23514';
    end if;
  end if;
  -- usuario_id, destaque e criado_em não mudam pela API.
  if tg_op = 'UPDATE' then
    new.usuario_id := old.usuario_id;
    new.criado_em := old.criado_em;
  end if;
  return new;
end $$;
revoke execute on function public.preparar_disponibilidade() from public, anon, authenticated;

drop trigger if exists preparar_disponibilidade on public.disponibilidades;
create trigger preparar_disponibilidade
  before insert or update on public.disponibilidades
  for each row execute function public.preparar_disponibilidade();

-- Faxina diária: marca como expiradas as que passaram do prazo (o mural já as esconde mesmo sem isso).
create or replace function public.expirar_disponibilidades()
returns void language sql security definer set search_path = '' as $$
  update public.disponibilidades set status = 'expirada'
   where status = 'ativa' and data_fim is not null and data_fim < current_date;
$$;
revoke execute on function public.expirar_disponibilidades() from public, anon, authenticated;

select cron.unschedule('eifreela-expirar-disponibilidades')
  where exists (select 1 from cron.job where jobname = 'eifreela-expirar-disponibilidades');
select cron.schedule('eifreela-expirar-disponibilidades', '5 4 * * *', $$select public.expirar_disponibilidades()$$);

-- ------------------------------------------------------- 3) quem acessa --
alter table public.disponibilidades enable row level security;
revoke all on public.disponibilidades from anon, authenticated;
grant select on public.disponibilidades to authenticated;
grant insert (titulo, categoria, descricao, data_inicio, data_fim, dias_semana, horario_inicio, horario_fim,
              modalidades, cidade, uf, preco_tipo, preco, fotos, status)
  on public.disponibilidades to authenticated;
grant update (titulo, categoria, descricao, data_inicio, data_fim, dias_semana, horario_inicio, horario_fim,
              modalidades, cidade, uf, preco_tipo, preco, fotos, status)
  on public.disponibilidades to authenticated;
grant delete on public.disponibilidades to authenticated;

drop policy if exists "Dono vê as próprias publicações" on public.disponibilidades;
create policy "Dono vê as próprias publicações" on public.disponibilidades
  for select to authenticated using (usuario_id = (select auth.uid()));

drop policy if exists "Contratantes veem o mural" on public.disponibilidades;
create policy "Contratantes veem o mural" on public.disponibilidades
  for select to authenticated using (
    public.sou_contratante()
    and status = 'ativa'
    and (data_fim is null or data_fim >= current_date)
    and not public.conta_suspensa(usuario_id)
    and not public.ha_bloqueio((select auth.uid()), usuario_id)
  );

drop policy if exists "Profissional publica" on public.disponibilidades;
create policy "Profissional publica" on public.disponibilidades
  for insert to authenticated with check (usuario_id = (select auth.uid()) and status in ('ativa','pausada'));

drop policy if exists "Profissional edita a própria" on public.disponibilidades;
create policy "Profissional edita a própria" on public.disponibilidades
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

drop policy if exists "Profissional exclui a própria" on public.disponibilidades;
create policy "Profissional exclui a própria" on public.disponibilidades
  for delete to authenticated using (usuario_id = (select auth.uid()));

-- ------------------------------------------- 4) fotos (pasta privada) --
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "Portfólio: dono envia" on storage.objects;
create policy "Portfólio: dono envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Portfólio: dono apaga" on storage.objects;
create policy "Portfólio: dono apaga" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Portfólio: dono e contratantes veem" on storage.objects;
create policy "Portfólio: dono e contratantes veem" on storage.objects for select to authenticated
  using (bucket_id = 'portfolio' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.sou_contratante()));
