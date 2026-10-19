// app/missao/respira.jsx — 1 minuto de respiração guiada com a Bloom
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TelaAtividade from "../../components/TelaAtividade";
import { colors } from "../../constants/colors";
import { useMissoes } from "../../context/MissoesContext";

const DURACAO = 60;
const FASES = [
  { texto: "Inspire...", seg: 4, escala: 1 },
  { texto: "Segure", seg: 2, escala: 1 },
  { texto: "Expire devagar...", seg: 6, escala: 0.55 },
];

export default function Respira() {
  const { concluirAuto } = useMissoes();
  const [rodando, setRodando] = useState(false);
  const [restante, setRestante] = useState(DURACAO);
  const [fase, setFase] = useState(0);
  const [fim, setFim] = useState(false);
  const escala = useRef(new Animated.Value(0.55)).current;

  // cronômetro
  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => setRestante((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [rodando]);

  useEffect(() => {
    if (rodando && restante <= 0) {
      setRodando(false);
      setFim(true);
      concluirAuto("respira");
    }
  }, [restante, rodando]);

  // ciclo das fases com animação do círculo
  useEffect(() => {
    if (!rodando) return;
    const f = FASES[fase];
    Animated.timing(escala, {
      toValue: f.escala,
      duration: f.seg * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
    const t = setTimeout(() => setFase((x) => (x + 1) % FASES.length), f.seg * 1000);
    return () => clearTimeout(t);
  }, [fase, rodando]);

  function comecar() {
    setRestante(DURACAO);
    setFase(0);
    setFim(false);
    setRodando(true);
  }

  return (
    <TelaAtividade titulo="Respira com a Bloom">
      <View style={styles.centro}>
        <Text style={styles.instrucao}>
          {fim
            ? "Prontinho! Você tirou um minuto só pra você 💚"
            : rodando
            ? FASES[fase].texto
            : "Encontre uma posição confortável e acompanhe o círculo por 1 minuto."}
        </Text>

        <View style={styles.circuloArea}>
          <Animated.View style={[styles.circulo, { transform: [{ scale: escala }] }]} />
          <Text style={styles.tempo}>{fim ? "🌸" : `${restante}s`}</Text>
        </View>

        {!rodando && (
          <TouchableOpacity style={styles.botao} onPress={comecar}>
            <Text style={styles.botaoTexto}>{fim ? "Respirar de novo" : "Começar"}</Text>
          </TouchableOpacity>
        )}
        {rodando && <Text style={styles.dica}>Mantenha esta tela aberta até o fim</Text>}
      </View>
    </TelaAtividade>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "space-around" },
  instrucao: { fontSize: 22, fontWeight: "800", color: colors.primary, textAlign: "center", minHeight: 60 },
  circuloArea: { width: 260, height: 260, alignItems: "center", justifyContent: "center" },
  circulo: { position: "absolute", width: 260, height: 260, borderRadius: 130, backgroundColor: colors.green4, opacity: 0.7 },
  tempo: { fontSize: 40, fontWeight: "900", color: colors.white },
  botao: { backgroundColor: colors.primary, borderRadius: 30, paddingVertical: 16, paddingHorizontal: 48 },
  botaoTexto: { color: colors.white, fontSize: 18, fontWeight: "800" },
  dica: { color: "#8A8A8A", fontSize: 14 },
});
