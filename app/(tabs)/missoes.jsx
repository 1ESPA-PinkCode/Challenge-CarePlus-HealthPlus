// app/(tabs)/missoes.jsx
import { ScrollView, StyleSheet, Text, View } from "react-native";
import MissaoCard from "../../components/MissaoCard";
import { colors } from "../../constants/colors";
import { useMissoes } from "../../context/MissoesContext";
import { useGemas } from "../../contexts/GemsContext";

export default function Missoes() {
  const { missoes, registrar } = useMissoes();
  const { addGemas } = useGemas();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>Missões do Dia</Text>
        <Text style={styles.subtitulo}>
          Complete suas missões e cultive seu jardim 🌱
        </Text>

        {missoes.map((m) => (
          <View key={m.id} style={styles.cardWrapper}>
            <MissaoCard
              icon={m.icon}
              titulo={m.titulo}
              desc={m.desc}
              atual={m.atual}
              meta={m.meta}
              unidade={m.unidade}
              gemas={m.gemas}
              feita={m.atual >= m.meta}
              onRegistrar={() => registrar(m.id, addGemas, 1)}
            />
          </View>
        ))}
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