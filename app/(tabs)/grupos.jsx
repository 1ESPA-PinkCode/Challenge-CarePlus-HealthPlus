// app/(tabs)/grupos.jsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const { nomeGrupo, membros, rankingMissoes, rankingVitorias, adicionarMembro } = useGrupos();
  const [modalVisivel, setModalVisivel] = useState(false);

  const vazio = membros.length === 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* título */}
        <View style={styles.tituloBox}>
          <Text style={styles.tituloTexto}>Seus Grupos</Text>
        </View>

        {/* nome do grupo */}
        <Text style={styles.nomeGrupo}>{nomeGrupo}</Text>

        {vazio ? (
          <View style={styles.vazioBox}>
            <Ionicons name="people-outline" size={48} color={colors.green3} />
            <Text style={styles.vazioTitulo}>Nenhum membro ainda</Text>
            <Text style={styles.vazioTexto}>
              Toque no botão + para adicionar pessoas com o convênio CarePlus.
            </Text>
          </View>
        ) : (
          <>
            {/* Classificação semanal */}
            <Text style={styles.secaoLabel}>Classificação semanal</Text>
            <View style={styles.card}>
              {rankingMissoes.map((m, i) => (
                <LinhaRanking
                  key={m.cpf}
                  posicao={i + 1}
                  nome={m.nome}
                  detalhe={`${m.missoes} missões concluídas`}
                  ultima={i === rankingMissoes.length - 1}
                />
              ))}
            </View>

            {/* Vitórias */}
            <Text style={styles.secaoLabel}>Vitórias</Text>
            <View style={styles.card}>
              {rankingVitorias.map((m, i) => (
                <LinhaRanking
                  key={m.cpf}
                  posicao={i + 1}
                  nome={m.nome}
                  detalhe={`${m.vitorias} vitórias semanais`}
                  ultima={i === rankingVitorias.length - 1}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* botão flutuante "+" */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setModalVisivel(true)}
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>

      {/* modal de adicionar membro */}
      <ModalAddMembro
        visivel={modalVisivel}
        onFechar={() => setModalVisivel(false)}
        onAdicionar={adicionarMembro}
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