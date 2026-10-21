// app/(tabs)/ranking.jsx — ranking da gincana no celular
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/colors";
import { formatarTempo, useEvento, useRanking } from "../../lib/evento";
import Icone, { IconeTexto, Posicao } from "../../components/Icone";


export default function Ranking() {
  const router = useRouter();
  const { status, restanteMs, paraComecarMs } = useEvento();
  const { linhas } = useRanking(10, 10000);
  const eu = linhas.find((l) => l.sou_eu);
  const top = linhas.filter((l) => l.posicao <= 10);
  const acima = eu && eu.posicao > 1 ? linhas.find((l) => l.posicao === eu.posicao - 1) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.tituloBox}>
        <Text style={styles.titulo}>Ranking NEXT</Text>
        <Text style={styles.relogio}>
          {status === "antes"
            ? `Começa em ${formatarTempo(paraComecarMs)}`
            : status === "aberto"
            ? `Termina em ${formatarTempo(restanteMs)}`
            : "Gincana encerrada"}
        </Text>
      </View>

      {eu && (
        <View style={styles.meuCard}>
          <Text style={styles.meuPos}>{eu.posicao}º</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.meuTitulo}>Você está em {eu.posicao}º lugar!</Text>
            <Text style={styles.meuSub}>
              {eu.pontos} pontos
              {acima ? ` · faltam ${acima.pontos - eu.pontos + 1} para passar ${acima.nome}` : eu.posicao === 1 ? " · você está liderando!" : ""}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.premio}>
        <Icone nome="gift" tamanho={40} tom="branco" />
        <Text style={[styles.premioTexto, { flex: 1 }]}>Quem terminar em 1º às 18:00 ganha uma caixa de bombom! Empate: vence quem andou mais.</Text>
      </View>

      <TouchableOpacity style={styles.passosBtn} onPress={() => router.push("/passos")} activeOpacity={0.85}>
        <Ionicons name="footsteps" size={22} color={colors.white} />
        <Text style={styles.passosTexto}>Contar passos (1 ponto a cada 100)</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.white} />
      </TouchableOpacity>

      <View style={styles.card}>
        {top.length === 0 && <Text style={styles.vazio}>Ninguém pontuou ainda. Comece pelas missões!</Text>}
        {top.map((l, i) => (
          <View key={l.posicao} style={[styles.linha, i === top.length - 1 && { borderBottomWidth: 0 }, l.sou_eu && styles.linhaEu]}>
            <Posicao n={l.posicao} />
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{l.nome}{l.sou_eu ? " (você)" : ""}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <IconeTexto nome="footsteps" cor="#6A6A6A" tamanho={13} />
                <Text style={styles.detalhe}>{l.passos.toLocaleString("pt-BR")} passos</Text>
              </View>
            </View>
            <Text style={styles.pts}>{l.pontos}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40 },
  tituloBox: { backgroundColor: colors.primary, borderRadius: 30, paddingVertical: 18, paddingHorizontal: 24, marginBottom: 14 },
  titulo: { fontSize: 30, fontWeight: "800", color: colors.white },
  relogio: { color: "#E6F7F1", fontWeight: "700", marginTop: 4, fontVariant: ["tabular-nums"] },
  meuCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#EAF3DC", borderRadius: 20, padding: 16, marginBottom: 12 },
  meuPos: { fontSize: 34, fontWeight: "900", color: colors.primary },
  meuTitulo: { fontSize: 17, fontWeight: "800", color: "#1A1A1A" },
  meuSub: { fontSize: 14, color: "#4A4A4A", marginTop: 2 },
  premio: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FBF1B8", borderRadius: 16, padding: 12, marginBottom: 12 },
  premioTexto: { color: "#5A6B2F", fontWeight: "700" },
  passosBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.primary, borderRadius: 16, padding: 14, marginBottom: 16 },
  passosTexto: { flex: 1, color: colors.white, fontWeight: "800", fontSize: 15 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  vazio: { padding: 24, textAlign: "center", color: "#6A6A6A" },
  linha: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.green3 },
  linhaEu: { backgroundColor: "#F3FAEC", marginHorizontal: -16, paddingHorizontal: 16 },
  pos: { fontSize: 20, fontWeight: "800", color: colors.primary, width: 38 },
  nome: { fontSize: 17, fontWeight: "800", color: "#1A1A1A" },
  detalhe: { fontSize: 13, color: "#6A6A6A" },
  pts: { fontSize: 20, fontWeight: "900", color: colors.primary },
});
