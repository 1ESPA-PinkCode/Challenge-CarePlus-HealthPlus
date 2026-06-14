// components/ModalAddMembro.jsx
import { Ionicons } from "@expo/vector-icons";
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
import { formatarCpf } from "../context/GruposContext";

export default function ModalAddMembro({ visivel, onFechar, onAdicionar }) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [erro, setErro] = useState("");

  function limpar() {
    setNome("");
    setCpf("");
    setErro("");
  }

  function handleSalvar() {
    const resultado = onAdicionar(nome, cpf);
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
              <Text style={styles.titulo}>Adicionar membro</Text>
              <TouchableOpacity onPress={handleFechar}>
                <Ionicons name="close" size={26} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitulo}>
              A pessoa precisa ter o convênio CarePlus (login por CPF).
            </Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#A8A8A8"
              value={nome}
              onChangeText={(t) => {
                setNome(t);
                setErro("");
              }}
            />

            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor="#A8A8A8"
              keyboardType="numeric"
              value={cpf}
              onChangeText={(t) => {
                setCpf(formatarCpf(t));
                setErro("");
              }}
              maxLength={14}
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
  label: { fontSize: 14, fontWeight: "700", color: colors.primary, marginBottom: 6, marginTop: 4 },
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
    marginTop: 6,
  },
  botaoTexto: { color: colors.white, fontSize: 16, fontWeight: "800" },
});