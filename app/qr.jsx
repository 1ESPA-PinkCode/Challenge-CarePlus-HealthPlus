// app/qr.jsx — destino do QR code do RENMAP (…/qr?c=CODIGO)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import { useMissoes } from "../context/MissoesContext";
import { useUsuario } from "../context/UsuarioContext";



export default function QR() {
  const { c } = useLocalSearchParams();
  const router = useRouter();
  const { sessao, carregando } = useUsuario();
  const { validarCodigo } = useMissoes();
  const [estado, setEstado] = useState("validando"); // validando | ok | ja | erro
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (carregando) return;
    const codigo = typeof c === "string" ? c : "";
    if (!sessao) {
      // guarda o código e valida depois do login/cadastro
      AsyncStorage.setItem("@healthplus:qr_pendente", codigo).finally(() => router.replace("/"));
      return;
    }
    validarCodigo("qr_renmap", codigo).then((r) => {
      if (!r.ok) {
        setErro(r.erro);
        setEstado("erro");
      } else setEstado(r.nova ? "ok" : "ja");
    });
  }, [carregando, sessao]);

  return (
    <View style={styles.container}>
      {estado === "validando" ? (
        <ActivityIndicator color={colors.white} size="large" />
      ) : (
        <View style={styles.card}>
          <Text style={{ fontSize: 64 }}>{estado === "erro" ? "🤔" : "🔍"}</Text>
          <Text style={styles.titulo}>
            {estado === "ok" ? "QR code encontrado!" : estado === "ja" ? "Você já achou este QR!" : "Ops!"}
          </Text>
          <Text style={styles.texto}>
            {estado === "ok"
              ? "Missão concluída. Obrigada por visitar o RENMAP 💚"
              : estado === "ja"
              ? "Essa missão já está concluída. Bora para a próxima!"
              : erro}
          </Text>
          <TouchableOpacity style={styles.botao} onPress={() => router.replace("/(tabs)/missoes")}>
            <Text style={styles.botaoTexto}>Ver missões</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", padding: 24 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 24, alignItems: "center", alignSelf: "stretch" },
  titulo: { fontSize: 24, fontWeight: "900", color: colors.primary, marginTop: 8, textAlign: "center" },
  texto: { fontSize: 16, color: "#4A4A4A", textAlign: "center", marginVertical: 12 },
  botao: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignSelf: "stretch", alignItems: "center" },
  botaoTexto: { color: colors.white, fontWeight: "800", fontSize: 16 },
});
