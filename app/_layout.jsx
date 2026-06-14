import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { JardimProvider } from "../context/JardimContext";
import { MissoesProvider } from "../context/MissoesContext";
import { UsuarioProvider } from "../context/UsuarioContext";

import { ChatProvider } from "../contexts/ChatContext";
import { GemsProvider } from "../contexts/GemsContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UsuarioProvider>
        <JardimProvider>
          <GemsProvider>
            <MissoesProvider>
              <ChatProvider>
                <StatusBar style="light" />

                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="chat" />
                  <Stack.Screen name="auth/login" />
                </Stack>
              </ChatProvider>
            </MissoesProvider>
          </GemsProvider>
        </JardimProvider>
      </UsuarioProvider>
    </SafeAreaProvider>
  );
}