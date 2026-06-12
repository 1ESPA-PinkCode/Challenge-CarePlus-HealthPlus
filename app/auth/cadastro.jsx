// app/auth/cadastro.jsx
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
import { Ionicons } from "@expo/vector-icons";
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

export default function Cadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function handleCPF(texto) {
    setCpf(formatarCPF(texto));
    setErro("");
  }

  async function handleCadastrar() {
    const cpfLimpo = cpf.replace(/[^\d]/g, "");

    if (nome.trim().length < 3) {
      setErro("Informe seu nome completo.");
      return;
    }
    if (!validarCPF(cpfLimpo)) {
      setErro("CPF inválido. Verifique e tente novamente.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const response = await fetch("https://health-plus-api.onrender.com/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), cpf: cpfLimpo, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        router.replace("/auth/login");
      } else {
        setErro(data.erro || "Erro ao criar conta. Tente novamente.");
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
        style={{ flex: 1, backgroundColor: colors.primary }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Topo */}
          <View style={styles.topSection}>
            <TouchableOpacity
              style={styles.voltarBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.titulo}>Criar conta</Text>
            <Text style={styles.subtitulo}>
              Preencha os dados abaixo para começar sua jornada
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.bottomSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor="#ccc"
                value={nome}
                onChangeText={(t) => { setNome(t); setErro(""); }}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>CPF</Text>
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

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.inputSenhaRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mínimo 6 caracteres"
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
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmar senha</Text>
              <View style={styles.inputSenhaRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Repita sua senha"
                  placeholderTextColor="#ccc"
                  value={confirmarSenha}
                  onChangeText={(t) => { setConfirmarSenha(t); setErro(""); }}
                  secureTextEntry={!mostrarConfirmar}
                />
                <TouchableOpacity
                  onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
                  style={styles.olhoBtn}
                >
                  <Ionicons
                    name={mostrarConfirmar ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}

            <TouchableOpacity
              style={styles.button}
              onPress={handleCadastrar}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.buttonText}>Criar conta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.loginBtn}
            >
              <Text style={styles.loginText}>Já tenho conta</Text>
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
    backgroundColor: colors.primary,
  },
  topSection: {
    paddingTop: 64,
    paddingHorizontal: 32,
    paddingBottom: 40,
    gap: 8,
  },
  voltarBtn: {
    marginBottom: 8,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.white,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.85,
    lineHeight: 20,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 48,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textDark,
    borderWidth: 1.5,
    borderColor: "#E0EDE8",
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
    color: "red",
    fontSize: 13,
    marginBottom: 12,
    fontWeight: "600",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  loginBtn: {
    alignItems: "center",
  },
  loginText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});