-- Corrige as regras de acesso do perfil depois da proteção do CPF:
-- a data de nascimento não é mais guardada, então a regra passa a usar "maior_18".
drop policy if exists "Completa o próprio perfil" on public.profiles;
create policy "Completa o próprio perfil" on public.profiles
  for insert to authenticated
  with check (
    id = (select auth.uid())
    and lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
    and maior_18
  );

drop policy if exists "Edita o próprio perfil" on public.profiles;
create policy "Edita o próprio perfil" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and maior_18);
