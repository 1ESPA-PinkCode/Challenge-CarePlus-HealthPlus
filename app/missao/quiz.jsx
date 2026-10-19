// app/missao/quiz.jsx — quiz de autocuidado (acerte 3 de 3)
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TelaAtividade from "../../components/TelaAtividade";
import { colors } from "../../constants/colors";
import { useMissoes } from "../../context/MissoesContext";

const PERGUNTAS = [
  { p: "Quanto de água um adulto deve beber por dia, em média?", o: ["500 ml", "Cerca de 2 litros", "5 litros"], c: 1, e: "A recomendação geral fica em torno de 2 litros, variando com o calor e a atividade física." },
  { p: "Quantas horas de sono um adulto precisa por noite?", o: ["4 a 5 horas", "7 a 9 horas", "11 a 12 horas"], c: 1, e: "Entre 7 e 9 horas por noite é o recomendado para adultos." },
  { p: "Quanto de atividade física por semana a OMS recomenda para adultos?", o: ["30 minutos", "150 a 300 minutos", "1.000 minutos"], c: 1, e: "A OMS recomenda de 150 a 300 minutos de atividade moderada por semana." },
  { p: "O que ajuda a reduzir o estresse rapidamente?", o: ["Respiração lenta e profunda", "Tomar mais café", "Ficar mais tempo no celular"], c: 0, e: "Respirar devagar ativa o sistema que acalma o corpo." },
  { p: "Por que fazer consultas e exames de rotina?", o: ["Só serve quando já estamos doentes", "Para prevenir e detectar problemas cedo", "Não faz diferença"], c: 1, e: "A prevenção é o centro do autocuidado: quanto mais cedo, mais simples de tratar." },
  { p: "Qual destes lanches é o mais equilibrado?", o: ["Refrigerante e salgadinho", "Fruta com castanhas", "Só um doce"], c: 1, e: "Fruta com castanhas combina fibras, vitaminas e gorduras boas." },
  { p: "Usar telas logo antes de dormir...", o: ["Melhora o sono", "Pode atrapalhar o sono", "Não muda nada"], c: 1, e: "A luz e os estímulos das telas podem atrasar o sono." },
  { p: "De quanto em quanto tempo é bom levantar quando se passa muito tempo sentado?", o: ["A cada 30 a 60 minutos", "Uma vez por dia", "Nunca"], c: 0, e: "Pausas a cada 30 a 60 minutos ajudam a circulação e a postura." },
];

const sortear = () => [...PERGUNTAS].sort(() => Math.random() - 0.5).slice(0, 3);

export default function Quiz() {
  const { concluirAuto } = useMissoes();
  const [perguntas, setPerguntas] = useState(sortear);
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState(null);
  const [acertos, setAcertos] = useState(0);
  const [resultado, setResultado] = useState(null); // "ganhou" | "errou"

  const q = perguntas[i];

  function responder(idx) {
    if (escolha !== null) return;
    setEscolha(idx);
    if (idx === q.c) setAcertos((a) => a + 1);
  }

  function proxima() {
    const totalAcertos = acertos;
    if (i < perguntas.length - 1) {
      setI(i + 1);
      setEscolha(null);
      return;
    }
    if (totalAcertos === perguntas.length) {
      setResultado("ganhou");
      concluirAuto("quiz");
    } else setResultado("errou");
  }

  function reiniciar() {
    setPerguntas(sortear());
    setI(0);
    setEscolha(null);
    setAcertos(0);
    setResultado(null);
  }

  if (resultado) {
    return (
      <TelaAtividade titulo="Quiz de autocuidado">
        <View style={styles.centro}>
          <Text style={{ fontSize: 80 }}>{resultado === "ganhou" ? "🏆" : "🌱"}</Text>
          <Text style={styles.titulo}>{resultado === "ganhou" ? "Acertou tudo!" : `Você acertou ${acertos} de 3`}</Text>
          <Text style={styles.texto}>
            {resultado === "ganhou" ? "Você manda bem no autocuidado!" : "Quase! Tente de novo com novas perguntas."}
          </Text>
          {resultado === "errou" && (
            <TouchableOpacity style={styles.botao} onPress={reiniciar}>
              <Text style={styles.botaoTexto}>Tentar de novo</Text>
            </TouchableOpacity>
          )}
        </View>
      </TelaAtividade>
    );
  }

  return (
    <TelaAtividade titulo="Quiz de autocuidado">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.contador}>Pergunta {i + 1} de 3</Text>
        <Text style={styles.pergunta}>{q.p}</Text>
        {q.o.map((op, idx) => {
          const certa = escolha !== null && idx === q.c;
          const errada = escolha === idx && idx !== q.c;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.opcao, certa && styles.opcaoCerta, errada && styles.opcaoErrada]}
              onPress={() => responder(idx)}
              activeOpacity={0.8}
            >
              <Text style={[styles.opcaoTexto, (certa || errada) && { color: colors.white }]}>{op}</Text>
            </TouchableOpacity>
          );
        })}
        {escolha !== null && (
          <>
            <Text style={styles.explicacao}>
              {escolha === q.c ? "✅ Isso aí! " : "❌ Não foi dessa vez. "}
              {q.e}
            </Text>
            <TouchableOpacity style={styles.botao} onPress={proxima}>
              <Text style={styles.botaoTexto}>{i < 2 ? "Próxima" : "Ver resultado"}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </TelaAtividade>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  contador: { color: "#8A8A8A", fontWeight: "700", marginBottom: 8 },
  pergunta: { fontSize: 22, fontWeight: "800", color: "#1A1A1A", marginBottom: 20, lineHeight: 30 },
  opcao: { borderWidth: 2, borderColor: colors.green3, borderRadius: 16, padding: 16, marginBottom: 12 },
  opcaoCerta: { backgroundColor: colors.primary, borderColor: colors.primary },
  opcaoErrada: { backgroundColor: "#E57373", borderColor: "#E57373" },
  opcaoTexto: { fontSize: 17, fontWeight: "700", color: colors.primary },
  explicacao: { fontSize: 15, color: "#3A3A3A", lineHeight: 22, marginVertical: 12 },
  titulo: { fontSize: 26, fontWeight: "900", color: colors.primary, textAlign: "center" },
  texto: { fontSize: 17, color: "#3A3A3A", textAlign: "center" },
  botao: { backgroundColor: colors.primary, borderRadius: 30, paddingVertical: 16, alignItems: "center", alignSelf: "stretch", marginTop: 8 },
  botaoTexto: { color: colors.white, fontSize: 18, fontWeight: "800" },
});
