-- =====================================================================
-- Health Plus — ZERAR TUDO PARA O EVENTO (24/10, 15:00–18:00)
--
-- O que faz:
--   • APAGA todas as contas de participantes (as de teste). Não tem volta.
--   • MANTÉM as contas da equipe (equipe = true), mas zera gemas, passos,
--     missões, grupos e bombons delas.
--   • Apaga grupos, bombons entregues, avaliações e progresso das missões.
--   • Volta o horário da gincana para 24/10 das 15:00 às 18:00.
--
-- Rode no SQL Editor → Ctrl+A → Run. Ou tudo funciona, ou nada muda.
-- =====================================================================
begin;

-- 1) apaga as contas de participantes (o resto dos dados delas sai junto)
delete from auth.users u
where not exists (select 1 from public.perfis p where p.id = u.id and p.equipe);

-- 2) limpa o que sobrou de dados de jogo
delete from public.grupo_membros;
delete from public.grupos;
delete from public.doces;
delete from public.avaliacoes;
delete from public.progresso;
delete from public.missoes_dia;
delete from public.resgates;

-- 3) zera as contas da equipe
update public.perfis
   set gemas = 0, gemas_ganhas = 0, passos = 0, passos_em = null,
       missoes_total = 0, streak = 0, ultimo_dia = null, flor_atual = 'girassol';

-- 4) horário oficial da gincana
update public.evento
   set inicio = '2026-10-24 15:00:00-03', fim = '2026-10-24 18:00:00-03'
 where id = 1;

commit;

-- conferência: deve mostrar 0 participantes e só as contas da equipe
select
  (select count(*) from auth.users)                                as contas_restantes,
  (select string_agg(nome, ', ') from public.perfis where equipe)   as equipe_mantida,
  (select count(*) from public.perfis where not equipe)            as participantes,
  (select count(*) from public.grupos)                             as grupos,
  (select inicio || ' até ' || fim from public.evento where id = 1) as horario;
