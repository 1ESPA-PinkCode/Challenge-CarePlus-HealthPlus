// app/(tabs)/index.jsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BarraProgresso from "../../components/BarraProgresso";
import FlorVisual from "../../components/FlorVisual";
import Greeting from "../../components/Greeting";
import ListaMissoes from "../../components/ListaMissoes";
import TituloSecao from "../../components/TituloSecao";
import { FLORES } from "../../components/blooms";
import { colors } from "../../constants/colors";
import { useJardim } from "../../context/JardimContext";
import { useMissoes } from "../../context/MissoesContext";
import { useUsuario } from "../../context/UsuarioContext";
import { useGemas } from "../../contexts/GemsContext";
import Icone from "../../components/Icone";

function StatusItem({ icon, label, progress, cor }) {
  return (
    <View style={styles.statusRow}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ width: 26 }} />
      <Text style={styles.statusLabel}>{label}</Text>
      <View style={{ flex: 1 }}>
        <BarraProgresso progress={progress} height={8} fillColor={cor} />
      </View>
    </View>
  );
}

export default function Inicio() {
  const { usuario } = useUsuario();
  const { pontos } = useGemas();
  const router = useRouter();
  const { florAtual } = useJardim();
  const { missoes, concluidas, totalMissoes: totalReais, crescimentoFlor } = useMissoes();

  const progresso = crescimentoFlor;
  const florNome = FLORES[florAtual]?.nome ?? "Flor";
  const florFem = FLORES[florAtual]?.genero === "f";

  // Status de autocuidado: lê o progresso real de cada missão
  const cores = [colors.green4, colors.green3, colors.green2, colors.green4];
  const statusReais = missoes.map((m, i) => ({
    id: m.id,
    icon: m.icon,
    label: m.titulo,
    progress: m.meta > 0 ? Math.min(1, m.atual / m.meta) : 0,
    cor: cores[i % cores.length],
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Greeting nome={usuario?.nome || "visitante"} />

      {/* Card da flor */}
      <View style={styles.florCard}>
        <Text style={styles.florTitulo}>
          {progresso >= 1
            ? `${florNome} florid${florFem ? "a" : "o"}!`
            : progresso >= 0.6
            ? `${florFem ? "Sua" : "Seu"} ${florNome.toLowerCase()} está quase abrindo`
            : progresso > 0
            ? `${florFem ? "Sua" : "Seu"} ${florNome.toLowerCase()} está crescendo`
            : "Plante sua sementinha"}
        </Text>
        <Text style={styles.florSubtitulo}>Sua jornada de autocuidado</Text>

        <View style={styles.cena}>
          <FlorVisual tipo={florAtual} target={progresso} size={250} celebrar={concluidas} />
        </View>

        <Text style={styles.progressoTitulo}>
          {concluidas} de {totalReais} missões completas!
        </Text>
        <Text style={styles.progressoSub}>Parabéns! Você está indo bem</Text>
        <BarraProgresso progress={progresso} height={10} />
      </View>

      {/* Botão do Jardim (simples) */}
      <TouchableOpacity
        style={styles.jardimBtn}
        activeOpacity={0.85}
        onPress={() => router.push("/jardim")}
      >
        <View style={styles.jardimIcon}>
          <Ionicons name="flower-outline" size={24} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.jardimTitulo}>Seu Jardim</Text>
          <Text style={styles.jardimSub}>Veja sua coleção de flores</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.primary} />
      </TouchableOpacity>

      {/* Principais Missões — agora conectadas de verdade */}
      <TituloSecao>Próximas missões</TituloSecao>
      <View style={styles.bloco}>
        <ListaMissoes soPendentes limite={3} />
        <TouchableOpacity style={styles.verTodas} onPress={() => router.push("/missoes")}>
          <Text style={styles.verTodasTexto}>Ver todas as missões</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Gincana NEXT */}
      <TituloSecao>Gincana NEXT</TituloSecao>
      <View style={styles.gincana}>
        <TouchableOpacity style={styles.gincanaCard} onPress={() => router.push("/ranking")} activeOpacity={0.85}>
          <Icone nome="trophy" tamanho={46} tom="verde" />
          <Text style={styles.gincanaTitulo}>{pontos} pontos</Text>
          <Text style={styles.gincanaSub}>Ver ranking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gincanaCard} onPress={() => router.push("/passos")} activeOpacity={0.85}>
          <Icone nome="footsteps" tamanho={46} tom="agua" />
          <Text style={styles.gincanaTitulo}>{(usuario?.passos ?? 0).toLocaleString("pt-BR")} passos</Text>
          <Text style={styles.gincanaSub}>Contar passos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gincana: { flexDirection: "row", gap: 12, marginHorizontal: 16 },
  gincanaCard: { flex: 1, backgroundColor: "#EAF3DC", borderRadius: 20, padding: 16, alignItems: "center" },
  gincanaEmoji: { fontSize: 34 },
  gincanaTitulo: { fontSize: 18, fontWeight: "900", color: colors.primary, marginTop: 8 },
  gincanaSub: { fontSize: 13, color: "#5A6B2F", fontWeight: "700", marginTop: 2 },
  verTodas: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 10 },
  verTodasTexto: { color: colors.primary, fontWeight: "800", fontSize: 15 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 24 },

  florCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.green3,
    padding: 16,
  },
  florTitulo: { fontSize: 18, fontWeight: "800", color: colors.primary },
  florSubtitulo: { fontSize: 13, color: colors.green2, marginTop: 2, marginBottom: 10 },
  cena: {
    backgroundColor: "#EAF3DC",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    overflow: "hidden",
  },
  progressoTitulo: { marginTop: 14, fontSize: 14, fontWeight: "700", color: colors.primary },
  progressoSub: { fontSize: 12, color: colors.green2, marginBottom: 8 },

  jardimBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 16,
    marginTop: 22,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.green3,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  jardimIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  jardimTitulo: { fontSize: 16, fontWeight: "800", color: colors.primary },
  jardimSub: { fontSize: 12, color: colors.green2, marginTop: 2 },

  bloco: { marginHorizontal: 16, gap: 14 },

  statusBloco: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4EFE4",
    padding: 14,
    gap: 14,
    marginHorizontal: 16,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusLabel: { width: 70, fontSize: 13, fontWeight: "600", color: colors.textDark },
});