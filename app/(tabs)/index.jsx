// app/(tabs)/index.jsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BarraProgresso from "../../components/BarraProgresso";
import FlorAnimada from "../../components/FlorAnimada";
import Greeting from "../../components/Greeting";
import MissaoCard from "../../components/MissaoCard";
import TituloSecao from "../../components/TituloSecao";
import { FLORES } from "../../components/blooms";
import { colors } from "../../constants/colors";
import { useJardim } from "../../context/JardimContext";
import { useMissoes } from "../../context/MissoesContext";
import { useUsuario } from "../../context/UsuarioContext";
import { useGemas } from "../../contexts/GemsContext";

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
  const router = useRouter();
  const { florAtual } = useJardim();
  const { missoes, registrar, concluidas, totalMissoes: totalReais, crescimentoFlor } = useMissoes();
  const { addGemas } = useGemas();

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
          {florNome} florid{florFem ? "a" : "o"}
        </Text>
        <Text style={styles.florSubtitulo}>Sua jornada de autocuidado</Text>

        <View style={styles.cena}>
          <FlorAnimada
            tipo={florAtual}
            target={progresso}
            duration={1800}
            showLabel={false}
            size={230}
          />
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
      <TituloSecao>Principais Missões</TituloSecao>
      <View style={styles.bloco}>
        {missoes.map((m) => (
          <MissaoCard
            key={m.id}
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
        ))}
      </View>

      {/* Status de Autocuidado */}
      <TituloSecao>Status de Autocuidado</TituloSecao>
      <View style={[styles.bloco, styles.statusBloco]}>
        {statusReais.map((s) => (
          <StatusItem key={s.id} {...s} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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