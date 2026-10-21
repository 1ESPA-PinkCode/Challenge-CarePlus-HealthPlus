// components/FogosArtificio.jsx — fogos de artifício por cima da tela
// Use <FogosArtificio ativo={true} /> — dispara 5 explosões em sequência.
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";

const CORES = ["#1C9770", "#4FBFAE", "#8CC63F", "#F2B632", "#FFD84D", "#F27BA8", "#FFFFFF"];
const N_FAISCAS = 22;

function Explosao({ x, y, cor, atraso, raio }) {
  const t = useRef(new Animated.Value(0)).current;
  const subida = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(atraso),
      // foguete subindo
      Animated.timing(subida, { toValue: 1, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      // explosão
      Animated.timing(t, { toValue: 1, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const faiscas = useMemo(
    () =>
      Array.from({ length: N_FAISCAS }, (_, i) => {
        const ang = (i / N_FAISCAS) * Math.PI * 2;
        return { dx: Math.cos(ang) * raio, dy: Math.sin(ang) * raio, cor: i % 3 === 0 ? "#FFFFFF" : cor };
      }),
    []
  );

  const opFoguete = subida.interpolate({ inputRange: [0, 0.9, 1], outputRange: [1, 1, 0] });
  const yFoguete = subida.interpolate({ inputRange: [0, 1], outputRange: [260, 0] });
  const opFaisca = t.interpolate({ inputRange: [0, 0.05, 0.7, 1], outputRange: [0, 1, 0.9, 0] });

  return (
    <View style={[styles.ponto, { left: x, top: y }]} pointerEvents="none">
      <Animated.View style={[styles.foguete, { backgroundColor: cor, opacity: opFoguete, transform: [{ translateY: yFoguete }] }]} />
      {faiscas.map((f, i) => (
        <Animated.View
          key={i}
          style={[
            styles.faisca,
            {
              backgroundColor: f.cor,
              opacity: opFaisca,
              transform: [
                { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, f.dx] }) },
                // um pouquinho de gravidade no fim
                { translateY: t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, f.dy * 0.95, f.dy + 18] }) },
                { scale: t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.4, 1.2, 0.5] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function FogosArtificio({ ativo }) {
  const { width, height } = useWindowDimensions();
  const [rodada, setRodada] = useState(0);

  useEffect(() => {
    if (ativo) setRodada((r) => r + 1);
  }, [ativo]);

  const explosoes = useMemo(() => {
    if (!rodada) return [];
    return Array.from({ length: 8 }, (_, i) => ({
      id: `${rodada}-${i}`,
      x: width * (i % 2 ? 0.2 + Math.random() * 0.25 : 0.55 + Math.random() * 0.25),
      y: height * (0.1 + Math.random() * 0.75),
      cor: CORES[(i + rodada) % (CORES.length - 1)],
      atraso: i * 220,
      raio: 75 + Math.random() * 45,
    }));
  }, [rodada]);

  if (!ativo) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {explosoes.map((e) => (
        <Explosao key={e.id} {...e} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ponto: { position: "absolute", width: 0, height: 0 },
  foguete: { position: "absolute", width: 5, height: 14, borderRadius: 3, left: -2.5, top: -7 },
  faisca: { position: "absolute", width: 12, height: 12, borderRadius: 6, left: -6, top: -6, shadowColor: "#FFF7C2", shadowOpacity: 0.9, shadowRadius: 6 },
});
