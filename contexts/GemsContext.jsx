// contexts/GemsContext.jsx — saldo de gemas e resgates, vindos do banco
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUsuario } from "../context/UsuarioContext";
import { supabase } from "../lib/supabase";

const GemsContext = createContext(null);

export function GemsProvider({ children }) {
  const { perfil, recarregarPerfil } = useUsuario();
  const [redeemedRewards, setRedeemedRewards] = useState({});
  const userId = perfil?.id;

  const carregarResgates = useCallback(async () => {
    if (!userId) {
      setRedeemedRewards({});
      return;
    }
    const { data } = await supabase.from("resgates").select("titulo, cupom").eq("usuario_id", userId);
    setRedeemedRewards(Object.fromEntries((data || []).map((r) => [r.titulo, r.cupom])));
  }, [userId]);

  useEffect(() => {
    carregarResgates();
  }, [carregarResgates]);

  // As gemas são somadas pelo banco ao concluir missões; aqui só atualizamos o saldo.
  function addGemas() {
    recarregarPerfil();
  }

  // Resgata no banco (confere saldo e gera o cupom). Retorna o cupom.
  async function resgatar(titulo, custo) {
    const { data, error } = await supabase.rpc("resgatar", { p_titulo: titulo, p_custo: custo });
    if (error) throw error;
    setRedeemedRewards((atual) => ({ ...atual, [titulo]: data }));
    recarregarPerfil();
    return data;
  }

  return (
    <GemsContext.Provider value={{ gemas: perfil?.gemas ?? 0, addGemas, resgatar, redeemedRewards }}>
      {children}
    </GemsContext.Provider>
  );
}

export function useGemas() {
  return useContext(GemsContext);
}
