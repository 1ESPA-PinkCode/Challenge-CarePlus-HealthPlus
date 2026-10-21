-- =====================================================================
-- Health Plus — v6: "conserta tudo" + bombom a 115 gemas
-- Junta tudo o que as versões 3, 4 e 5 faziam. Se algum script anterior
-- não foi rodado, este resolve. Pode rodar quantas vezes quiser.
-- Rode no SQL Editor → Ctrl+A → Run.
-- =====================================================================

-- ---------- colunas ----------
alter table public.perfis add column if not exists codigo_pessoal text unique;
alter table public.perfis add column if not exists gemas_ganhas integer not null default 0;
alter table public.evento add column if not exists preco_doce integer not null default 115;

-- ---------- preço do bombom ----------
update public.evento set preco_doce = 115 where id = 1;

-- ---------- QR do medGrip ----------
update public.missoes set codigo = 'MEDGRIP-VC7RQL' where id = 'qr_renmap';

-- ---------- código pessoal (ex.: K7P2) ----------
create or replace function public._gerar_codigo_pessoal()
returns text language plpgsql set search_path = public as $$
declare letras text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; v text;
begin
  loop
    v := '';
    for i in 1..4 loop v := v || substr(letras, 1 + floor(random() * length(letras))::int, 1); end loop;
    exit when not exists (select 1 from perfis where codigo_pessoal = v);
  end loop;
  return v;
end $$;

create or replace function public._perfil_codigo()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.codigo_pessoal is null then new.codigo_pessoal := _gerar_codigo_pessoal(); end if;
  return new;
end $$;
drop trigger if exists perfil_codigo on public.perfis;
create trigger perfil_codigo before insert on public.perfis for each row execute function public._perfil_codigo();
update public.perfis set codigo_pessoal = public._gerar_codigo_pessoal() where codigo_pessoal is null;

-- ---------- registro dos bombons entregues ----------
create or replace function public._gerar_cupom()
returns text language plpgsql set search_path = public as $$
declare letras text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; v text;
begin
  loop
    v := '';
    for i in 1..4 loop v := v || substr(letras, 1 + floor(random() * length(letras))::int, 1); end loop;
    exit when not exists (select 1 from doces where codigo = v);
  end loop;
  return v;
end $$;
alter table public.doces drop constraint if exists doces_usuario_id_missao_id_key;
delete from public.doces where not entregue;

-- ---------- total ganho (conta no ranking) ----------
update public.perfis set gemas_ganhas = gemas where gemas_ganhas < gemas;

-- ---------- concluir missão ----------
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

-- ---------- validar código (QR do medGrip) ----------
create or replace function public.validar_codigo(p_missao text, p_codigo text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_codigo text; v_tipo text; v_digitado text;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  perform _checar_evento();
  select codigo, tipo into v_codigo, v_tipo from missoes where id = p_missao;
  if v_tipo is distinct from 'codigo' then raise exception 'missão sem código'; end if;
  -- aceita com ou sem traço/espaço e em minúsculas (ex.: "medgrip vc7rql")
  v_digitado := upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'));
  if v_codigo is null or v_digitado <> upper(regexp_replace(v_codigo, '[^A-Za-z0-9]', '', 'g')) then
    raise exception 'código incorreto';
  end if;
  return _concluir(auth.uid(), p_missao);
end $$;

-- ---------- rankings ----------
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

-- ---------- equipe ----------
create or replace function public._sou_equipe()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select equipe from perfis where id = auth.uid()), false);
$$;

-- limpa o código digitado: tira #, espaços e deixa maiúsculo
create or replace function public._limpar_codigo(p text)
returns text language sql immutable as $$
  select upper(regexp_replace(coalesce(p, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

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
      (select count(*)::int from doces d where d.usuario_id = p.id and d.entregue),
      (select preco_doce from evento where id = 1)
    from perfis p
    where p.codigo_pessoal = _limpar_codigo(p_codigo);
end $$;

create or replace function public.equipe_dar_missao(p_codigo text, p_missao text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uid uuid;
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  perform _checar_evento();
  if (select tipo from missoes where id = p_missao) is distinct from 'equipe' then
    raise exception 'missão não pode ser dada pela equipe';
  end if;
  select id into v_uid from perfis where codigo_pessoal = _limpar_codigo(p_codigo);
  if v_uid is null then raise exception 'pessoa não encontrada'; end if;
  return _concluir(v_uid, p_missao);
end $$;

create or replace function public.equipe_vender_doce(p_codigo text)
returns int language plpgsql security definer set search_path = public as $$
declare v_uid uuid; v_preco int; v_saldo int;
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  select preco_doce into v_preco from evento where id = 1;
  select id into v_uid from perfis where codigo_pessoal = _limpar_codigo(p_codigo);
  if v_uid is null then raise exception 'pessoa não encontrada'; end if;
  update perfis set gemas = gemas - v_preco where id = v_uid and gemas >= v_preco
  returning gemas into v_saldo;
  if v_saldo is null then raise exception 'gemas insuficientes'; end if;
  insert into doces (usuario_id, missao_id, codigo, entregue, entregue_em)
  values (v_uid, 'compra', _gerar_cupom(), true, now());
  return v_saldo;
end $$;

create or replace function public.equipe_codigos()
returns table (id text, codigo text) language plpgsql security definer set search_path = public as $$
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  return query select m.id, m.codigo from missoes m where m.tipo = 'codigo' order by m.id;
end $$;

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

grant execute on function public.validar_codigo(text, text), public.ranking_grupo(uuid),
  public.equipe_buscar_pessoa(text), public.equipe_dar_missao(text, text), public.equipe_vender_doce(text),
  public.equipe_codigos(), public.equipe_resumo() to authenticated;
grant execute on function public.ranking_evento(int) to anon, authenticated;

-- ---------- conferência: deve mostrar tudo "ok" ----------
select
  (select codigo from missoes where id = 'qr_renmap')                                  as codigo_qr,
  (select preco_doce from evento where id = 1)                                         as preco_bombom,
  (select count(*) from perfis where codigo_pessoal is null)                           as pessoas_sem_codigo,
  (select count(*) from perfis where equipe)                                           as contas_equipe;
