-- =====================================================================
-- Health Plus — Gincana NEXT v2: missões confirmadas pela equipe
-- Ativação e story deixam de ter código compartilhado. Cada pessoa tem um
-- código pessoal; a equipe digita no painel e dá a missão.
-- Rode DEPOIS do gincana_next.sql. Pode rodar de novo sem problema.
-- =====================================================================

-- ---------- Código pessoal (ex.: K7P2) ----------
alter table public.perfis add column if not exists codigo_pessoal text unique;

create or replace function public._gerar_codigo_pessoal()
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
create trigger perfil_codigo before insert on public.perfis
  for each row execute function public._perfil_codigo();

-- quem já tem conta também ganha código
update public.perfis set codigo_pessoal = public._gerar_codigo_pessoal() where codigo_pessoal is null;

-- ---------- Ativação e story passam a ser confirmadas pela equipe ----------
alter table public.missoes drop constraint if exists missoes_tipo_check;
alter table public.missoes add constraint missoes_tipo_check
  check (tipo in ('livre', 'codigo', 'auto', 'servidor', 'equipe'));
update public.missoes set tipo = 'equipe', codigo = null where id in ('ativacao', 'story');

-- ---------- Funções da equipe ----------
-- Busca a pessoa pelo código pessoal e mostra o que a equipe pode dar
create or replace function public.equipe_buscar_pessoa(p_codigo text)
returns table (nome text, codigo_pessoal text, ativacao boolean, story boolean)
language plpgsql security definer set search_path = public as $$
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  return query
    select p.nome, p.codigo_pessoal,
      exists (select 1 from progresso g where g.usuario_id = p.id and g.missao_id = 'ativacao' and g.concluida),
      exists (select 1 from progresso g where g.usuario_id = p.id and g.missao_id = 'story' and g.concluida)
    from perfis p
    where p.codigo_pessoal = upper(replace(trim(p_codigo), '#', ''));
end $$;

-- Dá a missão (ativação ou story) para a pessoa
create or replace function public.equipe_dar_missao(p_codigo text, p_missao text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uid uuid;
begin
  if not _sou_equipe() then raise exception 'acesso só da equipe'; end if;
  perform _checar_evento();
  if (select tipo from missoes where id = p_missao) is distinct from 'equipe' then
    raise exception 'missão não pode ser dada pela equipe';
  end if;
  select id into v_uid from perfis where codigo_pessoal = upper(replace(trim(p_codigo), '#', ''));
  if v_uid is null then raise exception 'pessoa não encontrada'; end if;
  return _concluir(v_uid, p_missao);
end $$;

-- A tela de códigos agora só mostra o QR do RENMAP
create or replace function public.equipe_trocar_codigo(p_missao text, p_codigo text)
returns void language plpgsql security definer set search_path = public as $$
begin
  raise exception 'o código do QR impresso não pode mudar';
end $$;

grant execute on function public.equipe_buscar_pessoa(text), public.equipe_dar_missao(text, text) to authenticated;
