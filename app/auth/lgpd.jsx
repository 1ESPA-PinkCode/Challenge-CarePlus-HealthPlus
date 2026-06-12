// app/auth/lgpd.jsx
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../constants/colors";

const { width } = Dimensions.get("window");

export default function LGPD() {
  const router = useRouter();
  const [termos, setTermos] = useState(false);
  const [privacidade, setPrivacidade] = useState(false);
  const [bemestar, setBemestar] = useState(false);

  async function handleContinuar() {
    if (!termos || !privacidade) return;
    await AsyncStorage.setItem("@healthplus:onboarding", "true");
    router.replace("/auth/login");
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.titulo}>Seus dados, sua privacidade</Text>
        <Text style={styles.subtitulo}>
          Para continuar, precisamos do seu consentimento para tratar algumas
          informações de uso e bem-estar. Seus dados são protegidos conforme a
          LGPD e você pode alterar ou retirar essas permissões a qualquer
          momento em Configurações › Privacidade.
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Checkbox
            checked={termos}
            onPress={() => setTermos(!termos)}
            titulo="Li e concordo com os Termos de Uso"
            descricao="Permite utilizar o app conforme as regras e condições apresentadas."
            obrigatorio
          />
          <Checkbox
            checked={privacidade}
            onPress={() => setPrivacidade(!privacidade)}
            titulo="Li e aceito a Política de Privacidade"
            descricao="Autoriza o tratamento dos seus dados pessoais conforme descrito no documento oficial."
            obrigatorio
          />
          <Checkbox
            checked={bemestar}
            onPress={() => setBemestar(!bemestar)}
            titulo="Autorizo o uso dos meus dados de bem-estar"
            descricao="Usaremos informações fornecidas por você (como hábitos, missões e progresso) para personalizar sua experiência no app."
          />
        </ScrollView>

        <TouchableOpacity
          style={[styles.button, (!termos || !privacidade) && styles.buttonDisabled]}
          onPress={handleContinuar}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Checkbox({ checked, onPress, titulo, descricao, obrigatorio }) {
  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.checkboxTexto}>
        <Text style={styles.checkboxTitulo}>{titulo}</Text>
        <Text style={styles.checkboxDescricao}>{descricao}</Text>
        {obrigatorio && (
          <Text style={styles.obrigatorio}>* Obrigatório</Text>
        )}
      </View>
    </TouchableOpacity>
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
    paddingBottom: 48,
    gap: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 13,
    color: colors.white,
    lineHeight: 20,
    textAlign: "justify",
    opacity: 0.9,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: width * 0.2,
    borderTopRightRadius: width * 0.2,
    paddingHorizontal: 32,
    paddingTop: 70,
    paddingBottom: 40,
  },
  checkboxRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  checkboxTexto: {
    flex: 1,
    gap: 4,
  },
  checkboxTitulo: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
  },
  checkboxDescricao: {
    fontSize: 13,
    color: colors.textDark,
    lineHeight: 18,
  },
  obrigatorio: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});