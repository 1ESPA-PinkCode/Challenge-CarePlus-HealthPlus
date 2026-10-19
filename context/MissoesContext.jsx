// context/MissoesContext.jsx — missões do dia, salvas no banco
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUsuario } from "./UsuarioContext";

const MissoesContext = createContext(null);

// Catálogo das missões diárias (o progresso de cada dia fica no banco)
export const CATALOGO_MISSOES = [
  { id: "meditacao",  icon: "leaf-outline",    titulo: "Meditação Matinal!", desc: "Pratique 10 minutos de meditação", meta: 10, passo: 5,  unidade: "min",   gemas: 30 },
  { id: "sono",       icon: "moon-outline",    titulo: "Sono Reparador",     desc: "Durma 8 horas essa noite",        meta: 8,  passo: 1,  unidade: "horas", gemas: 10 },
  { id: "hidratacao", icon: "water-outline",   titulo: "Hidratação",         desc: "Beba 8 copos de água",            meta: 8,  passo: 1,  unidade: "copos", gemas: 15 },
  { id: "exercicio",  icon: "barbell-outline", titulo: "Exercício Físico",   desc: "Faça 30 minutos de atividade",    meta: 30, passo: 10, unidade: "min",   gemas: 20 },
];

function hojeSP() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }); // AAAA-MM-DD
}

const vazias = () => CATALOGO_MISSOES.map((m) => ({ ...m, atual: 0 }));

export function MissoesProvider({ children }) {
  const { perfil, recarregarPerfil } = useUsuario();
  const [missoes, setMissoes] = useState(vazias);
  const [carregado, setCarregado] = useState(false);
  const userId = perfil?.id;

  const carregar = useCallback(async () => {
    if (!userId) {
      setMissoes(vazias());
      return;
    }
    const { data, error } = await supabase
      .from("missoes_dia")
      .select("missao_id, atual")
      .eq("usuario_id", userId)
      .eq("dia", hojeSP());
    if (!error) {
      const mapa = Object.fromEntries((data || []).map((r) => [r.missao_id, r.atual]));
      setMissoes(CATALOGO_MISSOES.map((m) => ({ ...m, atual: mapa[m.id] || 0 })));
    }
    setCarregado(true);
  }, [userId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // passo: quanto avançar. Se não vier, usa o passo padrão da missão.
  async function registrar(id, onConcluir, passo) {
    const m = missoes.find((x) => x.id === id);
    if (!m || m.atual >= m.meta) return;
    const incremento = Math.max(passo || 1, m.passo || 1);

    // atualiza a tela na hora; o banco confirma em seguida
    setMissoes((lista) => lista.map((x) => (x.id === id ? { ...x, atual: Math.min(x.meta, x.atual + incremento) } : x)));

    const { data, error } = await supabase.rpc("registrar_missao", {
      p_missao: id,
      p_passo: incremento,
      p_meta: m.meta,
      p_gemas: m.gemas,
    });
    if (error) {
      console.log("Erro ao registrar missão:", error.message);
      carregar();
      return;
    }
    setMissoes((lista) => lista.map((x) => (x.id === id ? { ...x, atual: data.atual } : x)));
    if (data.concluiu_agora) {
      if (typeof onConcluir === "function") onConcluir(m.gemas);
      recarregarPerfil();
    }
  }

  const totalMissoes = missoes.length;
  const concluidas = missoes.filter((m) => m.atual >= m.meta).length;
  const crescimentoFlor = totalMissoes > 0 ? concluidas / totalMissoes : 0;

  return (
    <MissoesContext.Provider
      value={{ missoes, registrar, recarregar: carregar, concluidas, totalMissoes, crescimentoFlor, carregado }}
    >
      {children}
    </MissoesContext.Provider>
  );
}

export function useMissoes() {
  const ctx = useContext(MissoesContext);
  if (!ctx) throw new Error("useMissoes precisa estar dentro de <MissoesProvider>");
  return ctx;
}
