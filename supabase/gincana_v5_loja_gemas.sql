-- =====================================================================
-- Health Plus — v5: gemas viram moeda para comprar doces na banca
-- - perfis.gemas        = saldo (sobe com missões, desce ao comprar doce)
-- - perfis.gemas_ganhas = total já ganho (é o que conta no ranking)
-- Rode no SQL Editor → Ctrl+A → Run. Pode rodar de novo sem problema.
-- =====================================================================

alter table public.perfis add column if not exists gemas_ganhas integer not null default 0;
-- quem já tinha gemas antes desta versão: o total ganho começa igual ao saldo
update public.perfis set gemas_ganhas = gemas where gemas_ganhas < gemas;

-- preço do doce (mude aqui se quiser outro valor)
alter table public.evento add column if not exists preco_doce integer not null default 20;
update public.evento set preco_doce = 20 where id = 1;

-- Concluir missão: soma no saldo e no total ganho (não gera mais cupom)
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
  update perfis
     set gemas = gemas + v_pontos, gemas_ganhas = gemas_ganhas + v_pontos, missoes_total = missoes_total + 1
   where id = p_uid;
  return true;
end $$;
revoke all on function public._concluir(uuid, text) from public, anon, authenticated;

-- Agora a pessoa pode comprar quantos doces as gemas permitirem
alter table public.doces drop constraint if exists doces_usuario_id_missao_id_key;

-- Cupons antigos que ainda não foram entregues deixam de valer
delete from public.doces where not entregue;

-- Ranking do evento: pontos = gemas já ganhas + 1 a cada 100 passos
create or replace function public.ranking_evento(p_limite int default 10)
returns table (posicao bigint, nome text, pontos int, passos int, sou_eu boolean)
language sql security definer stable set search_path = public as $$
  with r as (
    select p.id,
           split_part(trim(p.nome), ' ', 1) ||
             coalesce(' ' || left(nullif(split_part(trim(p.nome), ' ', 2), ''), 1) || '.', '') as nome,
           (p.gemas_ganhas + p.passos / 100) as pontos,
           p.passos,
           row_number() over (order by p.gemas_ganhas + p.passos / 100 desc, p.passos desc, p.criado_em) as posicao
    from perfis p where not p.equipe
  )
  select posicao, nome, pontos, passos, id = auth.uid()
  from r where posicao <= least(p_limite, 100) or id = auth.uid()
  order by posicao;
$$;

drop function if exists public.ranking_grupo(uuid);
create or replace function public.ranking_grupo(p_grupo uuid)
returns table (usuario_id uuid, nome text, foto_url text, missoes int, streak int, pontos int, passos int)
language sql security definer stable set search_path = public as $$
  select p.id, p.nome, p.foto_url, p.missoes_total, p.streak, p.gemas_ganhas + p.passos / 100, p.passos
  from grupo_membros m join perfis p on p.id = m.usuario_id
  where m.grupo_id = p_grupo and public.sou_membro(p_grupo)
  order by p.gemas_ganhas + p.passos / 100 desc;
$$;

-- Equipe: buscar pessoa agora mostra o saldo de gemas
drop function if exists public.equipe_buscar_pessoa(text);
create or replace function public.equipe_buscar_pessoa(p_codigo text)
returns table (nome text, codigo_pessoal text, ativacao boolean, story boolean, gemas int, doces int, preco int)
language plpgsql security definer set search_path = public as $$
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  return query
    select p.nome, p.codigo_pessoal,
      exists (select 1 from progresso g where g.usuario_id = p.id and g.missao_id = 'ativacao' and g.concluida),
      exists (select 1 from progresso g where g.usuario_id = p.id and g.missao_id = 'story' and g.concluida),
      p.gemas,
      (select count(*)::int from doces d where d.usuario_id = p.id),
      (select preco_doce from evento where id = 1)
    from perfis p
    where p.codigo_pessoal = upper(replace(trim(p_codigo), '#', ''));
end $$;

-- Equipe: entregar doce = desconta as gemas da pessoa
create or replace function public.equipe_vender_doce(p_codigo text)
returns int language plpgsql security definer set search_path = public as $$
declare v_uid uuid; v_preco int; v_saldo int;
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  select preco_doce into v_preco from evento where id = 1;
  select id into v_uid from perfis where codigo_pessoal = upper(replace(trim(p_codigo), '#', ''));
  if v_uid is null then raise exception 'pessoa não encontrada'; end if;
  update perfis set gemas = gemas - v_preco where id = v_uid and gemas >= v_preco
  returning gemas into v_saldo;
  if v_saldo is null then raise exception 'gemas insuficientes'; end if;
  insert into doces (usuario_id, missao_id, codigo, entregue, entregue_em)
  values (v_uid, 'compra', _gerar_cupom(), true, now());
  return v_saldo;
end $$;

-- Resumo da equipe
create or replace function public.equipe_resumo()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  return json_build_object(
    'participantes', (select count(*) from perfis where not equipe),
    'missoes',       (select count(*) from progresso where concluida),
    'doces',         (select count(*) from doces where entregue),
    'gemas_saldo',   (select coalesce(sum(gemas), 0) from perfis where not equipe),
    'nota_media',    (select round(avg(nota), 1) from avaliacoes)
  );
end $$;

grant execute on function public.equipe_buscar_pessoa(text), public.equipe_vender_doce(text),
  public.ranking_grupo(uuid) to authenticated;
grant execute on function public.ranking_evento(int) to anon, authenticated;
