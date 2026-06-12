// app/index.jsx
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../constants/colors";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function verificar() {
      try {
        const jaViu = await AsyncStorage.getItem("@healthplus:onboarding");
        const usuarioSalvo = await AsyncStorage.getItem("@healthplus:usuario");

        if (!jaViu) {
          // Primeira vez — mostra onboarding
          router.replace("/auth/splash");
        } else if (usuarioSalvo) {
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
    verificar();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}