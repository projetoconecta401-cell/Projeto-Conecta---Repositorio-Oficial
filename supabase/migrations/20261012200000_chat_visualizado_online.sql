-- EiFreela · Chat: "visualizado" (✓✓) e "visto por último".
-- O "online agora" usa o Realtime Presence e não precisa de tabela.

-- 1) Quando cada participante leu a conversa pela última vez.
alter table public.conversas
  add column if not exists lido_contratante_em timestamptz,
  add column if not exists lido_freelancer_em  timestamptz;

-- Marca a conversa como lida por quem chamou (só participantes; não mexe em atualizado_em).
create or replace function public.marcar_conversa_lida(p_conversa uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_agora timestamptz := now();
begin
  if v_uid is null then
    raise exception 'Entre na sua conta.';
  end if;
  update public.conversas
     set lido_contratante_em = case when contratante_id = v_uid then v_agora else lido_contratante_em end,
         lido_freelancer_em  = case when freelancer_id  = v_uid then v_agora else lido_freelancer_em  end
   where id = p_conversa
     and v_uid in (contratante_id, freelancer_id);
  return v_agora;
end
$$;
revoke execute on function public.marcar_conversa_lida(uuid) from public, anon;
grant execute on function public.marcar_conversa_lida(uuid) to authenticated;

-- 2) "Visto por último": horário em que a pessoa usou o app pela última vez.
alter table public.profiles add column if not exists visto_em timestamptz;
grant select (visto_em) on public.profiles to authenticated;

create or replace function public.registrar_visto()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set visto_em = now() where id = auth.uid();
$$;
revoke execute on function public.registrar_visto() from public, anon;
grant execute on function public.registrar_visto() to authenticated;
