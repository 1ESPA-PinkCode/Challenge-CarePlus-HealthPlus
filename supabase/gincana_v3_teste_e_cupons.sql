-- =====================================================================
-- Health Plus — v3: gincana aberta para teste + cupons de 4 letras
-- Rode no SQL Editor → Ctrl+A → Run. Pode rodar de novo sem problema.
-- =====================================================================

-- 1) Abre a gincana AGORA para o teste com a equipe (termina 24/10 às 18:00)
--    No dia do evento, rode o script de zerar que volta o início para 15:00.
update public.evento set inicio = now(), fim = '2026-10-24 18:00:00-03' where id = 1;

-- 2) Cupons curtos: 4 caracteres, sem letras/números que confundem (O/0, I/1)
create or replace function public._gerar_cupom()
returns text language plpgsql set search_path = public as $$
declare
  letras text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v text;
begin
  loop
    v := '';
    for i in 1..4 loop
      v := v || substr(letras, 1 + floor(random() * length(letras))::int, 1);
    end loop;
    exit when not exists (select 1 from doces where codigo = v);
  end loop;
  return v;
end $$;

create or replace function public._concluir(p_uid uuid, p_missao text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_pontos int; v_meta int;
begin
  select pontos, meta into v_pontos, v_meta from missoes where id = p_missao;
  if v_pontos is null then raise exception 'missão inexistente'; end if;
  if exists (select 1 from progresso where usuario_id = p_uid and missao_id = p_missao and concluida) then
    return false;
  end if;
  insert into progresso (usuario_id, missao_id, atual, concluida, concluida_em)
  values (p_uid, p_missao, v_meta, true, now())
  on conflict (usuario_id, missao_id) do update set atual = v_meta, concluida = true, concluida_em = now();
  update perfis set gemas = gemas + v_pontos, missoes_total = missoes_total + 1 where id = p_uid;
  insert into doces (usuario_id, missao_id, codigo)
  values (p_uid, p_missao, _gerar_cupom())
  on conflict do nothing;
  return true;
end $$;
revoke all on function public._concluir(uuid, text) from public, anon, authenticated;

-- 3) Cupons já gerados e ainda não entregues também ficam curtos
update public.doces set codigo = public._gerar_cupom() where not entregue and length(codigo) > 4;
