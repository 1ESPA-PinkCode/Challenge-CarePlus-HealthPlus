import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GemsProvider } from "../contexts/GemsContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GemsProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </GemsProvider>
    </SafeAreaProvider>
  );
}