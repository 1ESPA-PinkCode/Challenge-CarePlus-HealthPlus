// app/auth/onboarding.jsx
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
  } from "react-native";
  import { useRouter } from "expo-router";
  import { colors } from "../../constants/colors";
  
  const { width } = Dimensions.get("window");
  
  export default function Onboarding() {
    const router = useRouter();
  
    function handleVamosLa() {
      router.replace("/auth/lgpd");
    }
  
    return (
      <View style={styles.container}>
        {/* Parte branca — título */}
        <View style={styles.topSection}>
          <Text style={styles.titulo}>
            Cuidar da saúde não{"\n"}precisa ser difícil...
          </Text>
          <Text style={styles.subtitulo}>
            Na Health Plus, cada pequeno passo vira uma conquista.
          </Text>
        </View>
  
        {/* Parte verde com curva — texto + botão */}
        <View style={styles.bottomSection}>
          <Text style={styles.texto}>
            Complete <Text style={styles.bold}>missões</Text>, acompanhe seu{" "}
            <Text style={styles.bold}>progresso</Text> e de seus amigos, evolua
            suas flores e receba{" "}
            <Text style={styles.bold}>recompensas</Text> enquanto cria{" "}
            <Text style={styles.bold}>hábitos</Text> que realmente fazem
            diferença na sua <Text style={styles.bold}>vida</Text>.
          </Text>
  
          <TouchableOpacity style={styles.button} onPress={handleVamosLa}>
            <Text style={styles.buttonText}>Vamos Lá!</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topSection: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      gap: 12,
    },
    titulo: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.primary,
      textAlign: "center",
      lineHeight: 34,
    },
    subtitulo: {
      fontSize: 15,
      color: colors.textDark,
      textAlign: "center",
      lineHeight: 22,
    },
    bottomSection: {
      flex: 1,
      backgroundColor: colors.primary,
      borderTopRightRadius: width * 0.4,
      paddingHorizontal: 40,
      paddingTop: 150,
      paddingBottom: 48,
      justifyContent: "space-between",
      alignItems: "center",
    },
    texto: {
      color: colors.white,
      fontSize: 15,
      lineHeight: 24,
      textAlign: "justify",
    },
    bold: {
      fontWeight: "800",
    },
    button: {
      backgroundColor: colors.white,
      borderRadius: 50,
      paddingVertical: 16,
      paddingHorizontal: 64,
      alignItems: "center",
    },
    buttonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "700",
    },
  });