import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function Greeting({ nome = "Lucas" }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Olá {nome}!</Text>
      <Text style={styles.subtitle}>Como você está hoje?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.primary,
    borderRadius: 90,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 16,
  },
  title: {
    color: colors.white,
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.white,
    fontSize: 15,
    marginTop: 2,
    opacity: 0.9,
  },
});