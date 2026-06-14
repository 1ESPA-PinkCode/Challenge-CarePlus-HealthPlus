// components/MissaoCard.jsx
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import BarraProgresso from "./BarraProgresso";

/**
 * Card de missão reutilizável.
 *
 * Props:
 * - icon: nome do Ionicons (ex: "moon-outline")
 * - titulo, desc: textos
 * - atual, meta: números do progresso (ex: 7, 8)
 * - unidade: texto da unidade (ex: "horas", "min")
 * - gemas: quantidade de gemas da recompensa
 * - feita: boolean — se true mostra "Concluída!", senão o botão "Registrar >"
 * - onRegistrar: função chamada ao tocar em "Registrar >"
 */
export default function MissaoCard({
  icon = "leaf-outline",
  titulo,
  desc,
  atual = 0,
  meta = 1,
  unidade = "",
  gemas = 0,
  feita = false,
  onRegistrar,
}) {
  const progresso = meta > 0 ? atual / meta : 0;
  const pct = Math.round(Math.min(1, progresso) * 100);

  return (
    <View style={styles.card}>
      {/* topo: ícone + título/descrição */}
      <View style={styles.topo}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={26} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.desc}>{desc}</Text>
        </View>
      </View>

      {/* linha de progresso: "X de Y unidade" + porcentagem */}
      <View style={styles.progressoLinha}>
        <Text style={styles.progressoLabel}>
          {atual} de {meta} {unidade}
        </Text>
        <Text style={styles.progressoPct}>{pct}%</Text>
      </View>
      <BarraProgresso progress={progresso} height={10} fillColor={colors.green4} />

      {/* rodapé: pílula de gemas + ação */}
      <View style={styles.rodape}>
        <View style={styles.gemaPill}>
          <Text style={styles.gemaText}> {gemas} gemas</Text>
          <Image
            source={require("../assets/images/gema.png")}
            style={styles.gema}
            resizeMode="contain"
          />
        </View>

       {feita ? (
          <Text style={styles.concluida}>Concluída!</Text>
        ) : (
          <TouchableOpacity style={styles.btnRegistrar} onPress={onRegistrar} activeOpacity={0.8}>
            <Text style={styles.btnRegistrarTexto}>Registrar</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 1,
    // sombra suave (iOS + Android)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.green4, // verde-água do protótipo
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1A1A1A", // título bem escuro, como no print
  },
  desc: {
    fontSize: 14,
    color: "#3A3A3A",
    marginTop: 2,
  },
  progressoLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressoLabel: {
    fontSize: 15,
    color: "#8A8A8A",
    fontWeight: "500",
  },
  progressoPct: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "700",
  },
  rodape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  gemaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBF1B8", // amarelo claro do protótipo
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 14,
    gap: 8,
  },
  gemaText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#5A6B2F",
  },
  gema: {
    width: 26,
    height: 26,
  },
  concluida: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  registrar: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  btnRegistrar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  btnRegistrarTexto: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
  },
});