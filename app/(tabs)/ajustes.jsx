import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export default function Ajustes() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: "700", color: colors.primary },
});