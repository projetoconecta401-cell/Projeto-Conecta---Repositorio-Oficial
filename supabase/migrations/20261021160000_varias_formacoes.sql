-- Resumo profissional: várias formações (até 4), guardadas em formacao = { itens: [...] }.
alter table public.profiles drop constraint if exists profiles_formacao_check;
alter table public.profiles add constraint profiles_formacao_check
  check (jsonb_typeof(formacao) = 'object' and octet_length(formacao::text) <= 3000);
