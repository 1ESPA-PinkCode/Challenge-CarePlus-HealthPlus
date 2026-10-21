import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GruposProvider } from "../context/GruposContext";
import { JardimProvider } from "../context/JardimContext";
import { MissoesProvider } from "../context/MissoesContext";
import { PassosProvider } from "../context/PassosContext";
import AvisoVencedor from "../components/AvisoVencedor";
import { UsuarioProvider } from "../context/UsuarioContext";
import { ChatProvider } from "../contexts/ChatContext";
import { GemsProvider } from "../contexts/GemsContext";
import AvisoConquista from "../components/AvisoConquista";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UsuarioProvider>
        <JardimProvider>
          <GemsProvider>
            <MissoesProvider>
              <GruposProvider>
                <PassosProvider>
                <ChatProvider>
                  <StatusBar style="light" />
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="chat" />
                    <Stack.Screen name="auth/splash" />
                    <Stack.Screen name="auth/onboarding" />
                    <Stack.Screen name="auth/lgpd" />
                    <Stack.Screen name="auth/login" />
                    <Stack.Screen name="auth/cadastro" />
                  </Stack>
                  <AvisoConquista />
                  <AvisoVencedor />
                </ChatProvider>
                </PassosProvider>
              </GruposProvider>
            </MissoesProvider>
          </GemsProvider>
        </JardimProvider>
      </UsuarioProvider>
    </SafeAreaProvider>
  );
}