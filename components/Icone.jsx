// components/Icone.jsx — ícones no estilo do app (substituem os emojis)
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

// variantes de cor da paleta Health Plus
const TONS = {
  verde: { fundo: colors.primary, icone: colors.white },
  agua: { fundo: colors.green4, icone: colors.white },
  claro: { fundo: "#EAF3DC", icone: colors.primary },
  amarelo: { fundo: "#FBF1B8", icone: "#5A6B2F" },
  branco: { fundo: colors.white, icone: colors.primary },
  vazio: { fundo: "transparent", icone: colors.primary },
};

// Ícone dentro de um círculo
export default function Icone({ nome, tamanho = 40, tom = "claro", style }) {
  const t = TONS[tom] || TONS.claro;
  return (
    <View
      style={[
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: t.fundo, alignItems: "center", justifyContent: "center" },
        style,
      ]}
    >
      <Ionicons name={nome} size={Math.round(tamanho * 0.55)} color={t.icone} />
    </View>
  );
}

// Posição no ranking (1º, 2º, 3º com coroa/destaque; demais só o número)
export function Posicao({ n, tamanho = 36, claro = false }) {
  const top = n <= 3;
  const fundo = n === 1 ? "#F5C542" : n === 2 ? colors.green4 : n === 3 ? colors.green3 : claro ? "rgba(255,255,255,0.18)" : "#EAF3DC";
  const cor = top ? colors.white : claro ? colors.white : colors.primary;
  return (
    <View style={[styles.pos, { width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: fundo }]}>
      {n === 1 && <Ionicons name="trophy" size={tamanho * 0.5} color={colors.white} />}
      {n !== 1 && <Text style={[styles.posTexto, { color: cor, fontSize: tamanho * 0.42 }]}>{n}º</Text>}
    </View>
  );
}

// Ícone pequeno alinhado ao texto (ex.: passos)
export function IconeTexto({ nome, cor = colors.primary, tamanho = 14 }) {
  return <Ionicons name={nome} size={tamanho} color={cor} style={{ marginRight: 4 }} />;
}

const styles = StyleSheet.create({
  pos: { alignItems: "center", justifyContent: "center" },
  posTexto: { fontWeight: "900" },
});
