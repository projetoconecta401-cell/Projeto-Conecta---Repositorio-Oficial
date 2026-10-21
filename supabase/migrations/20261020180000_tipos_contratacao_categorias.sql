-- EiFreela · Mais categorias, tipos de contratação, avaliações anônimas e avaliação do app
--  1) Categorias novas (design, criação de conteúdo, vendas, temporários etc.).
--     "Design/Digital" passa a se chamar "Design gráfico".
--  2) Tipo da vaga: diária, temporário (ex.: fim de ano) ou freela/projeto,
--     com período, carga horária, regime, unidade do valor, nº de vagas e trabalho remoto.
--  3) Vaga com várias posições: ao aceitar cada pessoa, o app cria uma "cópia" da vaga só
--     para ela (contratar_candidato). Assim check-in, check-out e avaliação seguem iguais.
--     quantidade NULL = "sem número fixo": o contratante aceita quantas pessoas quiser
--     e encerra a vaga quando completar a equipe.
--  4) Avaliações anônimas: não dá para ver quem avaliou nem em qual vaga.
--  5) Avaliação do aplicativo pelos usuários, com pontos de melhoria.

-- ------------------------------------------------------------ 1) categorias --
alter table public.vagas drop constraint if exists vagas_categoria_check;
alter table public.profiles drop constraint if exists profiles_areas_check;

update public.vagas set categoria = 'Design gráfico' where categoria = 'Design/Digital';
update public.profiles set areas = array_replace(areas, 'Design/Digital', 'Design gráfico') where 'Design/Digital' = any (areas);

create or replace function public.categorias_eifreela()
returns text[] language sql immutable as $$
  select array[
    'Gastronomia', 'Eventos', 'Vendas e comércio', 'Administrativo',
    'Design gráfico', 'Criação de conteúdo', 'Fotografia e vídeo', 'Tecnologia e TI',
    'Estética/Beleza', 'Manutenção/Obras', 'Serviços Gerais', 'Logística e entregas',
    'Motorista', 'Cuidados (babá e idosos)', 'Aulas e reforço', 'Agro e campo'
  ]::text[];
$$;

alter table public.vagas add constraint vagas_categoria_check
  check (categoria = any (public.categorias_eifreela()));
alter table public.profiles add constraint profiles_areas_check
  check (cardinality(areas) between 1 and 6 and areas <@ public.categorias_eifreela());

-- ------------------------------------------------------- 2) tipo da vaga --
alter table public.vagas
  add column if not exists tipo text not null default 'diaria'
    check (tipo in ('diaria', 'temporario', 'freela')),
  add column if not exists data_fim date,
  add column if not exists carga_horaria text check (char_length(carga_horaria) <= 80),
  add column if not exists regime text
    check (regime in ('clt_temporario', 'prestacao_servico', 'a_combinar')),
  add column if not exists valor_unidade text not null default 'dia'
    check (valor_unidade in ('hora', 'dia', 'semana', 'mes', 'projeto')),
  add column if not exists quantidade integer default 1
    check (quantidade is null or quantidade between 1 and 50),
  add column if not exists remoto boolean not null default false,
  add column if not exists vaga_origem_id uuid references public.vagas(id) on delete set null;

alter table public.vagas drop constraint if exists vagas_data_fim_check;
alter table public.vagas add constraint vagas_data_fim_check
  check (data_fim is null or data_fim >= data);

grant insert (tipo, data_fim, carga_horaria, regime, valor_unidade, quantidade, remoto) on public.vagas to authenticated;

-- Cópias criadas na contratação não contam no limite diário nem geram aviso de vaga nova.
create or replace function public.checar_seguranca()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := auth.uid();
  v_outro uuid;
begin
  if v_uid is null then
    return new;
  end if;

  if public.conta_suspensa(v_uid) then
    raise exception 'Sua conta está em análise por causa de denúncias. Fale com projetoconecta401@gmail.com.';
  end if;

  if tg_table_name = 'vagas' then
    if new.vaga_origem_id is null
       and (select count(*) from public.vagas
             where usuario_id = v_uid and vaga_origem_id is null and criado_em > now() - interval '24 hours') >= 10 then
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

create or replace function public.avisar_nova_vaga()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_titulo text := case new.tipo
                     when 'temporario' then 'Vaga temporária em '
                     when 'freela' then 'Novo freela em '
                     else 'Nova vaga em ' end || new.categoria;
  v_corpo  text := new.titulo || ' · ' || case when new.remoto then 'Remoto' else new.bairro || ', ' || new.cidade end;
  v_inscricoes jsonb;
  v_segredo text;
begin
  if new.vaga_origem_id is not null then
    return new; -- cópia criada na contratação: não é vaga nova
  end if;

  insert into public.notificacoes (usuario_id, vaga_id, titulo, corpo)
  select p.id, new.id, v_titulo, v_corpo
  from public.profiles p
  where new.categoria = any (p.areas) and p.id is distinct from new.usuario_id;

  select coalesce(jsonb_agg(jsonb_build_object('endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth)), '[]'::jsonb)
    into v_inscricoes
  from public.push_inscricoes s
  join public.profiles p on p.id = s.usuario_id
  where new.categoria = any (p.areas) and p.id is distinct from new.usuario_id;

  select decrypted_secret into v_segredo from vault.decrypted_secrets where name = 'notificar_vaga_segredo' limit 1;

  if jsonb_array_length(v_inscricoes) > 0 and v_segredo is not null then
    perform net.http_post(
      url     := 'https://yrnxekmviprbhlviuwvt.supabase.co/functions/v1/notificar-vaga',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-eifreela-segredo', v_segredo),
      body    := jsonb_build_object(
        'titulo', v_titulo, 'corpo', v_corpo, 'url', '/#/vaga/' || new.id, 'inscricoes', v_inscricoes)
    );
  end if;
  return new;
exception when others then
  raise warning 'avisar_nova_vaga: %', sqlerrm;
  return new;
end $$;

-- ------------------------------------------- 3) contratar (1 ou várias vagas) --
create or replace function public.contratar_candidato(p_vaga uuid, p_freelancer uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v      public.vagas%rowtype;
  v_nova uuid;
begin
  select * into v from public.vagas where id = p_vaga for update;
  if not found or v.usuario_id is distinct from (select auth.uid()) then
    raise exception 'Só quem publicou a vaga pode contratar.';
  end if;
  if v.contratado_id is not null or v.status not in ('Disponível', 'Em Negociação') then
    raise exception 'Esta vaga não está mais aberta.';
  end if;
  if not exists (select 1 from public.conversas c where c.vaga_id = p_vaga and c.freelancer_id = p_freelancer) then
    raise exception 'Só é possível contratar quem se candidatou a esta vaga.';
  end if;

  -- Uma posição: contrata na própria vaga (fluxo de sempre).
  if v.quantidade is not null and v.quantidade <= 1 then
    update public.vagas set contratado_id = p_freelancer, status = 'Em Atendimento' where id = p_vaga;
    return p_vaga;
  end if;

  -- Várias posições (ou sem número fixo): cria a vaga desta pessoa e,
  -- se houver número definido, diminui as posições abertas.
  insert into public.vagas (titulo, categoria, valor, data, horario, bairro, cidade, uf, contratante, detalhes,
                            usuario_id, lat_aprox, lng_aprox, tipo, data_fim, carga_horaria, regime,
                            valor_unidade, quantidade, remoto, vaga_origem_id, status)
  values (v.titulo, v.categoria, v.valor, v.data, v.horario, v.bairro, v.cidade, v.uf, v.contratante, v.detalhes,
          v.usuario_id, v.lat_aprox, v.lng_aprox, v.tipo, v.data_fim, v.carga_horaria, v.regime,
          v.valor_unidade, 1, v.remoto, v.id, 'Em Negociação')
  returning id into v_nova;

  insert into public.vagas_contato (vaga_id, whatsapp)
    select v_nova, whatsapp from public.vagas_contato where vaga_id = p_vaga
  on conflict (vaga_id) do nothing;

  update public.conversas set vaga_id = v_nova where vaga_id = p_vaga and freelancer_id = p_freelancer;
  update public.vagas set contratado_id = p_freelancer, status = 'Em Atendimento' where id = v_nova;
  update public.vagas set quantidade = quantidade - 1 where id = p_vaga and quantidade is not null;

  return v_nova;
end
$$;
revoke execute on function public.contratar_candidato(uuid, uuid) from public, anon;
grant execute on function public.contratar_candidato(uuid, uuid) to authenticated;

-- ------------------------------------------------------- 4) avaliações anônimas --
-- Ninguém (pelo app) consegue ver quem avaliou nem em qual vaga. Cada pessoa só vê,
-- pelas funções abaixo, as avaliações que ela mesma fez ou recebeu.
revoke select on public.avaliacoes from anon, authenticated;
grant select (id, avaliado_id, nota, comentario, criterios, trabalharia_novamente, criado_em)
  on public.avaliacoes to authenticated;

create or replace function public.minhas_avaliacoes_feitas()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select vaga_id from public.avaliacoes where avaliador_id = (select auth.uid());
$$;

create or replace function public.minhas_avaliacoes_recebidas()
returns table (vaga_id uuid, nota numeric, comentario text, criado_em timestamptz)
language sql stable security definer set search_path = '' as $$
  select a.vaga_id, a.nota::numeric, a.comentario, a.criado_em
  from public.avaliacoes a where a.avaliado_id = (select auth.uid());
$$;

revoke execute on function public.minhas_avaliacoes_feitas() from public, anon;
revoke execute on function public.minhas_avaliacoes_recebidas() from public, anon;
grant execute on function public.minhas_avaliacoes_feitas() to authenticated;
grant execute on function public.minhas_avaliacoes_recebidas() to authenticated;

-- ------------------------------------------------- 5) avaliação do aplicativo --
-- Nota de 1 a 5, se recomendaria, pontos a melhorar e sugestão livre.
-- Cada pessoa só vê as próprias respostas; a equipe vê tudo pelo painel do Supabase.
create table if not exists public.avaliacoes_app (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nota smallint not null check (nota between 1 and 5),
  recomendaria text check (recomendaria in ('sim', 'talvez', 'nao')),
  melhorias text[] not null default '{}' check (cardinality(melhorias) <= 12),
  sugestao text check (char_length(sugestao) <= 1000),
  modo text check (modo in ('trabalhar', 'contratar')),
  versao_app text check (char_length(versao_app) <= 40)
);
create index if not exists avaliacoes_app_usuario_idx on public.avaliacoes_app (usuario_id, criado_em desc);

alter table public.avaliacoes_app enable row level security;

drop policy if exists "Vejo minhas avaliações do app" on public.avaliacoes_app;
create policy "Vejo minhas avaliações do app" on public.avaliacoes_app
  for select to authenticated using (usuario_id = (select auth.uid()));

-- No máximo 3 respostas por dia por pessoa (evita spam).
drop policy if exists "Avalio o app" on public.avaliacoes_app;
create policy "Avalio o app" on public.avaliacoes_app
  for insert to authenticated with check (
    usuario_id = (select auth.uid())
    and (select count(*) from public.avaliacoes_app a
          where a.usuario_id = (select auth.uid()) and a.criado_em > now() - interval '24 hours') < 3
  );

revoke all on public.avaliacoes_app from anon, authenticated;
grant select on public.avaliacoes_app to authenticated;
grant insert (nota, recomendaria, melhorias, sugestao, modo, versao_app) on public.avaliacoes_app to authenticated;

-- Resumo para a equipe (ex.: banner da culminância). Só o painel/serviço acessa.
create or replace view public.resumo_avaliacoes_app with (security_invoker = true) as
  select count(*)::int as respostas,
         round(avg(nota), 2) as nota_media,
         round(100.0 * count(*) filter (where recomendaria = 'sim') / nullif(count(*) filter (where recomendaria is not null), 0), 1) as pct_recomendaria
  from public.avaliacoes_app;
revoke all on public.resumo_avaliacoes_app from anon, authenticated;
