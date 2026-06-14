// context/MissoesContext.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const MissoesContext = createContext(null);

const MISSOES_INICIAIS = [
  { id: "meditacao",  icon: "leaf-outline",    titulo: "Meditação Matinal!", desc: "Pratique 10 minutos de meditação", atual: 0, meta: 10, unidade: "min",    gemas: 30 },
  { id: "sono",       icon: "moon-outline",    titulo: "Sono Reparador",     desc: "Durma 8 horas essa noite",        atual: 0, meta: 8,  unidade: "horas",  gemas: 10 },
  { id: "hidratacao", icon: "water-outline",   titulo: "Hidratação",         desc: "Beba 8 copos de água",            atual: 0, meta: 8,  unidade: "copos",  gemas: 15 },
  { id: "exercicio",  icon: "barbell-outline", titulo: "Exercício Físico",   desc: "Faça 30 minutos de atividade",    atual: 0, meta: 30, unidade: "min",    gemas: 20 },
];

const STORAGE_KEY = "@healthplus:missoes_v1";

export function MissoesProvider({ children }) {
  const [missoes, setMissoes] = useState(MISSOES_INICIAIS);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const salvo = await AsyncStorage.getItem(STORAGE_KEY);
        if (salvo) {
          const dados = JSON.parse(salvo);
          if (dados.missoes) setMissoes(dados.missoes);
        }
      } catch (e) {
        console.log("Erro ao carregar missões:", e);
      } finally {
        setCarregado(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!carregado) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ missoes })).catch((e) =>
      console.log("Erro ao salvar missões:", e)
    );
  }, [missoes, carregado]);

  const registrar = (id, onConcluir, passo = 1) => {
    setMissoes((lista) =>
      lista.map((m) => {
        if (m.id !== id) return m;
        const jaConcluida = m.atual >= m.meta;
        const novoAtual = Math.min(m.meta, m.atual + passo);
        if (!jaConcluida && novoAtual >= m.meta && typeof onConcluir === "function") {
          onConcluir(m.gemas);
        }
        return { ...m, atual: novoAtual };
      })
    );
  };

  const resetarMissoes = () =>
    setMissoes((lista) => lista.map((m) => ({ ...m, atual: 0 })));

  const totalMissoes = missoes.length;
  const concluidas = missoes.filter((m) => m.atual >= m.meta).length;
  const crescimentoFlor = totalMissoes > 0 ? concluidas / totalMissoes : 0;

  return (
    <MissoesContext.Provider
      value={{
        missoes,
        registrar,
        resetarMissoes,
        concluidas,
        totalMissoes,
        crescimentoFlor,
        carregado,
      }}
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