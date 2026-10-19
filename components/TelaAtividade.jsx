// components/TelaAtividade.jsx — moldura comum das telas de atividade
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";

export default function TelaAtividade({ titulo, children }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topo}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/missoes"))}>
          <Ionicons name="arrow-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.titulo}>{titulo}</Text>
        <View style={{ width: 26 }} />
      </View>
      <View style={styles.corpo}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 14 },
  titulo: { color: colors.white, fontSize: 20, fontWeight: "800" },
  corpo: { flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
});
