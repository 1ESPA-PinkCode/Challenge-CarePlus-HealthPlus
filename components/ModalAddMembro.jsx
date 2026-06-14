// components/ModalAddMembro.jsx
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import {
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

export default function ModalAddMembro({ visivel, onFechar, onAdicionar, codigoConvite }) {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);

  const link = `healthplus.app/grupo/${codigoConvite}`;

  function limpar() {
    setNome("");
    setErro("");
    setCopiado(false);
  }

  async function copiarLink() {
    await Clipboard.setStringAsync(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function handleSalvar() {
    const resultado = onAdicionar(nome);
    if (resultado.ok) {
      limpar();
      onFechar();
    } else {
      setErro(resultado.erro);
    }
  }

  function handleFechar() {
    limpar();
    onFechar();
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={handleFechar}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.card}>
            <View style={styles.topo}>
              <Text style={styles.titulo}>Convidar para o grupo</Text>
              <TouchableOpacity onPress={handleFechar}>
                <Ionicons name="close" size={26} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitulo}>
              Compartilhe o link de convite com seus amigos do CarePlus.
            </Text>

            {/* link de convite */}
            <View style={styles.linkBox}>
              <Text style={styles.linkTexto} numberOfLines={1}>{link}</Text>
            </View>

            <TouchableOpacity style={styles.btnCopiar} onPress={copiarLink} activeOpacity={0.85}>
              <Ionicons
                name={copiado ? "checkmark" : "copy-outline"}
                size={18}
                color={colors.white}
              />
              <Text style={styles.btnCopiarTexto}>
                {copiado ? "Link copiado!" : "Copiar link de convite"}
              </Text>
            </TouchableOpacity>

            {/* divisória */}
            <View style={styles.divisor}>
              <View style={styles.linha} />
              <Text style={styles.divisorTexto}>ou adicione direto</Text>
              <View style={styles.linha} />
            </View>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da pessoa"
              placeholderTextColor="#A8A8A8"
              value={nome}
              onChangeText={(t) => {
                setNome(t);
                setErro("");
              }}
            />

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}

            <TouchableOpacity style={styles.botao} onPress={handleSalvar} activeOpacity={0.85}>
              <Text style={styles.botaoTexto}>Adicionar ao grupo</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 22,
  },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  titulo: { fontSize: 20, fontWeight: "800", color: colors.primary },
  subtitulo: { fontSize: 13, color: "#6A6A6A", marginBottom: 16 },

  linkBox: {
    backgroundColor: "#EAF3DC",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  linkTexto: { fontSize: 15, fontWeight: "700", color: colors.primary },

  btnCopiar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
  },
  btnCopiarTexto: { color: colors.white, fontSize: 15, fontWeight: "800" },

  divisor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 18,
  },
  linha: { flex: 1, height: 1, backgroundColor: colors.green3 },
  divisorTexto: { fontSize: 13, color: "#9AA98C", fontWeight: "600" },

  label: { fontSize: 14, fontWeight: "700", color: colors.primary, marginBottom: 6 },
  input: {
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
  botao: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 2,
  },
  botaoTexto: { color: colors.white, fontSize: 16, fontWeight: "800" },
});