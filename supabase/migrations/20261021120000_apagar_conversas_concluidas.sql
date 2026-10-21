-- EiFreela · Conversas (mensagens e áudios) apagadas depois da diária
-- Quando a vaga é concluída e as duas partes avaliam, a conversa é apagada.
-- Se alguém não avaliar, apaga 7 dias após a conclusão. Com denúncia aberta, espera a análise.
-- Quem apaga os áudios é a Edge Function "limpar-conversas" (o banco não apaga arquivos).

-- 1) Lista do que pode ser apagado (só a função/serviço usa).
create or replace function public.conversas_para_apagar()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select c.id
  from public.conversas c
  join public.vagas v on v.id = c.vaga_id
  where v.status = 'Concluída'
    and (
      (select count(distinct a.avaliador_id) from public.avaliacoes a where a.vaga_id = v.id) >= 2
      or coalesce(v.check_out_em, c.atualizado_em) < now() - interval '7 days'
    )
    and not exists (
      select 1 from public.denuncias d
      where d.situacao = 'aberta' and (d.vaga_id = v.id or d.conversa_id = c.id)
    );
$$;
revoke execute on function public.conversas_para_apagar() from public, anon, authenticated;

-- 2) Chama a limpeza (Edge Function) usando o segredo guardado no Vault.
create or replace function public.chamar_limpeza_conversas()
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_segredo text;
begin
  select decrypted_secret into v_segredo from vault.decrypted_secrets where name = 'notificar_vaga_segredo' limit 1;
  if v_segredo is null then
    return;
  end if;
  perform net.http_post(
    url     := 'https://yrnxekmviprbhlviuwvt.supabase.co/functions/v1/limpar-conversas',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-eifreela-segredo', v_segredo),
    body    := '{}'::jsonb
  );
exception when others then
  raise warning 'chamar_limpeza_conversas: %', sqlerrm;
end $$;
revoke execute on function public.chamar_limpeza_conversas() from public, anon, authenticated;

-- 3) Logo depois da 2ª avaliação de uma vaga, dispara a limpeza.
create or replace function public.limpar_apos_avaliacao()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select count(distinct a.avaliador_id) from public.avaliacoes a where a.vaga_id = new.vaga_id) >= 2 then
    perform public.chamar_limpeza_conversas();
  end if;
  return new;
end $$;
revoke execute on function public.limpar_apos_avaliacao() from public, anon, authenticated;

drop trigger if exists limpar_apos_avaliacao on public.avaliacoes;
create trigger limpar_apos_avaliacao
  after insert on public.avaliacoes
  for each row execute function public.limpar_apos_avaliacao();

-- 4) Faxina diária (casos de 7 dias e áudios órfãos), às 3h de Brasília.
create extension if not exists pg_cron;
select cron.unschedule('eifreela-limpar-conversas')
  where exists (select 1 from cron.job where jobname = 'eifreela-limpar-conversas');
select cron.schedule('eifreela-limpar-conversas', '0 6 * * *', $$select public.chamar_limpeza_conversas()$$);
