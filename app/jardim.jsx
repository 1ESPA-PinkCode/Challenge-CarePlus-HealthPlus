// app/jardim.jsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Flor from "../components/Flor";
import CenaJardim from "../components/CenaJardim";
import BarraProgresso from "../components/BarraProgresso";
import TituloSecao from "../components/TituloSecao";
import { FLORES, FLORES_ORDEM } from "../components/blooms";
import { useJardim } from "../context/JardimContext";
import { colors } from "../constants/colors";

const CENA_W = 340;
const CENA_H = 180;

export default function Jardim() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { florAtual, setFlorAtual, nivelUsuario } = useJardim();

  const desbloqueadas = FLORES_ORDEM.filter((t) => nivelUsuario >= FLORES[t].nivel);
  const total = FLORES_ORDEM.length;
  const pct = desbloqueadas.length / total;

  // posiciona as flores desbloqueadas na faixa de terra (até 5 espalhadas)
  const plantadas = desbloqueadas.slice(0, 5);
  const florSize = 120;
  const slotW = CENA_W / (plantadas.length + 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    >
      <TouchableOpacity style={styles.voltar} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={26} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.tituloPill}>
        <Text style={styles.tituloText}>Meu Jardim</Text>
      </View>

      {/* CENÁRIO + flores plantadas por cima */}
      <View style={styles.cenaBox}>
        <CenaJardim width={CENA_W} height={CENA_H} />
        {plantadas.map((t, i) => (
          <View
            key={t}
            style={[
              styles.plantada,
              {
                width: florSize,
                height: florSize,
                left: slotW * (i + 1) - florSize / 2,
                top: CENA_H - florSize - 6, // base da flor na terra
              },
            ]}
          >
            <Flor
              tipo={t}
              missionsCompleted={40}
              totalMissions={40}
              showLabel={false}
              showScenery={false}
              size={florSize}
            />
          </View>
        ))}
      </View>

      <Text style={styles.pctText}>{Math.round(pct * 100)}% do Jardim concluído!</Text>
      <View style={{ marginHorizontal: 16 }}>
        <BarraProgresso progress={pct} height={10} />
      </View>

      <View style={styles.statBox}>
        <Ionicons name="ribbon-outline" size={22} color={colors.primary} />
        <View>
          <Text style={styles.statLabel}>Flores desbloqueadas</Text>
          <Text style={styles.statValor}>
            {desbloqueadas.length} / {total}
          </Text>
        </View>
      </View>

      <TituloSecao>Floricultura</TituloSecao>
      <View style={styles.grade}>
        {FLORES_ORDEM.map((tipo) => {
          const flor = FLORES[tipo];
          const bloqueada = nivelUsuario < flor.nivel;
          const selecionada = !bloqueada && tipo === florAtual;

          const onPress = () => {
            if (bloqueada) return;
            setFlorAtual(tipo);
          };

          return (
            <TouchableOpacity
              key={tipo}
              style={[styles.florCard, selecionada && styles.florCardSel]}
              activeOpacity={bloqueada ? 1 : 0.8}
              onPress={onPress}
            >
              <View style={[styles.florArea, bloqueada && { opacity: 0.3 }]}>
                <Flor
                  tipo={tipo}
                  missionsCompleted={40}
                  totalMissions={40}
                  showLabel={false}
                  showScenery={false}
                  size={70}
                />
              </View>

              {bloqueada && (
                <View style={styles.cadeado}>
                  <Ionicons name="lock-closed" size={18} color="#9AA89E" />
                </View>
              )}

              <Text style={styles.florNome}>{flor.nome}</Text>
              <Text style={styles.florNivel}>Nível {flor.nivel}</Text>

              {bloqueada ? (
                <View style={[styles.badge, styles.badgeBloq]}>
                  <Text style={styles.badgeBloqText}>Bloqueada</Text>
                </View>
              ) : selecionada ? (
                <View style={[styles.badge, styles.badgeSel]}>
                  <Text style={styles.badgeSelText}>Selecionada</Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.badgeDisp]}>
                  <Text style={styles.badgeDispText}>Selecionar</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const CARD_GAP = 10;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 24 },

  voltar: { marginBottom: 12 },

  tituloPill: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tituloText: { color: colors.white, fontSize: 22, fontWeight: "800" },

  cenaBox: {
    height: CENA_H,
    position: "relative",
    alignItems: "center",
  },
  plantada: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  pctText: {
    marginTop: 14,
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 6,
  },

  statBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#D8EFE3",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  statLabel: { fontSize: 13, color: colors.textDark },
  statValor: { fontSize: 16, fontWeight: "800", color: colors.primary },

  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: CARD_GAP,
  },
  florCard: {
    width: `${100 / 3 - 3}%`,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E4EFE4",
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  florCardSel: { borderColor: colors.primary, borderWidth: 2 },
  florArea: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cadeado: {
    position: "absolute",
    top: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  florNome: { fontSize: 13, fontWeight: "700", color: colors.textDark, marginTop: 4 },
  florNivel: { fontSize: 11, color: "#7C8C82", marginBottom: 8 },

  badge: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 },
  badgeSel: { backgroundColor: colors.primary },
  badgeSelText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  badgeDisp: { backgroundColor: colors.green3 },
  badgeDispText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  badgeBloq: { backgroundColor: "#D7DDD9" },
  badgeBloqText: { color: "#7C8C82", fontSize: 11, fontWeight: "700" },
});