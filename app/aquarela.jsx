// app/aquarela.jsx — prévia das flores em aquarela (só para aprovação)
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FlorAquarela from "../components/FlorAquarela";
import TelaAtividade from "../components/TelaAtividade";
import { colors } from "../constants/colors";

const TIPOS = [["girassol", "Girassol"], ["margarida", "Margarida"], ["tulipa", "Tulipa"], ["rosa", "Rosa"]];
const ESTAGIOS = [["Semente", 0.02], ["Broto", 0.18], ["Muda", 0.45], ["Botão", 0.72], ["Abrindo", 0.86], ["Florida", 1]];

export default function Aquarela() {
  const [tipo, setTipo] = useState("girassol");
  const [alvo, setAlvo] = useState(1);
  const [festa, setFesta] = useState(0);
  return (
    <TelaAtividade titulo="Flores em aquarela">
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.linha}>
          {TIPOS.map(([id, nome]) => (
            <TouchableOpacity key={id} style={[styles.chip, tipo === id && styles.chipOn]} onPress={() => setTipo(id)}>
              <Text style={[styles.chipTxt, tipo === id && { color: colors.white }]}>{nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.palco}>
          <FlorAquarela tipo={tipo} target={alvo} size={300} celebrar={festa} />
        </View>
        <View style={styles.linha}>
          {ESTAGIOS.map(([nome, v]) => (
            <TouchableOpacity key={nome} style={[styles.chip, alvo === v && styles.chipOn]} onPress={() => setAlvo(v)}>
              <Text style={[styles.chipTxt, alvo === v && { color: colors.white }]}>{nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.botao} onPress={() => setFesta((f) => f + 1)}>
          <Text style={styles.botaoTxt}>Simular missão concluída</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Todos os estágios</Text>
        {TIPOS.map(([id]) => (
          <View key={id} style={styles.grade}>
            {ESTAGIOS.map(([nome, v]) => (
              <View key={nome} style={styles.celula}>
                <FlorAquarela tipo={id} target={v} size={104} animar={false} />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </TelaAtividade>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.primary },
  chipOn: { backgroundColor: colors.primary },
  chipTxt: { color: colors.primary, fontWeight: "700" },
  palco: { backgroundColor: "#F6F1E6", borderRadius: 24, alignItems: "center" },
  botao: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  botaoTxt: { color: colors.white, fontWeight: "800" },
  titulo: { fontSize: 18, fontWeight: "900", color: colors.primary, marginTop: 18, marginBottom: 6 },
  grade: { flexDirection: "row", flexWrap: "wrap", backgroundColor: "#F6F1E6", borderRadius: 16, marginBottom: 8 },
  celula: { width: "33.3%", alignItems: "center" },
});
