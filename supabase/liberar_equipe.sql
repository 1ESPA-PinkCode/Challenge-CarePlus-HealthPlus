-- =====================================================================
-- Health Plus — LIBERAR CONTAS DA EQUIPE
-- Rode DEPOIS que cada pessoa da equipe (e o tablet da banca) criar a conta no app.
-- Troque os nomes abaixo pelos nomes EXATOS usados no cadastro.
-- Contas da equipe abrem o painel e não aparecem no ranking.
-- =====================================================================
update public.perfis
   set equipe = true
 where nome in (
   'Lara Mofid Essa Alssabak',
   'Banca Health Plus',
   'Nome Completo Da Pessoa 2',
   'Nome Completo Da Pessoa 3'
 );

-- conferência: lista quem está como equipe
select nome, codigo_pessoal from public.perfis where equipe order by nome;
