// components/Icone.jsx — ícones no estilo "ladrilho": quadrado arredondado de cor sólida
// com o desenho em contorno fino branco. Cores da paleta Health Plus.
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

export const CORES_ICONE = {
  verde: colors.primary, // #1C9770
  agua: "#4FBFAE", // verde-água
  lima: "#8CC63F", // verde-limão
  menta: "#5DBB73", // verde-folha
  amarelo: "#F2B632", // amarelo das gemas
  petroleo: "#137A6A", // verde escuro
};

// nomes antigos continuam funcionando
const APELIDOS = { claro: "menta", branco: "verde" };

// sempre usa a versão em contorno do ícone, quando ela existe
const SEM_CONTORNO = new Set(["logo-instagram"]);
const contorno = (nome) => (SEM_CONTORNO.has(nome) || nome.endsWith("-outline") ? nome : `${nome}-outline`);

export default function Icone({ nome, tamanho = 40, tom = "verde", style }) {
  const cor = CORES_ICONE[APELIDOS[tom] || tom] || CORES_ICONE.verde;
  return (
    <View
      style={[
        styles.ladrilho,
        { width: tamanho, height: tamanho, borderRadius: tamanho * 0.28, backgroundColor: cor },
        style,
      ]}
    >
      <Ionicons name={contorno(nome)} size={Math.round(tamanho * 0.56)} color={colors.white} />
    </View>
  );
}

// Posição no ranking: 1º troféu amarelo, 2º verde-água, 3º verde-limão, demais número
export function Posicao({ n, tamanho = 36, claro = false }) {
  const cor = n === 1 ? CORES_ICONE.amarelo : n === 2 ? CORES_ICONE.agua : n === 3 ? CORES_ICONE.lima : null;
  return (
    <View
      style={[
        styles.ladrilho,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho * 0.28,
          backgroundColor: cor || (claro ? "rgba(255,255,255,0.18)" : "#EAF3DC"),
        },
      ]}
    >
      {n === 1 ? (
        <Ionicons name="trophy-outline" size={tamanho * 0.56} color={colors.white} />
      ) : (
        <Text style={{ fontWeight: "900", fontSize: tamanho * 0.4, color: cor || claro ? colors.white : colors.primary }}>{n}º</Text>
      )}
    </View>
  );
}

// Ícone pequeno alinhado ao texto (ex.: passos)
export function IconeTexto({ nome, cor = colors.primary, tamanho = 14 }) {
  return <Ionicons name={contorno(nome)} size={tamanho} color={cor} style={{ marginRight: 4 }} />;
}

const styles = StyleSheet.create({
  ladrilho: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B4D3A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
});
