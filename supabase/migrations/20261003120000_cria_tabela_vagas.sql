-- Conexão Free — tabela de vagas publicadas pelo formulário "Publicar Vaga".
--
-- Sem autenticação por enquanto: qualquer visitante (papel anon) pode LER e PUBLICAR
-- vagas. Ninguém pode ALTERAR ou EXCLUIR pela API (não há como saber quem é o dono
-- sem login). Quando houver autenticação, trocar autor_id por auth.uid() e criar
-- políticas de update/delete restritas ao dono.

create table if not exists public.vagas (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),
  titulo      text not null check (char_length(btrim(titulo)) between 3 and 120),
  categoria   text not null check (categoria in (
                'Gastronomia', 'Eventos', 'Design/Digital',
                'Estética/Beleza', 'Manutenção/Obras', 'Serviços Gerais')),
  valor       numeric(10, 2) not null check (valor > 0 and valor <= 100000),
  data        date not null,
  horario     text check (horario is null or char_length(horario) <= 60),
  bairro      text not null check (char_length(btrim(bairro)) between 2 and 80),
  cidade      text not null check (char_length(btrim(cidade)) between 2 and 80),
  uf          char(2) not null check (uf ~ '^[A-Z]{2}$'),
  whatsapp    text check (whatsapp is null or whatsapp ~ '^[0-9()+ .-]{8,20}$'),
  contratante text check (contratante is null or char_length(btrim(contratante)) between 2 and 80),
  detalhes    text check (detalhes is null or char_length(detalhes) <= 1000),
  -- Identificador anônimo do navegador que publicou (não é segredo nem login):
  -- serve só para mostrar "Minhas Vagas Criadas" no mesmo navegador.
  autor_id    uuid,
  status      text not null default 'Disponível'
              check (status in ('Disponível', 'Em Negociação', 'Em Atendimento', 'Concluída'))
);

comment on table public.vagas is
  'Vagas publicadas no Conexão Free (protótipo sem login: leitura e publicação abertas).';

-- O mural lista as vagas mais recentes primeiro.
create index if not exists vagas_criado_em_idx on public.vagas (criado_em desc);

-- RLS obrigatório: a tabela fica exposta na Data API (schema public).
alter table public.vagas enable row level security;

drop policy if exists "Todos podem ver vagas" on public.vagas;
create policy "Todos podem ver vagas"
  on public.vagas for select
  to anon, authenticated
  using (true);

drop policy if exists "Todos podem publicar vagas disponíveis" on public.vagas;
create policy "Todos podem publicar vagas disponíveis"
  on public.vagas for insert
  to anon, authenticated
  with check (
    status = 'Disponível'
    and data >= current_date - 1   -- não aceita data já passada (1 dia de folga por fuso)
  );

-- Acesso à tabela pela Data API: só leitura e inclusão.
grant select, insert on public.vagas to anon, authenticated;
revoke update, delete, truncate on public.vagas from anon, authenticated;
