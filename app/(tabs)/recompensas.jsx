// app/(tabs)/recompensas.jsx — doces surpresa ganhos nas missões
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { CATALOGO_MISSOES } from "../../context/MissoesContext";
import { useGemas } from "../../contexts/GemsContext";

const nomeMissao = (id) => CATALOGO_MISSOES.find((m) => m.id === id)?.titulo || id;

export default function Recompensas() {
  const { doces, carregarDoces } = useGemas();
  const pendentes = doces.filter((d) => !d.entregue);
  const entregues = doces.filter((d) => d.entregue);

  useFocusEffect(
    useCallback(() => {
      carregarDoces();
    }, [carregarDoces])
  );

  // atualiza enquanto a pessoa está na fila do estande
  useEffect(() => {
    const t = setInterval(carregarDoces, 15000);
    return () => clearInterval(t);
  }, [carregarDoces]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleBox}>
        <Text style={styles.title}>Seus doces 🍬</Text>
      </View>

      <View style={styles.premio}>
        <Text style={styles.premioEmoji}>🍫</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.premioTitulo}>Grande prêmio</Text>
          <Text style={styles.premioTexto}>Quem estiver em 1º no ranking às 18:00 ganha uma caixa de bombom!</Text>
        </View>
      </View>

      <Text style={styles.explicacao}>
        Cada missão concluída vale um doce surpresa. Mostre o código no estande do Health Plus para retirar.
      </Text>

      {doces.length === 0 && (
        <View style={styles.vazio}>
          <Text style={{ fontSize: 48 }}>🍭</Text>
          <Text style={styles.vazioTexto}>Conclua sua primeira missão para ganhar um doce!</Text>
        </View>
      )}

      {pendentes.length > 0 && <Text style={styles.secao}>Para retirar ({pendentes.length})</Text>}
      {pendentes.map((d) => (
        <View key={d.codigo} style={styles.cupom}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cupomMissao}>{nomeMissao(d.missao_id)}</Text>
            <Text style={styles.cupomLabel}>Mostre este código no estande</Text>
          </View>
          <Text style={styles.cupomCodigo}>{d.codigo}</Text>
        </View>
      ))}

      {entregues.length > 0 && <Text style={styles.secao}>Já retirados ({entregues.length})</Text>}
      {entregues.map((d) => (
        <View key={d.codigo} style={[styles.cupom, styles.cupomEntregue]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cupomMissao, { color: "#8A8A8A" }]}>{nomeMissao(d.missao_id)}</Text>
            <Text style={styles.cupomLabel}>Doce entregue ✓</Text>
          </View>
          <Text style={[styles.cupomCodigo, styles.codigoRiscado]}>{d.codigo}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  titleBox: { backgroundColor: colors.primary, borderRadius: 30, paddingVertical: 18, paddingHorizontal: 24, marginBottom: 14 },
  title: { fontSize: 30, fontWeight: "800", color: colors.white },
  premio: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FBF1B8", borderRadius: 20, padding: 16, marginBottom: 12 },
  premioEmoji: { fontSize: 44 },
  premioTitulo: { fontSize: 17, fontWeight: "900", color: "#3A4A1F" },
  premioTexto: { fontSize: 14, color: "#5A6B2F", marginTop: 2 },
  explicacao: { fontSize: 14, color: "#4A4A4A", lineHeight: 20, marginBottom: 14 },
  vazio: { alignItems: "center", padding: 30, gap: 8 },
  vazioTexto: { color: "#6A6A6A", textAlign: "center", fontSize: 15 },
  secao: { fontSize: 15, color: "#9AA98C", fontWeight: "700", marginBottom: 8, marginTop: 6 },
  cupom: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.green4,
    borderStyle: "dashed",
    padding: 16,
    marginBottom: 10,
  },
  cupomEntregue: { borderColor: "#DDD", backgroundColor: "#FAFAFA" },
  cupomMissao: { fontSize: 16, fontWeight: "800", color: "#1A1A1A" },
  cupomLabel: { fontSize: 12, color: "#8A8A8A", marginTop: 2 },
  cupomCodigo: { fontSize: 24, fontWeight: "900", color: colors.primary, letterSpacing: 2 },
  codigoRiscado: { color: "#BBB", textDecorationLine: "line-through" },
});
