-- =====================================================================
-- Health Plus — DIAGNÓSTICO (não altera nada: desfaz tudo no final)
-- Rode no SQL Editor → Ctrl+A → Run.
-- O resultado aparece como uma mensagem de "erro" vermelha: é proposital,
-- é o jeito de desfazer o teste. Mande um print dessa mensagem.
-- =====================================================================
notify pgrst, 'reload schema'; -- atualiza a lista de funções que o app enxerga

do $$
declare
  rel text := E'\n';
  v_equipe uuid; v_equipe_nome text;
  v_pessoa uuid; v_pessoa_nome text; v_cod text; v_gemas int;
  r record; v int; b boolean;
begin
  select id, nome into v_equipe, v_equipe_nome from perfis where equipe limit 1;
  rel := rel || '1) conta equipe: ' || coalesce(v_equipe_nome, 'NENHUMA') || E'\n';

  select id, nome, codigo_pessoal, gemas into v_pessoa, v_pessoa_nome, v_cod, v_gemas
  from perfis where not equipe order by gemas desc limit 1;
  rel := rel || '2) pessoa de teste: ' || coalesce(v_pessoa_nome, 'NENHUMA') || ' | código ' || coalesce(v_cod, 'SEM CÓDIGO')
         || ' | gemas ' || coalesce(v_gemas::text, '?') || ' | preço ' || (select preco_doce from evento where id = 1) || E'\n';

  -- como equipe
  perform set_config('request.jwt.claims', json_build_object('sub', v_equipe, 'role', 'authenticated')::text, true);
  begin
    select * into r from equipe_buscar_pessoa('#' || lower(v_cod));
    rel := rel || '3) buscar pessoa: ' || coalesce(r.nome || ' com ' || r.gemas || ' gemas', 'NÃO ENCONTROU') || E'\n';
  exception when others then rel := rel || '3) buscar pessoa: ERRO ' || sqlerrm || E'\n'; end;

  begin
    v := equipe_vender_doce(v_cod);
    rel := rel || '4) entregar bombom: ok, saldo ficaria ' || v || E'\n';
  exception when others then rel := rel || '4) entregar bombom: ' || sqlerrm || E'\n'; end;

  -- como a pessoa
  perform set_config('request.jwt.claims', json_build_object('sub', v_pessoa, 'role', 'authenticated')::text, true);
  begin
    b := validar_codigo('qr_renmap', 'MEDGRIP-VC7RQL');
    rel := rel || '5) validar QR: ' || case when b then 'ok, missão concluída' else 'ok (já estava concluída)' end || E'\n';
  exception when others then rel := rel || '5) validar QR: ERRO ' || sqlerrm || E'\n'; end;

  rel := rel || '6) evento: ' || (select inicio || ' até ' || fim from evento where id = 1) || ' | agora ' || now();

  raise exception 'RESULTADO DO DIAGNÓSTICO (nada foi alterado):%', rel;
end $$;
