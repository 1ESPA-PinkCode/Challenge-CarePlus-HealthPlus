// components/AvisoConquista.jsx — comemoração ao concluir uma missão
import { useRouter } from "expo-router";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import { useMissoes } from "../context/MissoesContext";
import Icone from "./Icone";

export default function AvisoConquista() {
  const { aviso, fecharAviso } = useMissoes();
  const router = useRouter();

  return (
    <Modal visible={!!aviso} transparent animationType="fade" onRequestClose={fecharAviso}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Icone nome="flower" tamanho={84} tom="verde" />
          <Text style={styles.titulo}>Missão concluída!</Text>
          <Text style={styles.missao}>{aviso?.titulo}</Text>
          <Text style={styles.pontos}>+{aviso?.gemas} pontos</Text>
          <View style={styles.doce}>
            <Icone nome="gift" tamanho={36} tom="branco" />
            <Text style={[styles.doceTexto, { flex: 1 }]}>Você ganhou um doce surpresa! Retire no estande do Health Plus.</Text>
          </View>
          <TouchableOpacity
            style={styles.botao}
            onPress={() => {
              fecharAviso();
              router.push("/recompensas");
            }}
          >
            <Text style={styles.botaoTexto}>Ver meu cupom</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={fecharAviso} style={{ paddingVertical: 10 }}>
            <Text style={styles.continuar}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: 28 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 24, alignItems: "center" },
  emoji: { fontSize: 56 },
  titulo: { fontSize: 24, fontWeight: "800", color: colors.primary, marginTop: 12 },
  missao: { fontSize: 15, color: "#4A4A4A", marginTop: 4, textAlign: "center" },
  pontos: { fontSize: 32, fontWeight: "900", color: colors.primary, marginVertical: 10 },
  doce: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FBF1B8", borderRadius: 14, padding: 12, marginBottom: 16 },
  doceTexto: { color: "#5A6B2F", fontWeight: "700" },
  botao: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignSelf: "stretch", alignItems: "center" },
  botaoTexto: { color: colors.white, fontWeight: "800", fontSize: 16 },
  continuar: { color: colors.primary, fontWeight: "700" },
});
