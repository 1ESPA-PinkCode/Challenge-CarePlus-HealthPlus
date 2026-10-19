// contexts/GemsContext.jsx — pontos (gemas) e cupons de doce, vindos do banco
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUsuario } from "../context/UsuarioContext";
import { supabase } from "../lib/supabase";

const GemsContext = createContext(null);

export function GemsProvider({ children }) {
  const { perfil, recarregarPerfil } = useUsuario();
  const [doces, setDoces] = useState([]);
  const userId = perfil?.id;

  const carregarDoces = useCallback(async () => {
    if (!userId) {
      setDoces([]);
      return;
    }
    const { data } = await supabase
      .from("doces")
      .select("missao_id, codigo, entregue, criado_em")
      .eq("usuario_id", userId)
      .order("criado_em", { ascending: false });
    setDoces(data || []);
  }, [userId]);

  useEffect(() => {
    carregarDoces();
  }, [carregarDoces]);

  return (
    <GemsContext.Provider
      value={{
        gemas: perfil?.gemas ?? 0,
        pontos: (perfil?.gemas ?? 0) + Math.floor((perfil?.passos ?? 0) / 100),
        addGemas: recarregarPerfil,
        doces,
        carregarDoces,
      }}
    >
      {children}
    </GemsContext.Provider>
  );
}

export function useGemas() {
  return useContext(GemsContext);
}
