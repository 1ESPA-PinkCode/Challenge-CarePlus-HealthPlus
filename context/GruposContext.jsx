// context/GruposContext.jsx — grupos reais (código de convite + ranking)
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { mensagemErro, supabase } from "../lib/supabase";
import { useUsuario } from "./UsuarioContext";

const GruposContext = createContext(null);

export function GruposProvider({ children }) {
  const { perfil } = useUsuario();
  const userId = perfil?.id;
  const [grupos, setGrupos] = useState([]);
  const [grupoId, setGrupoId] = useState(null);
  const [membros, setMembros] = useState([]);
  const [carregado, setCarregado] = useState(false);

  const grupoAtual = grupos.find((g) => g.id === grupoId) || null;

  const carregarGrupos = useCallback(async () => {
    if (!userId) {
      setGrupos([]);
      setGrupoId(null);
      return;
    }
    const { data } = await supabase.from("grupos").select("id, nome, codigo, dono_id").order("criado_em");
    const lista = data || [];
    setGrupos(lista);
    setGrupoId((atual) => (lista.some((g) => g.id === atual) ? atual : lista[0]?.id ?? null));
    setCarregado(true);
  }, [userId]);

  const carregarRanking = useCallback(async () => {
    if (!grupoId) {
      setMembros([]);
      return;
    }
    const { data } = await supabase.rpc("ranking_grupo", { p_grupo: grupoId });
    setMembros(data || []);
  }, [grupoId]);

  useEffect(() => {
    carregarGrupos();
  }, [carregarGrupos]);

  // atualiza o ranking ao trocar de grupo e a cada 30s enquanto o app está aberto
  useEffect(() => {
    carregarRanking();
    const t = setInterval(carregarRanking, 30000);
    return () => clearInterval(t);
  }, [carregarRanking]);

  async function criarGrupo(nome) {
    try {
      const { data, error } = await supabase.rpc("criar_grupo", { p_nome: nome });
      if (error) throw error;
      await carregarGrupos();
      setGrupoId(data.id);
      return { ok: true, codigo: data.codigo };
    } catch (e) {
      return { ok: false, erro: mensagemErro(e) };
    }
  }

  async function entrarGrupo(codigo) {
    try {
      const { data, error } = await supabase.rpc("entrar_grupo", { p_codigo: codigo });
      if (error) throw error;
      await carregarGrupos();
      setGrupoId(data);
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: mensagemErro(e) };
    }
  }

  async function sairGrupo(id) {
    await supabase.from("grupo_membros").delete().eq("grupo_id", id).eq("usuario_id", userId);
    await carregarGrupos();
  }

  const rankingMissoes = [...membros].sort((a, b) => b.missoes - a.missoes);
  const rankingStreak = [...membros].sort((a, b) => b.streak - a.streak);

  return (
    <GruposContext.Provider
      value={{
        grupos,
        grupoAtual,
        selecionarGrupo: setGrupoId,
        membros,
        rankingMissoes,
        rankingStreak,
        criarGrupo,
        entrarGrupo,
        sairGrupo,
        recarregar: () => Promise.all([carregarGrupos(), carregarRanking()]),
        meuId: userId,
        carregado,
      }}
    >
      {children}
    </GruposContext.Provider>
  );
}

export function useGrupos() {
  const ctx = useContext(GruposContext);
  if (!ctx) throw new Error("useGrupos precisa estar dentro de <GruposProvider>");
  return ctx;
}
