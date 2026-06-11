// components/TituloSecao.jsx
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function TituloSecao({ children }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  text: { color: colors.white, fontSize: 16, fontWeight: "800" },
});