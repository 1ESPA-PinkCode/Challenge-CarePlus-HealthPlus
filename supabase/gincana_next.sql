-- =====================================================================
-- Health Plus — GINCANA NEXT FIAP (24/10, 16:30–18:00)
-- Rode DEPOIS do schema.sql. Cole tudo no SQL Editor → Ctrl+A → Run.
-- Pode rodar de novo sem problema.
-- =====================================================================

-- ---------- Novos campos no perfil ----------
alter table public.perfis add column if not exists passos    integer not null default 0;
alter table public.perfis add column if not exists passos_em timestamptz;
alter table public.perfis add column if not exists equipe    boolean not null default false;

-- ---------- Configuração do evento ----------
create table if not exists public.evento (
  id     int primary key default 1 check (id = 1),
  inicio timestamptz not null,
  fim    timestamptz not null
);
insert into public.evento (id, inicio, fim)
values (1, '2026-10-24 16:30:00-03', '2026-10-24 18:00:00-03')
on conflict (id) do nothing;

-- ---------- Catálogo de missões (pontos e regras ficam no servidor) ----------
-- tipo: livre = a pessoa marca | codigo = precisa de código | auto = concluída pelo app | servidor = só o banco conclui
create table if not exists public.missoes (
  id     text primary key,
  pontos int  not null,
  meta   int  not null default 1,
  tipo   text not null check (tipo in ('livre', 'codigo', 'auto', 'servidor')),
  codigo text
);
insert into public.missoes (id, pontos, meta, tipo, codigo) values
  ('qr_renmap',   30, 1, 'codigo',   'RENMAP-VC7RQL'),
  ('ativacao',    30, 1, 'codigo',   'BLOOM'),
  ('story',       40, 1, 'codigo',   'FLOR'),
  ('agua',        15, 4, 'livre',    null),
  ('respira',     15, 1, 'auto',     null),
  ('alongamento', 15, 1, 'auto',     null),
  ('quiz',        20, 1, 'auto',     null),
  ('flor',        10, 1, 'auto',     null),
  ('amigo',       25, 1, 'servidor', null),
  ('grupo3',      20, 1, 'servidor', null),
  ('avaliar',     10, 1, 'servidor', null)
on conflict (id) do update set pontos = excluded.pontos, meta = excluded.meta, tipo = excluded.tipo;

-- ---------- Progresso de cada pessoa ----------
create table if not exists public.progresso (
  usuario_id   uuid not null references public.perfis(id) on delete cascade,
  missao_id    text not null references public.missoes(id),
  atual        int  not null default 0,
  concluida    boolean not null default false,
  concluida_em timestamptz,
  primary key (usuario_id, missao_id)
);

-- ---------- Doces (1 cupom por missão concluída) ----------
create table if not exists public.doces (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null references public.perfis(id) on delete cascade,
  missao_id   text not null,
  codigo      text not null unique,
  entregue    boolean not null default false,
  entregue_em timestamptz,
  criado_em   timestamptz not null default now(),
  unique (usuario_id, missao_id)
);

-- ---------- Avaliações do app ----------
create table if not exists public.avaliacoes (
  usuario_id uuid primary key references public.perfis(id) on delete cascade,
  nota       int not null check (nota between 1 and 5),
  comentario text,
  criado_em  timestamptz not null default now()
);

alter table public.evento     enable row level security;
alter table public.missoes    enable row level security;
alter table public.progresso  enable row level security;
alter table public.doces      enable row level security;
alter table public.avaliacoes enable row level security;

drop policy if exists evento_ler on public.evento;
create policy evento_ler on public.evento for select using (true);
-- missoes: ninguém lê direto (protege os códigos); o app usa as funções abaixo
drop policy if exists progresso_ler on public.progresso;
create policy progresso_ler on public.progresso for select using (usuario_id = auth.uid());
drop policy if exists doces_ler on public.doces;
create policy doces_ler on public.doces for select using (usuario_id = auth.uid());
drop policy if exists avaliacoes_ler on public.avaliacoes;
create policy avaliacoes_ler on public.avaliacoes for select using (usuario_id = auth.uid());

-- A versão antiga aceitava pontos vindos do app; removida para evitar trapaça
drop function if exists public.registrar_missao(text, int, int, int);

-- =====================================================================
-- Regras internas
-- =====================================================================
create or replace function public._checar_evento()
returns void language plpgsql stable set search_path = public as $$
begin
  if now() > (select fim from evento where id = 1) then
    raise exception 'evento encerrado';
  end if;
end $$;

-- Conclui uma missão para um usuário: soma pontos e gera o cupom do doce
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
  values (p_uid, p_missao, upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)))
  on conflict do nothing;
  return true;
end $$;
revoke all on function public._concluir(uuid, text) from public, anon, authenticated;

-- =====================================================================
-- Funções usadas pelo app
-- =====================================================================

-- Missões em que a pessoa marca o progresso (ex.: copos de água)
create or replace function public.registrar_missao(p_missao text, p_passo int default 1)
returns json language plpgsql security definer set search_path = public as $$
declare v_meta int; v_tipo text; v_atual int;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  perform _checar_evento();
  select meta, tipo into v_meta, v_tipo from missoes where id = p_missao;
  if v_tipo is distinct from 'livre' then raise exception 'missão não pode ser marcada assim'; end if;
  insert into progresso (usuario_id, missao_id) values (auth.uid(), p_missao) on conflict do nothing;
  update progresso set atual = least(v_meta, atual + greatest(1, least(p_passo, v_meta)))
  where usuario_id = auth.uid() and missao_id = p_missao and not concluida
  returning atual into v_atual;
  if v_atual is null then
    return json_build_object('atual', v_meta, 'concluiu_agora', false);
  end if;
  if v_atual >= v_meta then
    return json_build_object('atual', v_atual, 'concluiu_agora', _concluir(auth.uid(), p_missao));
  end if;
  return json_build_object('atual', v_atual, 'concluiu_agora', false);
end $$;

-- Missões concluídas pelo próprio app (respiração, alongamento, quiz, flor)
create or replace function public.concluir_auto(p_missao text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  perform _checar_evento();
  if (select tipo from missoes where id = p_missao) is distinct from 'auto' then
    raise exception 'missão não pode ser concluída assim';
  end if;
  return _concluir(auth.uid(), p_missao);
end $$;

-- Missões com código (QR do RENMAP, ativação, story)
create or replace function public.validar_codigo(p_missao text, p_codigo text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_codigo text; v_tipo text;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  perform _checar_evento();
  select codigo, tipo into v_codigo, v_tipo from missoes where id = p_missao;
  if v_tipo is distinct from 'codigo' then raise exception 'missão sem código'; end if;
  if v_codigo is null or upper(trim(p_codigo)) <> upper(v_codigo) then
    raise exception 'código incorreto';
  end if;
  return _concluir(auth.uid(), p_missao);
end $$;

-- Avaliação do app
create or replace function public.avaliar(p_nota int, p_comentario text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  insert into avaliacoes (usuario_id, nota, comentario) values (auth.uid(), p_nota, left(p_comentario, 500))
  on conflict (usuario_id) do update set nota = excluded.nota, comentario = excluded.comentario, criado_em = now();
  if now() <= (select fim from evento where id = 1) then
    return _concluir(auth.uid(), 'avaliar');
  end if;
  return false;
end $$;

-- Passos: aceita no máximo ~3,5 passos por segundo desde o último envio
create or replace function public.registrar_passos(p_passos int)
returns int language plpgsql security definer set search_path = public as $$
declare v_ultimo timestamptz; v_max int; v_ok int; v_total int;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  perform _checar_evento();
  select passos_em into v_ultimo from perfis where id = auth.uid() for update;
  v_max := case when v_ultimo is null then 60
                else least(600, ceil(extract(epoch from now() - v_ultimo) * 3.5)::int) end;
  v_ok := greatest(0, least(p_passos, v_max));
  update perfis set passos = passos + v_ok, passos_em = now() where id = auth.uid()
  returning passos into v_total;
  return v_total;
end $$;

-- Entrar num grupo: dá pontos a quem convidou e confere o "grupo de 3"
create or replace function public.entrar_grupo(p_codigo text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_dono uuid; v_novo int; m record;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  select id, dono_id into v_id, v_dono from grupos where codigo = upper(trim(p_codigo));
  if v_id is null then raise exception 'código não encontrado'; end if;
  insert into grupo_membros (grupo_id, usuario_id) values (v_id, auth.uid()) on conflict do nothing;
  get diagnostics v_novo = row_count;
  if v_novo > 0 and now() <= (select fim from evento where id = 1) then
    if v_dono <> auth.uid() then perform _concluir(v_dono, 'amigo'); end if;
    if (select count(*) from grupo_membros where grupo_id = v_id) >= 3 then
      for m in select usuario_id from grupo_membros where grupo_id = v_id loop
        perform _concluir(m.usuario_id, 'grupo3');
      end loop;
    end if;
  end if;
  return v_id;
end $$;

-- Missões e progresso da pessoa logada (sem expor os códigos)
create or replace function public.minhas_missoes()
returns table (id text, pontos int, meta int, tipo text, atual int, concluida boolean)
language sql security definer stable set search_path = public as $$
  select m.id, m.pontos, m.meta, m.tipo, coalesce(p.atual, 0), coalesce(p.concluida, false)
  from missoes m left join progresso p on p.missao_id = m.id and p.usuario_id = auth.uid();
$$;

-- Ranking do evento (público: aparece no telão). Mostra só primeiro nome + inicial.
create or replace function public.ranking_evento(p_limite int default 10)
returns table (posicao bigint, nome text, pontos int, passos int, sou_eu boolean)
language sql security definer stable set search_path = public as $$
  with r as (
    select p.id,
           split_part(trim(p.nome), ' ', 1) ||
             coalesce(' ' || left(nullif(split_part(trim(p.nome), ' ', 2), ''), 1) || '.', '') as nome,
           (p.gemas + p.passos / 100) as pontos,
           p.passos,
           row_number() over (order by p.gemas + p.passos / 100 desc, p.passos desc, p.criado_em) as posicao
    from perfis p where not p.equipe
  )
  select posicao, nome, pontos, passos, id = auth.uid()
  from r where posicao <= least(p_limite, 100) or id = auth.uid()
  order by posicao;
$$;

-- Ranking dos grupos agora usa pontos
drop function if exists public.ranking_grupo(uuid);
create or replace function public.ranking_grupo(p_grupo uuid)
returns table (usuario_id uuid, nome text, foto_url text, missoes int, streak int, pontos int, passos int)
language sql security definer stable set search_path = public as $$
  select p.id, p.nome, p.foto_url, p.missoes_total, p.streak, p.gemas + p.passos / 100, p.passos
  from grupo_membros m join perfis p on p.id = m.usuario_id
  where m.grupo_id = p_grupo and public.sou_membro(p_grupo)
  order by p.gemas + p.passos / 100 desc;
$$;

-- =====================================================================
-- Funções da EQUIPE (só para perfis marcados com equipe = true)
-- =====================================================================
create or replace function public._sou_equipe()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select equipe from perfis where id = auth.uid()), false);
$$;

create or replace function public.equipe_codigos()
returns table (id text, codigo text) language plpgsql security definer set search_path = public as $$
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  return query select m.id, m.codigo from missoes m where m.tipo = 'codigo' order by m.id;
end $$;

create or replace function public.equipe_trocar_codigo(p_missao text, p_codigo text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  if p_missao = 'qr_renmap' then raise exception 'o código do QR impresso não pode mudar'; end if;
  if length(trim(p_codigo)) < 3 then raise exception 'código muito curto'; end if;
  update missoes set codigo = upper(trim(p_codigo)) where id = p_missao and tipo = 'codigo';
end $$;

create or replace function public.equipe_buscar_doce(p_codigo text)
returns table (codigo text, nome text, missao_id text, entregue boolean)
language plpgsql security definer set search_path = public as $$
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  return query
    select d.codigo, p.nome, d.missao_id, d.entregue
    from doces d join perfis p on p.id = d.usuario_id
    where d.codigo = upper(trim(p_codigo));
end $$;

create or replace function public.equipe_entregar_doce(p_codigo text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  update doces set entregue = true, entregue_em = now()
  where codigo = upper(trim(p_codigo)) and not entregue;
  return found;
end $$;

create or replace function public.equipe_resumo()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  return json_build_object(
    'participantes', (select count(*) from perfis where not equipe),
    'missoes',       (select count(*) from progresso where concluida),
    'doces',         (select count(*) from doces where entregue),
    'doces_pend',    (select count(*) from doces where not entregue),
    'nota_media',    (select round(avg(nota), 1) from avaliacoes)
  );
end $$;

grant execute on function public.registrar_missao(text, int), public.concluir_auto(text),
  public.validar_codigo(text, text), public.avaliar(int, text), public.registrar_passos(int),
  public.entrar_grupo(text), public.minhas_missoes(), public.ranking_grupo(uuid),
  public.equipe_codigos(), public.equipe_trocar_codigo(text, text), public.equipe_buscar_doce(text),
  public.equipe_entregar_doce(text), public.equipe_resumo()
  to authenticated;
grant execute on function public.ranking_evento(int) to anon, authenticated;
grant select on public.evento to anon, authenticated;
