-- =============================================================================
-- EiFreela — estrutura do banco (perfis, chat, avaliações, notificações, push)
-- Aplicada no projeto Supabase "projeto-conecta" em 12/10/2026.
-- Nenhuma tabela de dados bancários (conta, PIX, cartão) existe ou é criada aqui.
-- =============================================================================

create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------- CPF válido --
create or replace function public.cpf_valido(p text)
returns boolean language plpgsql immutable set search_path = '' as $$
declare
  d int[];
  s int;
  r int;
  k int;
begin
  if p is null or p !~ '^[0-9]{11}$' or p = repeat(substr(p, 1, 1), 11) then
    return false;
  end if;
  d := array(select substr(p, g, 1)::int from generate_series(1, 11) g);
  s := 0;
  for k in 1..9 loop s := s + d[k] * (11 - k); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  if r <> d[10] then return false; end if;
  s := 0;
  for k in 1..10 loop s := s + d[k] * (12 - k); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  return r = d[11];
end $$;

-- ------------------------------------------------------------------ profiles --
-- Somente: nome completo, CPF, e-mail, nascimento, telefone/WhatsApp, avatar e
-- áreas de atuação. A senha fica no Supabase Auth (com hash), nunca aqui.
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  nome            text not null check (char_length(btrim(nome)) between 3 and 100),
  cpf             text not null unique check (public.cpf_valido(cpf)),
  email           text not null check (char_length(email) between 3 and 254),
  data_nascimento date not null check (data_nascimento > date '1900-01-01'),
  telefone        text not null check (telefone ~ '^[0-9]{10,13}$'),
  avatar_url      text check (avatar_url is null or char_length(avatar_url) <= 500),
  areas           text[] not null check (
                    cardinality(areas) between 1 and 6
                    and areas <@ array['Gastronomia','Eventos','Design/Digital','Estética/Beleza','Manutenção/Obras','Serviços Gerais']
                  ),
  criado_em       timestamptz not null default now()
);
comment on table public.profiles is 'Perfis do EiFreela. CPF, e-mail, nascimento e telefone só são lidos pelo dono (função meu_perfil); os demais veem nome, avatar e áreas.';

alter table public.profiles enable row level security;

-- Privilégios por coluna: dados pessoais nunca saem pela API para terceiros.
revoke all on public.profiles from anon, authenticated;
grant select (id, nome, avatar_url, areas, criado_em) on public.profiles to authenticated;
grant insert (id, nome, cpf, email, data_nascimento, telefone, avatar_url, areas) on public.profiles to authenticated;
grant update (nome, data_nascimento, telefone, avatar_url, areas) on public.profiles to authenticated;

create policy "Logados veem perfis públicos" on public.profiles
  for select to authenticated using (true);

-- Usado por quem entrou com Google/Facebook e precisa completar o cadastro.
create policy "Completa o próprio perfil" on public.profiles
  for insert to authenticated
  with check (
    id = (select auth.uid())
    and lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
    and data_nascimento <= (current_date - interval '18 years')
  );

create policy "Edita o próprio perfil" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and data_nascimento <= (current_date - interval '18 years'));

create index if not exists profiles_areas_idx on public.profiles using gin (areas);

create or replace function public.meu_perfil()
returns setof public.profiles language sql stable security definer set search_path = '' as $$
  select * from public.profiles where id = (select auth.uid());
$$;
revoke execute on function public.meu_perfil() from public, anon;
grant execute on function public.meu_perfil() to authenticated;

-- ----------------------------------------------------------- avatars (Storage) --
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create policy "Avatar: dono envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Avatar: dono substitui" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Avatar: dono apaga" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- --------------------------------------------------------------------- vagas --
-- Localização: só bairro/cidade/UF e coordenadas arredondadas para 2 casas
-- decimais (~1 km). O endereço exato nunca é guardado.
alter table public.vagas add column if not exists lat_aprox numeric(5,2)
  check (lat_aprox is null or lat_aprox between -90 and 90);
alter table public.vagas add column if not exists lng_aprox numeric(6,2)
  check (lng_aprox is null or lng_aprox between -180 and 180);
comment on table public.vagas is 'Vagas do EiFreela. Sem endereço exato: apenas bairro, cidade, UF e coordenadas aproximadas (~1 km).';

grant update (status, titulo, detalhes, valor, data, horario) on public.vagas to authenticated;
create policy "Dono atualiza a própria vaga" on public.vagas for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create index if not exists vagas_criado_em_idx on public.vagas (criado_em desc);

-- ------------------------------------------------------------------ conversas --
create table if not exists public.conversas (
  id             uuid primary key default gen_random_uuid(),
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  vaga_id        uuid not null references public.vagas (id) on delete cascade,
  contratante_id uuid not null references auth.users (id) on delete cascade,
  freelancer_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  unique (vaga_id, freelancer_id),
  check (contratante_id <> freelancer_id)
);
alter table public.conversas enable row level security;
create index if not exists conversas_contratante_idx on public.conversas (contratante_id);
create index if not exists conversas_freelancer_idx on public.conversas (freelancer_id);

create policy "Participantes veem a conversa" on public.conversas for select to authenticated
  using ((select auth.uid()) in (contratante_id, freelancer_id));

-- Freelancer abre conversa numa vaga aberta de outra pessoa.
create policy "Freelancer inicia conversa" on public.conversas for insert to authenticated
  with check (
    freelancer_id = (select auth.uid())
    and exists (
      select 1 from public.vagas v
      where v.id = vaga_id and v.usuario_id = contratante_id
        and v.status in ('Disponível', 'Em Negociação')
    )
  );

-- ------------------------------------------------------------- chat_mensagens --
create table if not exists public.chat_mensagens (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),
  conversa_id uuid not null references public.conversas (id) on delete cascade,
  autor_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  texto       text not null check (char_length(btrim(texto)) between 1 and 2000)
);
alter table public.chat_mensagens enable row level security;
create index if not exists chat_mensagens_conversa_idx on public.chat_mensagens (conversa_id, criado_em);
create index if not exists chat_mensagens_autor_idx on public.chat_mensagens (autor_id);

create policy "Participantes leem mensagens" on public.chat_mensagens for select to authenticated
  using (exists (
    select 1 from public.conversas c
    where c.id = conversa_id and (select auth.uid()) in (c.contratante_id, c.freelancer_id)
  ));
create policy "Participantes enviam mensagens" on public.chat_mensagens for insert to authenticated
  with check (
    autor_id = (select auth.uid())
    and exists (
      select 1 from public.conversas c
      where c.id = conversa_id and (select auth.uid()) in (c.contratante_id, c.freelancer_id)
    )
  );

create or replace function public.tocar_conversa()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.conversas set atualizado_em = now() where id = new.conversa_id;
  return new;
end $$;
revoke execute on function public.tocar_conversa() from public, anon, authenticated;
drop trigger if exists chat_mensagens_toca_conversa on public.chat_mensagens;
create trigger chat_mensagens_toca_conversa after insert on public.chat_mensagens
  for each row execute function public.tocar_conversa();

-- ----------------------------------------------------------------- avaliações --
create table if not exists public.avaliacoes (
  id           uuid primary key default gen_random_uuid(),
  criado_em    timestamptz not null default now(),
  vaga_id      uuid not null references public.vagas (id) on delete cascade,
  avaliador_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  avaliado_id  uuid not null references public.profiles (id) on delete cascade,
  nota         smallint not null check (nota between 1 and 5),
  comentario   text check (comentario is null or char_length(comentario) <= 500),
  unique (vaga_id, avaliador_id, avaliado_id),
  check (avaliador_id <> avaliado_id)
);
alter table public.avaliacoes enable row level security;
create index if not exists avaliacoes_avaliado_idx on public.avaliacoes (avaliado_id);
create index if not exists avaliacoes_avaliador_idx on public.avaliacoes (avaliador_id);

create policy "Logados veem avaliações" on public.avaliacoes for select to authenticated using (true);

-- Só quem negociou aquela vaga (contratante ↔ freelancer) e depois da conclusão.
create policy "Avalia após concluir" on public.avaliacoes for insert to authenticated
  with check (
    avaliador_id = (select auth.uid())
    and exists (
      select 1 from public.conversas c join public.vagas v on v.id = c.vaga_id
      where c.vaga_id = avaliacoes.vaga_id and v.status = 'Concluída'
        and (
          (c.contratante_id = (select auth.uid()) and c.freelancer_id = avaliado_id)
          or (c.freelancer_id = (select auth.uid()) and c.contratante_id = avaliado_id)
        )
    )
  );

create or replace view public.notas_perfis with (security_invoker = true) as
  select avaliado_id as perfil_id, round(avg(nota)::numeric, 1) as media, count(*)::int as total
  from public.avaliacoes group by avaliado_id;
grant select on public.notas_perfis to authenticated;

-- --------------------------------------------------------------- notificações --
create table if not exists public.notificacoes (
  id         uuid primary key default gen_random_uuid(),
  criado_em  timestamptz not null default now(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  vaga_id    uuid references public.vagas (id) on delete cascade,
  titulo     text not null,
  corpo      text,
  lida       boolean not null default false
);
alter table public.notificacoes enable row level security;
create index if not exists notificacoes_usuario_idx on public.notificacoes (usuario_id, criado_em desc);
create index if not exists notificacoes_vaga_idx on public.notificacoes (vaga_id);
revoke all on public.notificacoes from anon, authenticated;
grant select, delete on public.notificacoes to authenticated;
grant update (lida) on public.notificacoes to authenticated;

create policy "Dono lê notificações" on public.notificacoes for select to authenticated
  using (usuario_id = (select auth.uid()));
create policy "Dono marca como lida" on public.notificacoes for update to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
create policy "Dono apaga notificação" on public.notificacoes for delete to authenticated
  using (usuario_id = (select auth.uid()));

-- ---------------------------------------------------- inscrições de Web Push --
create table if not exists public.push_inscricoes (
  id         uuid primary key default gen_random_uuid(),
  criado_em  timestamptz not null default now(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  endpoint   text not null unique check (endpoint ~ '^https://' and char_length(endpoint) <= 1000),
  p256dh     text not null check (char_length(p256dh) <= 200),
  auth       text not null check (char_length(auth) <= 100)
);
alter table public.push_inscricoes enable row level security;
create index if not exists push_inscricoes_usuario_idx on public.push_inscricoes (usuario_id);
revoke all on public.push_inscricoes from anon, authenticated;
grant select, delete on public.push_inscricoes to authenticated;
create policy "Dono vê inscrições" on public.push_inscricoes for select to authenticated
  using (usuario_id = (select auth.uid()));
create policy "Dono remove inscrições" on public.push_inscricoes for delete to authenticated
  using (usuario_id = (select auth.uid()));

-- Grava (ou transfere para quem está logado) a inscrição deste aparelho.
create or replace function public.salvar_inscricao_push(p_endpoint text, p_p256dh text, p_auth text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'login necessário'; end if;
  delete from public.push_inscricoes where endpoint = p_endpoint;
  insert into public.push_inscricoes (usuario_id, endpoint, p256dh, auth)
  values ((select auth.uid()), p_endpoint, p_p256dh, p_auth);
end $$;
revoke execute on function public.salvar_inscricao_push(text, text, text) from public, anon;
grant execute on function public.salvar_inscricao_push(text, text, text) to authenticated;

-- -------------------------------------------- aviso de nova vaga (gatilho) --
-- 1) Cria notificação no app para quem atua na categoria da vaga.
-- 2) Chama a Edge Function "notificar-vaga" (Web Push) com as inscrições dessas pessoas.
create or replace function public.avisar_nova_vaga()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_titulo text := 'Nova vaga em ' || new.categoria;
  v_corpo  text := new.titulo || ' · ' || new.bairro || ', ' || new.cidade;
  v_inscricoes jsonb;
  v_segredo text;
begin
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
  -- Um problema no aviso nunca impede a publicação da vaga.
  raise warning 'avisar_nova_vaga: %', sqlerrm;
  return new;
end $$;
revoke execute on function public.avisar_nova_vaga() from public, anon, authenticated;
drop trigger if exists vagas_avisar_nova on public.vagas;
create trigger vagas_avisar_nova after insert on public.vagas
  for each row execute function public.avisar_nova_vaga();

-- ------------------------------------------------------------------ Realtime --
alter publication supabase_realtime add table public.vagas, public.conversas, public.chat_mensagens, public.notificacoes;
