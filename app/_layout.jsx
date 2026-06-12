// app/_layout.jsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { JardimProvider } from "../context/JardimContext";
import { GemsProvider } from "../contexts/GemsContext";
import { UsuarioProvider } from "../context/UsuarioContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <UsuarioProvider>
        <JardimProvider>
          <GemsProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth" />
            </Stack>
          </GemsProvider>
        </JardimProvider>
      </UsuarioProvider>
    </SafeAreaProvider>
  );
}