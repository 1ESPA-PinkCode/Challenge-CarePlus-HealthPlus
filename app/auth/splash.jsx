// app/auth/splash.jsx
import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../constants/colors";

const { width } = Dimensions.get("window");

export default function Splash() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  function handleIniciar() {
    router.replace("/auth/onboarding");
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <View style={styles.bottomSection}>
        <Animated.View style={{ opacity: fadeAnim, flex: 1, justifyContent: "space-between" }}>
          <Text style={styles.bodyText}>
            Nossa missão é tornar o autocuidado mais simples e motivador. Aqui,
            você acompanha seus hábitos, cumpre missões, evolui sua flor, cria
            seu jardim e ganha recompensas reais enquanto cuida de você.
          </Text>
          <Text style={styles.subText}>Vamos iniciar sua jornada?</Text>

          <TouchableOpacity style={styles.button} onPress={handleIniciar}>
            <Text style={styles.buttonText}>Iniciar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topSection: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: width * 0.4,
  },
  logo: {
    width: 180,
    height: 180,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 40,
},
bodyText: {
  fontSize: 15,
  color: colors.primary,
  lineHeight: 24,
  textAlign: "justify",
},
subText: {
  fontSize: 15,
  color: colors.primary,
  fontWeight: "600",
  marginTop: 16,
},
button: {
  backgroundColor: colors.primary,
  borderRadius: 50,
  paddingVertical: 16,
  alignItems: "center",
  marginTop: 24,
},
buttonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "700",
},
});