// app/auth/login.jsx
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { mensagemErro } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import { colors } from "../../constants/colors";
import { useUsuario } from "../../context/UsuarioContext";

const { width } = Dimensions.get("window");

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

function formatarCPF(texto) {
  const numeros = texto.replace(/[^\d]/g, "").slice(0, 11);
  if (numeros.length <= 3) return numeros;
  if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}

export default function Login() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { entrar } = useUsuario();
  const [erro, setErro] = useState("");
  // Estados do modal de recuperação de senha
  const [modalVisivel, setModalVisivel] = useState(false);
  const [cpfRecupera, setCpfRecupera] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [sucessoModal, setSucessoModal] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);

  function handleCPF(texto) {
    setCpf(formatarCPF(texto));
    setErro("");
  }

  // Recuperação: sem e-mail cadastrado, a troca é feita pela equipe no estande
  function handleRecuperarSenha() {
    setModalVisivel(false);
  }

  async function handleEntrar() {
    const cpfLimpo = cpf.replace(/[^\d]/g, "");

    if (!validarCPF(cpfLimpo)) {
      setErro("CPF inválido. Verifique e tente novamente.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      await entrar(cpfLimpo, senha);
      router.replace("/(tabs)");
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Topo branco — logo */}
          <View style={styles.topSection}>
            <Image
              source={require("../../assets/images/logo_verde_transparente.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Parte verde — formulário */}
          <View style={styles.bottomSection}>
            <Text style={styles.titulo}>Login</Text>

            {/* CPF */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Número de identificação</Text>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#ccc"
                value={cpf}
                onChangeText={handleCPF}
                keyboardType="numeric"
                maxLength={14}
              />
            </View>

            {/* Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.inputSenhaRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#ccc"
                  value={senha}
                  onChangeText={(t) => { setSenha(t); setErro(""); }}
                  secureTextEntry={!mostrarSenha}
                />
                <TouchableOpacity
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                  style={styles.olhoBtn}
                >
                  <Ionicons
                    name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Erro */}
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}

            {/* Lembrar + Esqueceu */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setLembrar(!lembrar)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, lembrar && styles.checkboxChecked]}>
                  {lembrar && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                </View>
                <Text style={styles.lembrarText}>Lembrar-me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisivel(true)}>
                <Text style={styles.esqueceuText}>Esqueceu sua senha?</Text>
              </TouchableOpacity>

            </View>

            {/* Botão entrar */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleEntrar}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            {/* Criar conta */}
            <TouchableOpacity
              onPress={() => router.push("/auth/cadastro")}
              style={styles.criarContaBtn}
            >
              <Text style={styles.criarContaText}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Modal de recuperação de senha */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Recuperar senha</Text>
            <Text style={styles.modalSubtitulo}>
              Esqueceu a senha? Procure a equipe Health Plus no estande do evento que a gente te ajuda a
              recuperar o acesso, ou crie uma nova conta com outro CPF.
            </Text>

            {/* Botões */}
            <TouchableOpacity
              style={styles.modalBotao}
              onPress={handleRecuperarSenha}
              activeOpacity={0.8}
            >
              {loadingModal ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.modalBotaoText}>Entendi</Text>
              )}
            </TouchableOpacity>


          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topSection: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  logo: {
    width: 160,
    height: 160,
  },
  bottomSection: {
    flex: 1.4,
    backgroundColor: colors.primary,
    borderTopLeftRadius: width * 0.3,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 48,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.white,
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.white,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textDark,
  },
  inputSenhaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  olhoBtn: {
    padding: 4,
  },
  erro: {
    color: "#FFD0D0",
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 4,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.white,
  },
  checkmark: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  lembrarText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  esqueceuText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: colors.white,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  criarContaBtn: {
    alignItems: "center",
  },
  criarContaText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: "100%",
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 6,
  },
  modalSubtitulo: {
    fontSize: 13,
    color: colors.inactive,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textDark,
    marginBottom: 14,
  },
  modalErro: {
    color: "#E53935",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  modalSucesso: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  modalBotao: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  modalBotaoText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  modalCancelar: {
    alignItems: "center",
    paddingVertical: 8,
  },
  modalCancelarText: {
    color: colors.inactive,
    fontSize: 14,
    fontWeight: "600",
  },
});