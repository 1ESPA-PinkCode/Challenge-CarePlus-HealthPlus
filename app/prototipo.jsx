// app/prototipo.jsx — comparação: flor atual x flor nova (protótipo)
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FlorAnimada from "../components/FlorAnimada";
import FlorNova from "../components/FlorNova";
import TelaAtividade from "../components/TelaAtividade";
import { colors } from "../constants/colors";

const ESTAGIOS = [
  ["Semente", 0],
  ["Broto", 0.2],
  ["Muda", 0.45],
  ["Botão", 0.7],
  ["Florida", 1],
];

export default function Prototipo() {
  const [alvo, setAlvo] = useState(0.2);
  const [festa, setFesta] = useState(0);

  function concluirMissao() {
    setAlvo((a) => Math.min(1, +(a + 0.2).toFixed(2)));
    setFesta((f) => f + 1);
  }

  return (
    <TelaAtividade titulo="Protótipo das flores">
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.titulo}>Nova flor ✨</Text>
        <View style={styles.cardNovo}>
          <FlorNova target={alvo} celebrar={festa} size={300} />
        </View>

        <TouchableOpacity style={styles.botaoFesta} onPress={concluirMissao}>
          <Text style={styles.botaoTexto}>🌸 Simular missão concluída</Text>
        </TouchableOpacity>

        <View style={styles.estagios}>
          {ESTAGIOS.map(([nome, v]) => (
            <TouchableOpacity key={nome} style={[styles.chip, alvo === v && styles.chipAtivo]} onPress={() => setAlvo(v)}>
              <Text style={[styles.chipTexto, alvo === v && { color: colors.white }]}>{nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.titulo}>Flor atual</Text>
        <View style={styles.cardAtual}>
          <FlorAnimada tipo="girassol" target={alvo} showLabel={false} size={240} />
        </View>
      </ScrollView>
    </TelaAtividade>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 18, fontWeight: "900", color: colors.primary, marginBottom: 8, marginTop: 6 },
  cardNovo: { borderRadius: 24, overflow: "hidden", alignItems: "center", borderWidth: 2, borderColor: colors.green3 },
  cardAtual: { borderRadius: 24, backgroundColor: "#EAF3DC", alignItems: "center", paddingVertical: 8 },
  botaoFesta: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 14, alignItems: "center", marginTop: 14 },
  botaoTexto: { color: colors.white, fontWeight: "800", fontSize: 16 },
  estagios: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.primary },
  chipAtivo: { backgroundColor: colors.primary },
  chipTexto: { color: colors.primary, fontWeight: "700" },
});
