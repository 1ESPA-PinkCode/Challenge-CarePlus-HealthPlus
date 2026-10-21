// components/ModalAddMembro.jsx — entrar num grupo pelo código ou criar um novo
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../constants/colors";

export default function ModalAddMembro({ visivel, onFechar, onEntrar, onCriar, codigoInicial, modoInicial }) {
  const [modo, setModo] = useState("entrar"); // "entrar" | "criar"
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (visivel && modoInicial) setModo(modoInicial);
  }, [visivel, modoInicial]);

  useEffect(() => {
    if (visivel && codigoInicial) {
      setModo("entrar");
      setValor(codigoInicial);
    }
  }, [visivel, codigoInicial]);

  function fechar() {
    setValor("");
    setErro("");
    setCarregando(false);
    onFechar();
  }

  async function confirmar() {
    const texto = valor.trim();
    if (modo === "entrar" && texto.length < 5) return setErro("Digite o código de convite (ex.: PINK-7K2F).");
    if (modo === "criar" && texto.length < 2) return setErro("Dê um nome para o grupo.");
    setCarregando(true);
    const r = modo === "entrar" ? await onEntrar(texto) : await onCriar(texto);
    setCarregando(false);
    if (r.ok) fechar();
    else setErro(r.erro);
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={fechar}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.card}>
            <View style={styles.topo}>
              <Text style={styles.titulo}>{modo === "entrar" ? "Entrar em um grupo" : "Criar grupo"}</Text>
              <TouchableOpacity onPress={fechar}>
                <Ionicons name="close" size={26} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.abas}>
              {[
                ["entrar", "Tenho um código"],
                ["criar", "Criar novo"],
              ].map(([id, label]) => (
                <TouchableOpacity
                  key={id}
                  style={[styles.aba, modo === id && styles.abaAtiva]}
                  onPress={() => {
                    setModo(id);
                    setValor("");
                    setErro("");
                  }}
                >
                  <Text style={[styles.abaTexto, modo === id && styles.abaTextoAtivo]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.subtitulo}>
              {modo === "entrar"
                ? "Peça o código para quem criou o grupo e digite abaixo."
                : "Depois de criar, compartilhe o código com seus amigos do CarePlus."}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={modo === "entrar" ? "PINK-7K2F" : "Nome do grupo"}
              placeholderTextColor="#A8A8A8"
              autoCapitalize={modo === "entrar" ? "characters" : "words"}
              value={valor}
              onChangeText={(t) => {
                setValor(t);
                setErro("");
              }}
              onSubmitEditing={confirmar}
            />

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}

            <TouchableOpacity style={styles.botao} onPress={confirmar} activeOpacity={0.85} disabled={carregando}>
              {carregando ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.botaoTexto}>{modo === "entrar" ? "Entrar no grupo" : "Criar grupo"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", paddingHorizontal: 24 },
  card: { backgroundColor: colors.white, borderRadius: 22, padding: 22 },
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  titulo: { fontSize: 20, fontWeight: "800", color: colors.primary },
  abas: { flexDirection: "row", backgroundColor: "#EAF3DC", borderRadius: 12, padding: 4, marginBottom: 14 },
  aba: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  abaAtiva: { backgroundColor: colors.primary },
  abaTexto: { fontWeight: "700", color: colors.primary, fontSize: 14 },
  abaTextoAtivo: { color: colors.white },
  subtitulo: { fontSize: 13, color: "#6A6A6A", marginBottom: 12 },
  input: {
    minWidth: 0,
    borderWidth: 1.5,
    borderColor: colors.green3,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 12,
  },
  erro: { color: "#C0392B", fontSize: 14, marginBottom: 10, fontWeight: "600" },
  botao: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  botaoTexto: { color: colors.white, fontSize: 16, fontWeight: "800" },
});
