-- =============================================================================
-- EiFreela v2 — leva para o banco o que o app antigo guardava só na memória:
--   • contratação (quem foi selecionado), check-in e check-out da diária
--   • conversas diretas com profissionais (sem vaga) e mensagens de ÁUDIO
--   • avaliação com critérios e "trabalharia novamente"
--   • avisos automáticos: novo candidato e "você foi selecionado"
-- Requer a migração 20261012150000_eifreela_base.sql aplicada antes.
-- =============================================================================

-- ---------------------------------------------------- vagas: contratação --
alter table public.vagas add column if not exists contratado_id uuid references auth.users (id) on delete set null;
alter table public.vagas add column if not exists check_in_em  timestamptz;
alter table public.vagas add column if not exists check_out_em timestamptz;
create index if not exists vagas_contratado_idx on public.vagas (contratado_id);
create index if not exists vagas_usuario_idx on public.vagas (usuario_id);

-- O dono escolhe/remove o contratado (a política "Dono atualiza a própria vaga" já vale).
grant update (contratado_id) on public.vagas to authenticated; -- check-in/out só pela função registrar_presenca

-- Só pode contratar quem se candidatou (abriu conversa nessa vaga).
create or replace function public.validar_contratacao()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.contratado_id is not null and new.contratado_id is distinct from old.contratado_id then
    if not exists (
      select 1 from public.conversas c where c.vaga_id = new.id and c.freelancer_id = new.contratado_id
    ) then
      raise exception 'Só é possível contratar quem se candidatou a esta vaga.';
    end if;
    new.check_in_em := null;
    new.check_out_em := null;
  end if;
  if new.contratado_id is null then
    new.check_in_em := null;
    new.check_out_em := null;
  end if;
  return new;
end $$;
revoke execute on function public.validar_contratacao() from public, anon, authenticated;
drop trigger if exists vagas_validar_contratacao on public.vagas;
create trigger vagas_validar_contratacao before update of contratado_id on public.vagas
  for each row execute function public.validar_contratacao();

-- Check-in / check-out feitos pelo profissional contratado (não pelo dono).
-- O check-out conclui a diária, o que libera as avaliações.
create or replace function public.registrar_presenca(p_vaga uuid, p_tipo text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v public.vagas%rowtype;
begin
  select * into v from public.vagas where id = p_vaga for update;
  if not found or v.contratado_id is distinct from (select auth.uid()) then
    raise exception 'Só o profissional contratado pode registrar presença.';
  end if;
  if v.status <> 'Em Atendimento' then
    raise exception 'A diária não está em atendimento.';
  end if;
  if p_tipo = 'entrada' then
    if v.check_in_em is not null then raise exception 'Check-in já registrado.'; end if;
    update public.vagas set check_in_em = now() where id = p_vaga;
  elsif p_tipo = 'saida' then
    if v.check_in_em is null then raise exception 'Faça o check-in antes do check-out.'; end if;
    update public.vagas set check_out_em = now(), status = 'Concluída' where id = p_vaga;
    insert into public.notificacoes (usuario_id, vaga_id, titulo, corpo)
    values (v.usuario_id, v.id, 'Diária concluída', 'O profissional fez o check-out de "' || v.titulo || '". Avalie o serviço.');
  else
    raise exception 'Tipo inválido.';
  end if;
end $$;
revoke execute on function public.registrar_presenca(uuid, text) from public, anon;
grant execute on function public.registrar_presenca(uuid, text) to authenticated;

-- O profissional contratado desiste: a vaga volta para o mural.
create or replace function public.desistir_da_vaga(p_vaga uuid, p_motivo text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v public.vagas%rowtype;
begin
  select * into v from public.vagas where id = p_vaga for update;
  if not found or v.contratado_id is distinct from (select auth.uid()) then
    raise exception 'Você não está contratado para esta vaga.';
  end if;
  if v.status = 'Concluída' then raise exception 'A diária já foi concluída.'; end if;
  update public.vagas set contratado_id = null, status = 'Disponível' where id = p_vaga;
  insert into public.notificacoes (usuario_id, vaga_id, titulo, corpo)
  values (v.usuario_id, v.id, 'Profissional desistiu',
          '"' || v.titulo || '" voltou para o mural.' ||
          coalesce(' Motivo: ' || left(nullif(btrim(p_motivo), ''), 200), ''));
end $$;
revoke execute on function public.desistir_da_vaga(uuid, text) from public, anon;
grant execute on function public.desistir_da_vaga(uuid, text) to authenticated;

-- Aviso ao profissional quando é selecionado (ou quando a contratação é cancelada).
create or replace function public.avisar_contratacao()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.contratado_id is not null and new.contratado_id is distinct from old.contratado_id then
    insert into public.notificacoes (usuario_id, vaga_id, titulo, corpo)
    values (new.contratado_id, new.id, 'Você foi selecionado! 🎉',
            'Sua candidatura para "' || new.titulo || '" foi aceita. Combine os detalhes pelo chat.');
  elsif old.contratado_id is not null and new.contratado_id is null
        and old.contratado_id is distinct from (select auth.uid()) then
    insert into public.notificacoes (usuario_id, vaga_id, titulo, corpo)
    values (old.contratado_id, new.id, 'Contratação cancelada',
            'O contratante cancelou a diária "' || new.titulo || '".');
  end if;
  return new;
end $$;
revoke execute on function public.avisar_contratacao() from public, anon, authenticated;
drop trigger if exists vagas_avisar_contratacao on public.vagas;
create trigger vagas_avisar_contratacao after update of contratado_id on public.vagas
  for each row execute function public.avisar_contratacao();

-- ------------------------------------------- conversas: chat direto também --
-- vaga_id preenchido = candidatura (freelancer_id é quem se candidatou).
-- vaga_id vazio      = conversa direta (contratante_id é quem iniciou o contato).
alter table public.conversas alter column vaga_id drop not null;
create unique index if not exists conversas_direta_unica
  on public.conversas (least(contratante_id, freelancer_id), greatest(contratante_id, freelancer_id))
  where vaga_id is null;

drop policy if exists "Freelancer inicia conversa" on public.conversas;
create policy "Inicia conversa" on public.conversas for insert to authenticated
  with check (
    (
      vaga_id is not null
      and freelancer_id = (select auth.uid())
      and exists (
        select 1 from public.vagas v
        where v.id = vaga_id and v.usuario_id = contratante_id
          and v.status in ('Disponível', 'Em Negociação')
      )
    )
    or (
      vaga_id is null
      and contratante_id = (select auth.uid())
      and freelancer_id <> (select auth.uid())
    )
  );

-- Nova candidatura: a vaga passa a "Em Negociação" e o dono é avisado.
create or replace function public.avisar_candidatura()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_titulo text;
  v_nome text;
begin
  if new.vaga_id is null then return new; end if;
  update public.vagas set status = 'Em Negociação' where id = new.vaga_id and status = 'Disponível'
  returning titulo into v_titulo;
  if v_titulo is null then select titulo into v_titulo from public.vagas where id = new.vaga_id; end if;
  select nome into v_nome from public.profiles where id = new.freelancer_id;
  insert into public.notificacoes (usuario_id, vaga_id, titulo, corpo)
  values (new.contratante_id, new.vaga_id, 'Novo candidato!',
          coalesce(v_nome, 'Um profissional') || ' se candidatou para "' || v_titulo || '".');
  return new;
end $$;
revoke execute on function public.avisar_candidatura() from public, anon, authenticated;
drop trigger if exists conversas_avisar_candidatura on public.conversas;
create trigger conversas_avisar_candidatura after insert on public.conversas
  for each row execute function public.avisar_candidatura();

-- Recebe o id como texto (nome da pasta no Storage) para nunca falhar em conversão.
create or replace function public.eh_participante(p_conversa text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.conversas c
    where c.id::text = p_conversa and (select auth.uid()) in (c.contratante_id, c.freelancer_id)
  );
$$;
revoke execute on function public.eh_participante(text) from public, anon;
grant execute on function public.eh_participante(text) to authenticated;

-- -------------------------------------------- mensagens de texto e de áudio --
alter table public.chat_mensagens drop constraint if exists chat_mensagens_texto_check;
alter table public.chat_mensagens alter column texto drop not null;
alter table public.chat_mensagens add column if not exists tipo text not null default 'texto';
alter table public.chat_mensagens add column if not exists audio_path text;
alter table public.chat_mensagens add column if not exists duracao_seg integer;
alter table public.chat_mensagens drop constraint if exists chat_mensagens_conteudo_check;
alter table public.chat_mensagens add constraint chat_mensagens_conteudo_check check (
  (tipo = 'texto' and texto is not null and char_length(btrim(texto)) between 1 and 2000 and audio_path is null)
  or (
    tipo = 'audio' and audio_path is not null and char_length(audio_path) <= 300
    and audio_path like conversa_id::text || '/%'
    and duracao_seg between 1 and 600
  )
);

-- Bucket privado: só os dois participantes da conversa enviam e ouvem.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-audios', 'chat-audios', false, 5242880,
        array['audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/aac','audio/x-m4a','audio/wav'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/aac','audio/x-m4a','audio/wav'];

drop policy if exists "Áudio: participante envia" on storage.objects;
create policy "Áudio: participante envia" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-audios'
    and public.eh_participante((storage.foldername(name))[1])
  );
drop policy if exists "Áudio: participante ouve" on storage.objects;
create policy "Áudio: participante ouve" on storage.objects for select to authenticated
  using (
    bucket_id = 'chat-audios'
    and public.eh_participante((storage.foldername(name))[1])
  );

-- ------------------------------------------- avaliações: critérios + regra --
alter table public.avaliacoes add column if not exists criterios jsonb;
alter table public.avaliacoes add column if not exists trabalharia_novamente text
  check (trabalharia_novamente is null or trabalharia_novamente in ('Sim', 'Talvez', 'Não'));

-- Só avaliam entre si o dono da vaga e o profissional contratado, após a conclusão.
drop policy if exists "Avalia após concluir" on public.avaliacoes;
create policy "Avalia após concluir" on public.avaliacoes for insert to authenticated
  with check (
    avaliador_id = (select auth.uid())
    and exists (
      select 1 from public.vagas v
      where v.id = avaliacoes.vaga_id and v.status = 'Concluída' and v.contratado_id is not null
        and (
          (v.usuario_id = (select auth.uid()) and v.contratado_id = avaliado_id)
          or (v.contratado_id = (select auth.uid()) and v.usuario_id = avaliado_id)
        )
    )
  );

alter publication supabase_realtime add table public.avaliacoes;
