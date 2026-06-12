// app/_layout.jsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { JardimProvider } from "../context/JardimContext";
import { GemsProvider } from "../contexts/GemsContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <JardimProvider>
        <GemsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/splash" />
            <Stack.Screen name="auth/onboarding" />
            <Stack.Screen name="auth/lgpd" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/cadastro" />
          </Stack>
        </GemsProvider>
      </JardimProvider>
    </SafeAreaProvider>
  );
}