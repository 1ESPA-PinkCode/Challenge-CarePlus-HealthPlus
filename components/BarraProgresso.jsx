// components/BarraProgresso.jsx
import { View, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function BarraProgresso({ progress = 0, height = 10, fillColor }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          { width: `${pct}%`, borderRadius: height / 2, backgroundColor: fillColor || colors.primary },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: "100%", backgroundColor: "#E4EFE4", overflow: "hidden" },
  fill: { height: "100%" },
});