import { View, Image, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { useGemas } from "../contexts/GemsContext";

export default function Header() {
  const insets = useSafeAreaInsets();
  const { gemas } = useGemas();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.gemPill}>
        <Text style={styles.gemText}>{gemas}</Text>
        <Image
          source={require("../assets/images/gema.png")}
          style={styles.gem}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 100,
    height: 64,
  },
  gemPill: {
    backgroundColor: colors.white,
    height: 35,
    borderRadius: 17,
    paddingLeft: 10,
    paddingRight: 60,
    justifyContent: "center",
  },
  gemText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 22,
  },
  gem: {
    position: "absolute",
    right: -25,
    width: 90,
    height: 90,
  },
});