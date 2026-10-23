-- =====================================================================
-- Health Plus — ZERAR TUDO PARA O EVENTO (24/10, 12:00–17:45)
--
-- O que faz:
--   • APAGA TODAS as contas, inclusive as da equipe. Não tem volta.
--   • Apaga grupos, bombons, avaliações e progresso das missões.
--   • Coloca o horário da gincana em 24/10, das 12:00 às 17:45.
--
-- Depois de rodar, todo mundo (inclusive a equipe) cria a conta de novo no app,
-- e a equipe é liberada com o script "liberar_equipe.sql".
--
-- Rode no SQL Editor → Ctrl+A → Run. Ou tudo funciona, ou nada muda.
-- =====================================================================
begin;

-- 1) apaga todas as contas (perfis, missões, grupos e bombons saem junto)
delete from auth.users;

-- 2) garante que não sobrou nada
delete from public.grupo_membros;
delete from public.grupos;
delete from public.doces;
delete from public.avaliacoes;
delete from public.progresso;
delete from public.missoes_dia;
delete from public.resgates;
delete from public.perfis;

-- 3) horário oficial da gincana
update public.evento
   set inicio = '2026-10-24 12:00:00-03', fim = '2026-10-24 17:45:00-03'
 where id = 1;

commit;

-- conferência: tudo deve estar em 0 e o horário certo
select
  (select count(*) from auth.users)                                 as contas,
  (select count(*) from public.perfis)                              as perfis,
  (select count(*) from public.grupos)                              as grupos,
  (select inicio || ' até ' || fim from public.evento where id = 1) as horario;
