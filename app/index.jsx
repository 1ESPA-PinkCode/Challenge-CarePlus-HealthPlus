// app/index.jsx
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../constants/colors";
import { useUsuario } from "../context/UsuarioContext";

export default function Index() {
  const router = useRouter();
  const { sessao, carregando } = useUsuario();

  useEffect(() => {
    async function verificar() {
      try {
        const jaViu = await AsyncStorage.getItem("@healthplus:onboarding");
        
        if (!jaViu) {
          // Primeira vez — mostra onboarding
          router.replace("/auth/splash");
        } else if (sessao) {
          // Já viu onboarding e está logado — vai direto pro app
          router.replace("/(tabs)");
        } else {
          // Já viu onboarding mas não está logado — vai pro login
          router.replace("/auth/login");
        }
      } catch (e) {
        router.replace("/auth/splash");
      }
    }
    if (!carregando) verificar();
  }, [carregando, sessao]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}