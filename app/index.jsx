// app/index.jsx
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/splash");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#1C9770", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}