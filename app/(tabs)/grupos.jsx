// app/(tabs)/grupos.jsx
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ModalAddMembro from "../../components/ModalAddMembro";
import { colors } from "../../constants/colors";
import { useGrupos } from "../../context/GruposContext";

function Avatar({ nome }) {
  const iniciais = (nome || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarTexto}>{iniciais}</Text>
    </View>
  );
}

function LinhaRanking({ posicao, nome, detalhe, ultima }) {
  return (
    <View style={[styles.linha, ultima && { borderBottomWidth: 0 }]}>
      <Text style={styles.posicao}>{posicao}º</Text>
      <Avatar nome={nome} />
      <View style={{ flex: 1 }}>
        <Text style={styles.nome}>{nome}</Text>
        <Text style={styles.detalhe}>{detalhe}</Text>
      </View>
    </View>
  );
}

export default function Grupos() {
  const {
    grupos, grupoAtual, selecionarGrupo, membros, rankingMissoes, rankingStreak,
    criarGrupo, entrarGrupo, recarregar, meuId,
  } = useGrupos();
  const { convite } = useLocalSearchParams();
  const [modalVisivel, setModalVisivel] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // link de convite: abrir healthplus/grupos?convite=CODIGO já abre o modal preenchido
  useEffect(() => {
    if (convite) setModalVisivel(true);
  }, [convite]);

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [grupoAtual?.id])
  );

  async function copiarConvite() {
    if (!grupoAtual) return;
    const base = Platform.OS === "web" && typeof window !== "undefined" ? window.location.origin : "";
    const texto = base
      ? `Entre no meu grupo "${grupoAtual.nome}" no Health Plus: ${base}/grupos?convite=${grupoAtual.codigo}`
      : grupoAtual.codigo;
    await Clipboard.setStringAsync(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const semGrupo = grupos.length === 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tituloBox}>
          <Text style={styles.tituloTexto}>Seus Grupos</Text>
        </View>

        {semGrupo ? (
          <View style={styles.vazioBox}>
            <Ionicons name="people-outline" size={48} color={colors.green3} />
            <Text style={styles.vazioTitulo}>Nenhum grupo ainda</Text>
            <Text style={styles.vazioTexto}>
              Toque no botão + para criar um grupo ou entrar com o código de convite de um amigo.
            </Text>
          </View>
        ) : (
          <>
            {grupos.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {grupos.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => selecionarGrupo(g.id)}
                    style={[styles.chip, g.id === grupoAtual?.id && styles.chipAtivo]}
                  >
                    <Text style={[styles.chipTexto, g.id === grupoAtual?.id && styles.chipTextoAtivo]}>{g.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.nomeGrupo}>{grupoAtual?.nome}</Text>

            <TouchableOpacity style={styles.conviteBox} onPress={copiarConvite} activeOpacity={0.8}>
              <View style={{ flex: 1 }}>
                <Text style={styles.conviteLabel}>Código de convite</Text>
                <Text style={styles.conviteCodigo}>{grupoAtual?.codigo}</Text>
              </View>
              <Ionicons name={copiado ? "checkmark" : "copy-outline"} size={20} color={colors.primary} />
              <Text style={styles.conviteAcao}>{copiado ? "Copiado!" : "Copiar"}</Text>
            </TouchableOpacity>

            <Text style={styles.secaoLabel}>Missões concluídas</Text>
            <View style={styles.card}>
              {rankingMissoes.map((m, i) => (
                <LinhaRanking
                  key={m.usuario_id}
                  posicao={i + 1}
                  nome={m.usuario_id === meuId ? `${m.nome} (você)` : m.nome}
                  detalhe={`${m.missoes} ${m.missoes === 1 ? "missão concluída" : "missões concluídas"}`}
                  ultima={i === rankingMissoes.length - 1}
                />
              ))}
            </View>

            <Text style={styles.secaoLabel}>Constância</Text>
            <View style={styles.card}>
              {rankingStreak.map((m, i) => (
                <LinhaRanking
                  key={m.usuario_id}
                  posicao={i + 1}
                  nome={m.usuario_id === meuId ? `${m.nome} (você)` : m.nome}
                  detalhe={`🔥 ${m.streak} ${m.streak === 1 ? "dia seguido" : "dias seguidos"}`}
                  ultima={i === rankingStreak.length - 1}
                />
              ))}
            </View>
            {membros.length === 1 && (
              <Text style={styles.dica}>Compartilhe o código acima para seus amigos entrarem no grupo.</Text>
            )}
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => setModalVisivel(true)}>
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>

      <ModalAddMembro
        visivel={modalVisivel}
        onFechar={() => setModalVisivel(false)}
        onEntrar={entrarGrupo}
        onCriar={criarGrupo}
        codigoInicial={typeof convite === "string" ? convite : ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 90 },

  tituloBox: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  tituloTexto: { fontSize: 30, fontWeight: "800", color: colors.white },

  nomeGrupo: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 18,
  },

  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.primary, marginRight: 8 },
  chipAtivo: { backgroundColor: colors.primary },
  chipTexto: { color: colors.primary, fontWeight: "700" },
  chipTextoAtivo: { color: colors.white },
  conviteBox: {
    flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EAF3DC",
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 20,
  },
  conviteLabel: { fontSize: 12, color: "#6A6A6A", fontWeight: "600" },
  conviteCodigo: { fontSize: 20, fontWeight: "800", color: colors.primary, letterSpacing: 1 },
  conviteAcao: { color: colors.primary, fontWeight: "700" },
  dica: { textAlign: "center", color: "#6A6A6A", fontSize: 13, marginTop: -8 },

  secaoLabel: {
    fontSize: 15,
    color: "#9AA98C",
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.green3,
  },
  posicao: { fontSize: 20, fontWeight: "800", color: colors.primary, width: 34 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.green4,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: { color: colors.white, fontWeight: "800", fontSize: 18 },
  nome: { fontSize: 17, fontWeight: "800", color: "#1A1A1A" },
  detalhe: { fontSize: 14, color: "#6A6A6A", marginTop: 2 },

  vazioBox: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  vazioTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 14,
  },
  vazioTexto: {
    fontSize: 14,
    color: "#6A6A6A",
    textAlign: "center",
    marginTop: 6,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});