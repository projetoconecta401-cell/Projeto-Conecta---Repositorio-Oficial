-- EiFreela · Mini currículo do profissional (opcional, visível para usuários logados)
--   sobre        : apresentação curta (até 400 caracteres)
--   formacao     : { escolaridade, curso, instituicao, situacao, periodo }
--   experiencias : até 5 itens { funcao, local, periodo, descricao }
--   cursos       : até 8 cursos/certificados (texto curto)

alter table public.profiles
  add column if not exists sobre text
    check (char_length(sobre) <= 400),
  add column if not exists formacao jsonb not null default '{}'::jsonb
    check (jsonb_typeof(formacao) = 'object' and octet_length(formacao::text) <= 1200),
  add column if not exists experiencias jsonb not null default '[]'::jsonb
    check (jsonb_typeof(experiencias) = 'array' and jsonb_array_length(experiencias) <= 5 and octet_length(experiencias::text) <= 4000),
  add column if not exists cursos jsonb not null default '[]'::jsonb
    check (jsonb_typeof(cursos) = 'array' and jsonb_array_length(cursos) <= 8 and octet_length(cursos::text) <= 1600);

-- Leitura por usuários logados (como nome, foto e áreas) e edição só do próprio perfil
-- (a política "Edita o próprio perfil" já limita a linha ao dono).
grant select (sobre, formacao, experiencias, cursos) on public.profiles to authenticated;
grant update (sobre, formacao, experiencias, cursos) on public.profiles to authenticated;
