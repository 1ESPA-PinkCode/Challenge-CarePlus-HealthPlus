// contexts/GemsContext.jsx — gemas (saldo para comprar doces) e pontos do ranking
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUsuario } from "../context/UsuarioContext";
import { supabase } from "../lib/supabase";

const GemsContext = createContext(null);

export function GemsProvider({ children }) {
  const { perfil, recarregarPerfil } = useUsuario();
  const [compras, setCompras] = useState([]);
  const [preco, setPreco] = useState(115);
  const userId = perfil?.id;

  const carregarDoces = useCallback(async () => {
    supabase
      .from("evento")
      .select("preco_doce")
      .eq("id", 1)
      .single()
      .then(({ data }) => data?.preco_doce && setPreco(data.preco_doce));
    if (!userId) {
      setCompras([]);
      return;
    }
    const { data } = await supabase
      .from("doces")
      .select("codigo, entregue_em, criado_em")
      .eq("usuario_id", userId)
      .eq("entregue", true)
      .order("criado_em", { ascending: false });
    setCompras(data || []);
    recarregarPerfil();
  }, [userId]);

  useEffect(() => {
    carregarDoces();
  }, [carregarDoces]);

  return (
    <GemsContext.Provider
      value={{
        gemas: perfil?.gemas ?? 0, // saldo: sobe com missões, desce ao comprar doce
        gemasGanhas: perfil?.gemas_ganhas ?? perfil?.gemas ?? 0,
        pontos: (perfil?.gemas_ganhas ?? perfil?.gemas ?? 0) + Math.floor((perfil?.passos ?? 0) / 100), // ranking
        preco,
        compras,
        addGemas: recarregarPerfil,
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
