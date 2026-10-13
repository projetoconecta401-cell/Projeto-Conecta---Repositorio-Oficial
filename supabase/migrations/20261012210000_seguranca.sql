-- EiFreela · Segurança contra pessoas mal-intencionadas
--  1) WhatsApp da vaga protegido: só o profissional contratado vê.
--  2) Bloquear usuários: quem foi bloqueado não manda mensagem nem se candidata.
--  3) Denúncias: com 3 denúncias de pessoas diferentes a conta fica suspensa até revisão.
--  4) Limites contra spam e robôs (vagas, conversas, mensagens e denúncias).
-- Revisão das denúncias: Table Editor → denuncias. Para reativar uma conta:
--   update public.profiles set suspenso = false where id = '<id>';

-- ------------------------------------------------------------------ limpeza --
drop table if exists public."projeto-conecta";

-- ---------------------------------------------------------- 1) contato vaga --
create table if not exists public.vagas_contato (
  vaga_id  uuid primary key references public.vagas(id) on delete cascade,
  whatsapp text not null check (whatsapp ~ '^[0-9()+ .-]{8,20}$')
);
alter table public.vagas_contato enable row level security;

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'vagas' and column_name = 'whatsapp') then
    insert into public.vagas_contato (vaga_id, whatsapp)
      select id, whatsapp from public.vagas where whatsapp ~ '^[0-9()+ .-]{8,20}$'
      on conflict (vaga_id) do nothing;
    alter table public.vagas drop column whatsapp;
  end if;
end $$;

revoke all on public.vagas_contato from anon, authenticated;
grant select, insert, update, delete on public.vagas_contato to authenticated;

drop policy if exists "Dono gerencia o contato" on public.vagas_contato;
create policy "Dono gerencia o contato" on public.vagas_contato for all to authenticated
  using (exists (select 1 from public.vagas v where v.id = vaga_id and v.usuario_id = (select auth.uid())))
  with check (exists (select 1 from public.vagas v where v.id = vaga_id and v.usuario_id = (select auth.uid())));

drop policy if exists "Contratado vê o contato" on public.vagas_contato;
create policy "Contratado vê o contato" on public.vagas_contato for select to authenticated
  using (exists (select 1 from public.vagas v where v.id = vaga_id and v.contratado_id = (select auth.uid())));

-- -------------------------------------------------------------- suspensão --
alter table public.profiles add column if not exists suspenso boolean not null default false;

create or replace function public.conta_suspensa(p_uid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select suspenso from public.profiles where id = p_uid), false);
$$;
revoke execute on function public.conta_suspensa(uuid) from public;
grant execute on function public.conta_suspensa(uuid) to anon, authenticated;

-- Vagas de contas suspensas saem do mural (o dono e o contratado continuam vendo).
drop policy if exists "Todos podem ver vagas" on public.vagas;
drop policy if exists "Vagas de contas ativas" on public.vagas;
create policy "Vagas de contas ativas" on public.vagas for select
  using (
    not public.conta_suspensa(usuario_id)
    or usuario_id = (select auth.uid())
    or contratado_id = (select auth.uid())
  );

-- Perfis suspensos somem das buscas (cada um continua vendo o próprio).
drop policy if exists "Logados veem perfis públicos" on public.profiles;
drop policy if exists "Logados veem perfis ativos" on public.profiles;
create policy "Logados veem perfis ativos" on public.profiles for select to authenticated
  using (not suspenso or id = (select auth.uid()));

-- --------------------------------------------------------------- bloqueios --
create table if not exists public.bloqueios (
  bloqueador_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  bloqueado_id  uuid not null references auth.users(id) on delete cascade,
  criado_em     timestamptz not null default now(),
  primary key (bloqueador_id, bloqueado_id),
  check (bloqueador_id <> bloqueado_id)
);
alter table public.bloqueios enable row level security;
revoke all on public.bloqueios from anon, authenticated;
grant select, insert, delete on public.bloqueios to authenticated;

drop policy if exists "Dono vê os próprios bloqueios" on public.bloqueios;
create policy "Dono vê os próprios bloqueios" on public.bloqueios for select to authenticated
  using (bloqueador_id = (select auth.uid()));
drop policy if exists "Dono bloqueia" on public.bloqueios;
create policy "Dono bloqueia" on public.bloqueios for insert to authenticated
  with check (bloqueador_id = (select auth.uid()));
drop policy if exists "Dono desbloqueia" on public.bloqueios;
create policy "Dono desbloqueia" on public.bloqueios for delete to authenticated
  using (bloqueador_id = (select auth.uid()));

create or replace function public.ha_bloqueio(p_a uuid, p_b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.bloqueios
     where (bloqueador_id = p_a and bloqueado_id = p_b)
        or (bloqueador_id = p_b and bloqueado_id = p_a)
  );
$$;
revoke execute on function public.ha_bloqueio(uuid, uuid) from public, anon, authenticated;

-- --------------------------------------------------------------- denúncias --
create table if not exists public.denuncias (
  id             uuid primary key default gen_random_uuid(),
  criado_em      timestamptz not null default now(),
  denunciante_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  denunciado_id  uuid not null references auth.users(id) on delete cascade,
  vaga_id        uuid references public.vagas(id) on delete set null,
  conversa_id    uuid references public.conversas(id) on delete set null,
  motivo         text not null check (motivo in ('golpe', 'assedio', 'vaga_falsa', 'ofensa', 'perfil_falso', 'outro')),
  detalhes       text check (char_length(detalhes) <= 1000),
  situacao       text not null default 'aberta' check (situacao in ('aberta', 'analisada', 'descartada')),
  check (denunciante_id <> denunciado_id)
);
create unique index if not exists denuncias_uma_aberta_por_pessoa
  on public.denuncias (denunciante_id, denunciado_id) where situacao = 'aberta';
create index if not exists denuncias_denunciado on public.denuncias (denunciado_id, situacao);
alter table public.denuncias enable row level security;
revoke all on public.denuncias from anon, authenticated;
grant select on public.denuncias to authenticated;
grant insert (denunciado_id, vaga_id, conversa_id, motivo, detalhes) on public.denuncias to authenticated;

drop policy if exists "Usuário denuncia" on public.denuncias;
create policy "Usuário denuncia" on public.denuncias for insert to authenticated
  with check (denunciante_id = (select auth.uid()));
drop policy if exists "Usuário vê as próprias denúncias" on public.denuncias;
create policy "Usuário vê as próprias denúncias" on public.denuncias for select to authenticated
  using (denunciante_id = (select auth.uid()));

-- 3 pessoas diferentes denunciaram → conta suspensa até revisão.
create or replace function public.suspender_se_denunciado()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select count(distinct denunciante_id) from public.denuncias
       where denunciado_id = new.denunciado_id and situacao = 'aberta') >= 3 then
    update public.profiles set suspenso = true where id = new.denunciado_id;
  end if;
  return new;
end $$;
revoke execute on function public.suspender_se_denunciado() from public, anon, authenticated;
drop trigger if exists denuncias_suspender on public.denuncias;
create trigger denuncias_suspender after insert on public.denuncias
  for each row execute function public.suspender_se_denunciado();

-- ------------------------------------------- limites, suspensão e bloqueios --
create index if not exists vagas_usuario_criado on public.vagas (usuario_id, criado_em desc);
create index if not exists conversas_freelancer_criado on public.conversas (freelancer_id, criado_em desc);
create index if not exists conversas_contratante_criado on public.conversas (contratante_id, criado_em desc);
create index if not exists chat_mensagens_autor_criado on public.chat_mensagens (autor_id, criado_em desc);

create or replace function public.checar_seguranca()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := auth.uid();
  v_outro uuid;
begin
  if v_uid is null then
    return new; -- chamadas internas (service role, gatilhos)
  end if;

  if public.conta_suspensa(v_uid) then
    raise exception 'Sua conta está em análise por causa de denúncias. Fale com projetoconecta401@gmail.com.';
  end if;

  if tg_table_name = 'vagas' then
    if (select count(*) from public.vagas where usuario_id = v_uid and criado_em > now() - interval '24 hours') >= 10 then
      raise exception 'Limite de 10 vagas por dia atingido. Tente novamente amanhã.';
    end if;

  elsif tg_table_name = 'conversas' then
    if public.ha_bloqueio(new.contratante_id, new.freelancer_id) then
      raise exception 'Não é possível conversar com esta pessoa.';
    end if;
    if (select count(*) from public.conversas
         where (contratante_id = v_uid or freelancer_id = v_uid) and criado_em > now() - interval '24 hours') >= 40 then
      raise exception 'Limite de 40 candidaturas/conversas novas por dia atingido. Tente amanhã.';
    end if;

  elsif tg_table_name = 'chat_mensagens' then
    select case when c.contratante_id = v_uid then c.freelancer_id else c.contratante_id end
      into v_outro from public.conversas c where c.id = new.conversa_id;
    if v_outro is not null and public.ha_bloqueio(v_uid, v_outro) then
      raise exception 'Não é possível enviar mensagens para esta pessoa.';
    end if;
    if (select count(*) from public.chat_mensagens where autor_id = v_uid and criado_em > now() - interval '1 minute') >= 20 then
      raise exception 'Você está enviando mensagens rápido demais. Aguarde um minuto.';
    end if;
    if (select count(*) from public.chat_mensagens where autor_id = v_uid and criado_em > now() - interval '24 hours') >= 1000 then
      raise exception 'Limite diário de mensagens atingido.';
    end if;

  elsif tg_table_name = 'denuncias' then
    if (select count(*) from public.denuncias where denunciante_id = v_uid and criado_em > now() - interval '24 hours') >= 10 then
      raise exception 'Limite de denúncias por dia atingido.';
    end if;
  end if;

  return new;
end $$;
revoke execute on function public.checar_seguranca() from public, anon, authenticated;

drop trigger if exists vagas_checar_seguranca on public.vagas;
create trigger vagas_checar_seguranca before insert on public.vagas
  for each row execute function public.checar_seguranca();
drop trigger if exists conversas_checar_seguranca on public.conversas;
create trigger conversas_checar_seguranca before insert on public.conversas
  for each row execute function public.checar_seguranca();
drop trigger if exists chat_mensagens_checar_seguranca on public.chat_mensagens;
create trigger chat_mensagens_checar_seguranca before insert on public.chat_mensagens
  for each row execute function public.checar_seguranca();
drop trigger if exists denuncias_checar_seguranca on public.denuncias;
create trigger denuncias_checar_seguranca before insert on public.denuncias
  for each row execute function public.checar_seguranca();
