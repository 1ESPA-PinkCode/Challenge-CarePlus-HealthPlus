-- =====================================================================
-- Health Plus — esquema do banco (Supabase)
-- Cole tudo no SQL Editor do Supabase e clique em "Run".
-- Pode rodar de novo sem problema: o script é idempotente.
-- =====================================================================

-- ---------- PERFIS (1 por usuário do Auth) ----------
create table if not exists public.perfis (
  id           uuid primary key references auth.users(id) on delete cascade,
  nome         text not null,
  foto_url     text,
  gemas        integer not null default 0 check (gemas >= 0),
  flor_atual   text not null default 'girassol',
  missoes_total integer not null default 0,   -- missões concluídas na vida (define o nível do jardim)
  streak       integer not null default 0,    -- dias seguidos com pelo menos 1 missão concluída
  ultimo_dia   date,                          -- último dia em que concluiu missão
  criado_em    timestamptz not null default now()
);

-- Cria o perfil automaticamente quando alguém se cadastra
create or replace function public.criar_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', 'Usuário'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- ---------- PROGRESSO DIÁRIO DAS MISSÕES ----------
create table if not exists public.missoes_dia (
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  missao_id  text not null,
  dia        date not null default (now() at time zone 'America/Sao_Paulo')::date,
  atual      integer not null default 0,
  concluida  boolean not null default false,
  primary key (usuario_id, missao_id, dia)
);

-- ---------- RESGATES DE RECOMPENSAS ----------
create table if not exists public.resgates (
  id         bigint generated always as identity primary key,
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  titulo     text not null,
  cupom      text not null,
  custo      integer not null,
  criado_em  timestamptz not null default now(),
  unique (usuario_id, titulo)
);

-- ---------- GRUPOS ----------
create table if not exists public.grupos (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  codigo    text not null unique,
  dono_id   uuid not null references public.perfis(id) on delete cascade,
  criado_em timestamptz not null default now()
);

create table if not exists public.grupo_membros (
  grupo_id   uuid not null references public.grupos(id) on delete cascade,
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  entrou_em  timestamptz not null default now(),
  primary key (grupo_id, usuario_id)
);

-- =====================================================================
-- SEGURANÇA (RLS): cada pessoa só mexe nos próprios dados
-- =====================================================================
alter table public.perfis        enable row level security;
alter table public.missoes_dia   enable row level security;
alter table public.resgates      enable row level security;
alter table public.grupos        enable row level security;
alter table public.grupo_membros enable row level security;

-- Função auxiliar: o usuário logado é membro do grupo?
create or replace function public.sou_membro(g uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from grupo_membros where grupo_id = g and usuario_id = auth.uid());
$$;

-- Perfis: ler o próprio e o de quem está nos mesmos grupos; editar só o próprio
drop policy if exists perfis_ler on public.perfis;
create policy perfis_ler on public.perfis for select using (
  id = auth.uid() or exists (
    select 1 from grupo_membros a join grupo_membros b on a.grupo_id = b.grupo_id
    where a.usuario_id = auth.uid() and b.usuario_id = perfis.id
  )
);
drop policy if exists perfis_editar on public.perfis;
create policy perfis_editar on public.perfis for update using (id = auth.uid()) with check (id = auth.uid());

-- Missões: só as próprias
drop policy if exists missoes_proprias on public.missoes_dia;
create policy missoes_proprias on public.missoes_dia for all
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- Resgates: só os próprios (criação via função resgatar)
drop policy if exists resgates_ler on public.resgates;
create policy resgates_ler on public.resgates for select using (usuario_id = auth.uid());

-- Grupos: ver os grupos dos quais faz parte; criar como dono
drop policy if exists grupos_ler on public.grupos;
create policy grupos_ler on public.grupos for select using (public.sou_membro(id));
drop policy if exists grupos_criar on public.grupos;
create policy grupos_criar on public.grupos for insert with check (dono_id = auth.uid());
drop policy if exists grupos_editar on public.grupos;
create policy grupos_editar on public.grupos for update using (dono_id = auth.uid());

-- Membros: ver membros dos meus grupos; sair do grupo
drop policy if exists membros_ler on public.grupo_membros;
create policy membros_ler on public.grupo_membros for select using (public.sou_membro(grupo_id));
drop policy if exists membros_sair on public.grupo_membros;
create policy membros_sair on public.grupo_membros for delete using (usuario_id = auth.uid());

-- =====================================================================
-- FUNÇÕES (regras do jogo ficam no servidor, não dá pra trapacear)
-- =====================================================================

-- Registra progresso numa missão do dia. Ao concluir: soma gemas,
-- conta para o nível do jardim e atualiza o streak.
create or replace function public.registrar_missao(p_missao text, p_passo int, p_meta int, p_gemas int)
returns json language plpgsql security definer set search_path = public as $$
declare
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_atual int;
  v_concluida boolean;
  v_ultimo date;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  if p_passo < 1 or p_passo > 60 or p_meta < 1 or p_meta > 60 or p_gemas < 0 or p_gemas > 50 then
    raise exception 'valores inválidos';
  end if;

  insert into missoes_dia (usuario_id, missao_id, dia, atual)
  values (auth.uid(), p_missao, hoje, 0)
  on conflict do nothing;

  select atual, concluida into v_atual, v_concluida
  from missoes_dia where usuario_id = auth.uid() and missao_id = p_missao and dia = hoje
  for update;

  if v_concluida then
    return json_build_object('atual', v_atual, 'concluiu_agora', false);
  end if;

  v_atual := least(p_meta, v_atual + p_passo);

  update missoes_dia set atual = v_atual, concluida = (v_atual >= p_meta)
  where usuario_id = auth.uid() and missao_id = p_missao and dia = hoje;

  if v_atual >= p_meta then
    select ultimo_dia into v_ultimo from perfis where id = auth.uid();
    update perfis set
      gemas = gemas + p_gemas,
      missoes_total = missoes_total + 1,
      streak = case
                 when ultimo_dia = hoje then streak
                 when ultimo_dia = hoje - 1 then streak + 1
                 else 1 end,
      ultimo_dia = hoje
    where id = auth.uid();
    return json_build_object('atual', v_atual, 'concluiu_agora', true);
  end if;

  return json_build_object('atual', v_atual, 'concluiu_agora', false);
end $$;

-- Resgata uma recompensa: confere saldo, desconta gemas e gera o cupom
create or replace function public.resgatar(p_titulo text, p_custo int)
returns text language plpgsql security definer set search_path = public as $$
declare v_cupom text;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  if p_custo < 1 then raise exception 'custo inválido'; end if;
  if exists (select 1 from resgates where usuario_id = auth.uid() and titulo = p_titulo) then
    raise exception 'recompensa já resgatada';
  end if;
  update perfis set gemas = gemas - p_custo where id = auth.uid() and gemas >= p_custo;
  if not found then raise exception 'gemas insuficientes'; end if;
  v_cupom := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10));
  insert into resgates (usuario_id, titulo, cupom, custo) values (auth.uid(), p_titulo, v_cupom, p_custo);
  return v_cupom;
end $$;

-- Cria um grupo com código de convite e já coloca o criador como membro
create or replace function public.criar_grupo(p_nome text)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_codigo text;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  if length(trim(p_nome)) < 2 then raise exception 'nome do grupo muito curto'; end if;
  loop
    v_codigo := 'PINK-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    exit when not exists (select 1 from grupos where codigo = v_codigo);
  end loop;
  insert into grupos (nome, codigo, dono_id) values (trim(p_nome), v_codigo, auth.uid()) returning id into v_id;
  insert into grupo_membros (grupo_id, usuario_id) values (v_id, auth.uid());
  return json_build_object('id', v_id, 'codigo', v_codigo);
end $$;

-- Entra num grupo pelo código de convite
create or replace function public.entrar_grupo(p_codigo text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  select id into v_id from grupos where codigo = upper(trim(p_codigo));
  if v_id is null then raise exception 'código não encontrado'; end if;
  insert into grupo_membros (grupo_id, usuario_id) values (v_id, auth.uid()) on conflict do nothing;
  return v_id;
end $$;

-- Ranking de um grupo (só para quem é membro)
create or replace function public.ranking_grupo(p_grupo uuid)
returns table (usuario_id uuid, nome text, foto_url text, missoes int, streak int)
language sql security definer stable set search_path = public as $$
  select p.id, p.nome, p.foto_url, p.missoes_total,
         case when p.ultimo_dia >= (now() at time zone 'America/Sao_Paulo')::date - 1 then p.streak else 0 end
  from grupo_membros m join perfis p on p.id = m.usuario_id
  where m.grupo_id = p_grupo and public.sou_membro(p_grupo)
  order by p.missoes_total desc;
$$;

grant execute on function public.registrar_missao, public.resgatar, public.criar_grupo,
  public.entrar_grupo, public.ranking_grupo to authenticated;
