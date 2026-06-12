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
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import { colors } from "../../constants/colors";

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
  const [erro, setErro] = useState("");

  function handleCPF(texto) {
    setCpf(formatarCPF(texto));
    setErro("");
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
      const response = await fetch("https://health-plus-api.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpfLimpo, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        if (lembrar) {
          await AsyncStorage.setItem("@healthplus:usuario", JSON.stringify(data));
        }
        router.replace("/(tabs)");
      } else {
        setErro(data.erro || "CPF ou senha incorretos.");
      }
    } catch (e) {
      setErro("Erro de conexão. Verifique sua internet.");
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
              source={require("../../assets/images/logo.png")}
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
                  {lembrar && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.lembrarText}>Lembrar-me</Text>
              </TouchableOpacity>

              <TouchableOpacity>
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
});