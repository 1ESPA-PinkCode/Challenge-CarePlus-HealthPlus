// app/missao/alongamento.jsx — 2 minutos de alongamento guiado
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BarraProgresso from "../../components/BarraProgresso";
import TelaAtividade from "../../components/TelaAtividade";
import { colors } from "../../constants/colors";
import { useMissoes } from "../../context/MissoesContext";
import Icone from "../../components/Icone";

const PASSOS = [
  { icone: "person-circle-outline", titulo: "Pescoço", texto: "Incline a cabeça devagar para a direita e depois para a esquerda." },
  { icone: "sync-outline", titulo: "Ombros", texto: "Gire os ombros para trás em círculos lentos." },
  { icone: "arrow-up-circle-outline", titulo: "Braços para cima", texto: "Entrelace os dedos e estique os braços acima da cabeça." },
  { icone: "swap-horizontal-outline", titulo: "Lateral", texto: "Com os braços para cima, incline o tronco para um lado e depois para o outro." },
  { icone: "walk-outline", titulo: "Pernas", texto: "Segure um pé atrás, perto do glúteo, e troque de perna na metade do tempo." },
  { icone: "leaf-outline", titulo: "Respire", texto: "Solte o corpo, sacuda as mãos e respire fundo três vezes." },
];
const SEG = 20;

export default function Alongamento() {
  const { concluirAuto } = useMissoes();
  const [indice, setIndice] = useState(-1); // -1 = não começou
  const [restante, setRestante] = useState(SEG);
  const fim = indice >= PASSOS.length;

  useEffect(() => {
    if (indice < 0 || fim) return;
    const t = setInterval(() => setRestante((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [indice, fim]);

  useEffect(() => {
    if (indice >= 0 && !fim && restante <= 0) {
      setRestante(SEG);
      setIndice((i) => i + 1);
    }
  }, [restante]);

  useEffect(() => {
    if (fim) concluirAuto("alongamento");
  }, [fim]);

  const passo = PASSOS[indice];
  const total = PASSOS.length * SEG;
  const feito = indice < 0 ? 0 : Math.min(total, indice * SEG + (SEG - restante));

  return (
    <TelaAtividade titulo="Alongamento relâmpago">
      <View style={styles.centro}>
        {indice < 0 && (
          <>
            <Icone nome="body-outline" tamanho={120} tom="claro" />
            <Text style={styles.titulo}>2 minutos, 6 movimentos</Text>
            <Text style={styles.texto}>Faça cada movimento com calma, sem forçar. Mantenha esta tela aberta.</Text>
          </>
        )}
        {passo && (
          <>
            <Text style={styles.contador}>{indice + 1} de {PASSOS.length}</Text>
            <Icone nome={passo.icone} tamanho={120} tom="agua" />
            <Text style={styles.titulo}>{passo.titulo}</Text>
            <Text style={styles.texto}>{passo.texto}</Text>
            <Text style={styles.tempo}>{restante}s</Text>
          </>
        )}
        {fim && (
          <>
            <Icone nome="flower" tamanho={120} tom="verde" />
            <Text style={styles.titulo}>Corpo renovado!</Text>
            <Text style={styles.texto}>Que bom que você parou um pouquinho pra cuidar de você.</Text>
          </>
        )}

        <View style={{ alignSelf: "stretch" }}>
          <BarraProgresso progress={feito / total} height={10} />
        </View>

        {(indice < 0 || fim) && (
          <TouchableOpacity
            style={styles.botao}
            onPress={() => {
              setRestante(SEG);
              setIndice(0);
            }}
          >
            <Text style={styles.botaoTexto}>{fim ? "Fazer de novo" : "Começar"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TelaAtividade>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "space-evenly" },
  contador: { color: "#8A8A8A", fontWeight: "700" },
  emoji: { fontSize: 90 },
  titulo: { fontSize: 26, fontWeight: "900", color: colors.primary, textAlign: "center" },
  texto: { fontSize: 17, color: "#3A3A3A", textAlign: "center", lineHeight: 24, paddingHorizontal: 8 },
  tempo: { fontSize: 44, fontWeight: "900", color: colors.green4 },
  botao: { backgroundColor: colors.primary, borderRadius: 30, paddingVertical: 16, paddingHorizontal: 48 },
  botaoTexto: { color: colors.white, fontSize: 18, fontWeight: "800" },
});
