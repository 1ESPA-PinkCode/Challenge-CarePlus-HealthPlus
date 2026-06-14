import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { UsuarioProvider } from "../context/UsuarioContext";
import { JardimProvider } from "../context/JardimContext";

import { GemsProvider } from "../contexts/GemsContext";
import { ChatProvider } from "../contexts/ChatContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UsuarioProvider>
        <JardimProvider>
          <GemsProvider>
            <ChatProvider>
              <StatusBar style="light" />

              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="chat" />
                <Stack.Screen name="auth/login" />
              </Stack>
            </ChatProvider>
          </GemsProvider>
        </JardimProvider>
      </UsuarioProvider>
    </SafeAreaProvider>
  );
}