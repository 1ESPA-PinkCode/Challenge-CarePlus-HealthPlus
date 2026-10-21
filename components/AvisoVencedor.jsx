// components/AvisoVencedor.jsx — quando a gincana acaba, avisa o resultado
// Vencedor: tela "Você ganhou!" com fogos + notificação do celular (se permitida).
// Demais participantes: aviso com a posição final.
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import { useUsuario } from "../context/UsuarioContext";
import { useEvento } from "../lib/evento";
import { notificar, registrarServiceWorker } from "../lib/notificacoes";
import { supabase } from "../lib/supabase";
import FogosArtificio from "./FogosArtificio";
import Icone from "./Icone";

const lerFlag = (k) => {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(k) === "1";
  } catch (e) {
    return false;
  }
};
const gravarFlag = (k) => {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(k, "1");
  } catch (e) {}
};

export default function AvisoVencedor() {
  const { perfil } = useUsuario();
  const { status } = useEvento();
  const router = useRouter();
  const [resultado, setResultado] = useState(null); // { posicao, venceu }
  const conferindo = useRef(false);
  const chave = perfil ? `@healthplus:resultado:${perfil.id}` : null;

  useEffect(() => {
    registrarServiceWorker();
  }, []);

  useEffect(() => {
    if (status !== "encerrado" || !perfil || perfil.equipe || !chave || lerFlag(chave) || conferindo.current) return;
    conferindo.current = true;
    supabase.rpc("ranking_evento", { p_limite: 1 }).then(({ data }) => {
      conferindo.current = false;
      const eu = (data || []).find((l) => l.sou_eu);
      if (!eu) return;
      const venceu = Number(eu.posicao) === 1;
      setResultado({ posicao: Number(eu.posicao), venceu });
      if (venceu) {
        notificar(
          "Você ganhou a gincana do NEXT! 🏆",
          "Parabéns! Vá até a banca do Health Plus retirar sua caixa de bombom."
        );
      }
    });
  }, [status, perfil?.id]);

  function fechar(destino) {
    gravarFlag(chave);
    setResultado(null);
    if (destino) router.push(destino);
  }

  if (!resultado) return null;
  const { venceu, posicao } = resultado;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => fechar()}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Icone nome="trophy" tamanho={96} tom={venceu ? "amarelo" : "verde"} />
          <Text style={styles.titulo}>{venceu ? "Você ganhou!" : "A gincana acabou!"}</Text>
          <Text style={styles.texto}>
            {venceu
              ? "Você ficou em 1º lugar na gincana do NEXT! Vá até a banca do Health Plus retirar sua caixa de bombom."
              : `Você terminou em ${posicao}º lugar. Obrigada por participar e cuidar de você com o Health Plus!`}
          </Text>
          {venceu && (
            <View style={styles.premio}>
              <Icone nome="gift" tamanho={40} tom="verde" />
              <Text style={styles.premioTexto}>Mostre esta tela na banca para retirar o prêmio.</Text>
            </View>
          )}
          <TouchableOpacity style={styles.botao} onPress={() => fechar("/ranking")}>
            <Text style={styles.botaoTexto}>Ver ranking final</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => fechar()} style={{ paddingVertical: 10 }}>
            <Text style={styles.fechar}>Fechar</Text>
          </TouchableOpacity>
        </View>
        {venceu && <FogosArtificio ativo />}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", paddingHorizontal: 26 },
  card: { backgroundColor: colors.white, borderRadius: 26, padding: 26, alignItems: "center" },
  titulo: { fontSize: 30, fontWeight: "900", color: colors.primary, marginTop: 14 },
  texto: { fontSize: 16, color: "#3A3A3A", textAlign: "center", lineHeight: 23, marginVertical: 12 },
  premio: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FBF1B8", borderRadius: 14, padding: 12, marginBottom: 14, alignSelf: "stretch" },
  premioTexto: { flex: 1, color: "#5A6B2F", fontWeight: "800" },
  botao: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignSelf: "stretch", alignItems: "center" },
  botaoTexto: { color: colors.white, fontWeight: "800", fontSize: 16 },
  fechar: { color: colors.primary, fontWeight: "700" },
});
