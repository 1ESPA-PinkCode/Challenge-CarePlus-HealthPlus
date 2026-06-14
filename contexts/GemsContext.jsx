import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GemsContext = createContext();

export function GemsProvider({ children }) {
  const [gemas, setGemas] = useState(150);
  const [redeemedRewards, setRedeemedRewards] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        const gemasSalvas = await AsyncStorage.getItem("@gemas");
        const resgatesSalvos = await AsyncStorage.getItem("@resgates");

        if (gemasSalvas !== null) {
          setGemas(Number(gemasSalvas));
        }

        if (resgatesSalvos !== null) {
          setRedeemedRewards(JSON.parse(resgatesSalvos));
        }
      } catch (error) {
        console.log("Erro ao carregar dados:", error);
      } finally {
        setLoaded(true);
      }
    }

    carregarDados();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem("@gemas", String(gemas));
  }, [gemas, loaded]);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem("@resgates", JSON.stringify(redeemedRewards));
  }, [redeemedRewards, loaded]);

  function addGemas(quantidade) {
    setGemas((valorAtual) => valorAtual + quantidade);
  }

  function removeGemas(quantidade) {
    setGemas((valorAtual) => Math.max(valorAtual - quantidade, 0));
  }

  function addRedeemedReward(title, coupon) {
    setRedeemedRewards((currentRewards) => ({
      ...currentRewards,
      [title]: coupon,
    }));
  }

  return (
    <GemsContext.Provider
      value={{
        gemas,
        addGemas,
        removeGemas,
        redeemedRewards,
        addRedeemedReward,
      }}
    >
      {children}
    </GemsContext.Provider>
  );
}

export function useGemas() {
  return useContext(GemsContext);
}