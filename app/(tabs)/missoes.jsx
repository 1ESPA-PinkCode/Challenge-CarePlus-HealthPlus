// app/(tabs)/missoes.jsx
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ListaMissoes from "../../components/ListaMissoes";
import { colors } from "../../constants/colors";

export default function Missoes() {

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>Missões do NEXT</Text>
        <Text style={styles.subtitulo}>
          Ganhe gemas em cada missão e troque por doces na banca!
        </Text>

        <ListaMissoes estiloItem={styles.cardWrapper} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 15,
    color: "#6A6A6A",
    marginBottom: 20,
  },
  cardWrapper: {
    marginBottom: 16,
  },
});