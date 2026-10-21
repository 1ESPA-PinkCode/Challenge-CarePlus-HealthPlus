// app/(tabs)/grupos.jsx
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconeTexto, Posicao } from "../../components/Icone";
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

function LinhaRanking({ posicao, nome, detalhe, ultima, souEu, icone }) {
  return (
    <View style={[styles.linha, ultima && { borderBottomWidth: 0 }]}>
      <Posicao n={posicao} />
      <Avatar nome={nome} />
      <View style={{ flex: 1 }}>
        <Text style={styles.nome}>{nome}{souEu ? " (você)" : ""}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
          {icone && <IconeTexto nome={icone} cor="#6A6A6A" tamanho={13} />}
          <Text style={[styles.detalhe, { marginTop: 0 }]}>{detalhe}</Text>
        </View>
      </View>
    </View>
  );
}

export default function Grupos() {
  const {
    grupos, grupoAtual, selecionarGrupo, membros, rankingMissoes, rankingStreak,
    criarGrupo, entrarGrupo, recarregar, meuId, carregado,
  } = useGrupos();
  const { convite, convidar } = useLocalSearchParams();
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modoModal, setModoModal] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [destaque, setDestaque] = useState(false);

  // veio da missão "Traga um amigo" / "Grupo de 3"
  useEffect(() => {
    if (!convidar || !carregado) return;
    if (grupos.length === 0) {
      setModoModal("criar");
      setModalVisivel(true);
    }
    setDestaque(true);
  }, [convidar, carregado]);

  // link de convite: abrir healthplus/grupos?convite=CODIGO já abre o modal preenchido
  useEffect(() => {
    if (convite) {
      setModoModal("entrar");
      setModalVisivel(true);
    }
  }, [convite]);

  function textoConvite() {
    const base = Platform.OS === "web" && typeof window !== "undefined" ? window.location.origin : "";
    return base
      ? `Entre no meu grupo "${grupoAtual.nome}" no Health Plus: ${base}/grupos?convite=${grupoAtual.codigo}`
      : `Entre no meu grupo "${grupoAtual.nome}" no Health Plus com o código ${grupoAtual.codigo}`;
  }

  async function compartilhar() {
    if (!grupoAtual) return;
    const texto = textoConvite();
    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Health Plus", text: texto });
        return;
      }
      if (Platform.OS !== "web") {
        await Share.share({ message: texto });
        return;
      }
    } catch (e) {
      return; // a pessoa cancelou
    }
    await copiarConvite();
  }

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [grupoAtual?.id])
  );

  async function copiarConvite() {
    if (!grupoAtual) return;
    await Clipboard.setStringAsync(textoConvite());
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
              Crie seu grupo para receber um código de convite, ou entre no grupo de um amigo.
            </Text>
            <TouchableOpacity
              style={styles.botaoCriar}
              onPress={() => {
                setModoModal("criar");
                setModalVisivel(true);
              }}
            >
              <Ionicons name="add-circle" size={20} color={colors.white} />
              <Text style={styles.botaoCriarTexto}>Criar meu grupo</Text>
            </TouchableOpacity>
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

            <View style={[styles.conviteCard, destaque && styles.conviteCardDestaque]}>
              {destaque && (
                <View style={styles.dicaMissao}>
                  <Ionicons name="person-add" size={18} color={colors.white} />
                  <Text style={styles.dicaMissaoTexto}>
                    Missão: mande este código para seus amigos. Quando alguém entrar no seu grupo, você ganha os pontos!
                  </Text>
                </View>
              )}
              <Text style={styles.conviteLabel}>Seu código de convite</Text>
              <Text style={styles.conviteCodigo}>{grupoAtual?.codigo}</Text>
              <View style={styles.conviteBotoes}>
                <TouchableOpacity style={styles.conviteBotao} onPress={copiarConvite} activeOpacity={0.8}>
                  <Ionicons name={copiado ? "checkmark" : "copy-outline"} size={18} color={colors.primary} />
                  <Text style={styles.conviteBotaoTexto}>{copiado ? "Copiado!" : "Copiar"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.conviteBotao, styles.conviteBotaoCheio]} onPress={compartilhar} activeOpacity={0.8}>
                  <Ionicons name="share-social" size={18} color={colors.white} />
                  <Text style={[styles.conviteBotaoTexto, { color: colors.white }]}>Compartilhar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.secaoLabel}>Missões concluídas</Text>
            <View style={styles.card}>
              {rankingMissoes.map((m, i) => (
                <LinhaRanking
                  key={m.usuario_id}
                  posicao={i + 1}
                  nome={m.nome}
                  souEu={m.usuario_id === meuId}
                  detalhe={`${m.missoes} ${m.missoes === 1 ? "missão concluída" : "missões concluídas"}`}
                  icone="star"
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
                  nome={m.nome}
                  souEu={m.usuario_id === meuId}
                  detalhe={`${m.streak} ${m.streak === 1 ? "dia seguido" : "dias seguidos"}`}
                  icone="flame"
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
        modoInicial={modoModal}
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
  conviteCard: { backgroundColor: "#EAF3DC", borderRadius: 20, padding: 16, marginBottom: 20, alignItems: "center", borderWidth: 2, borderColor: "transparent" },
  conviteCardDestaque: { borderColor: colors.primary, backgroundColor: "#F3FAEC" },
  dicaMissao: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: colors.primary, borderRadius: 12, padding: 10, marginBottom: 12, alignSelf: "stretch" },
  dicaMissaoTexto: { flex: 1, color: colors.white, fontWeight: "700", fontSize: 13, lineHeight: 18 },
  conviteBotoes: { flexDirection: "row", gap: 10, marginTop: 12, alignSelf: "stretch" },
  conviteBotao: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 14, paddingVertical: 12, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.white },
  conviteBotaoCheio: { backgroundColor: colors.primary },
  conviteBotaoTexto: { color: colors.primary, fontWeight: "800", fontSize: 15 },
  botaoCriar: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, marginTop: 18 },
  botaoCriarTexto: { color: colors.white, fontWeight: "800", fontSize: 16 },
  conviteBox: {
    flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EAF3DC",
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 20,
  },
  conviteLabel: { fontSize: 12, color: "#6A6A6A", fontWeight: "600" },
  conviteCodigo: { fontSize: 34, fontWeight: "900", color: colors.primary, letterSpacing: 3, marginTop: 2 },
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