// app/telao.jsx — ranking ao vivo para a TV/notebook do estande (não precisa de login)
import { Image, Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { colors } from "../constants/colors";
import { formatarTempo, useEvento, useRanking } from "../lib/evento";
import Icone, { IconeTexto, Posicao } from "../components/Icone";


export default function Telao() {
  const { width } = useWindowDimensions();
  const largo = width >= 900;
  const { status, restanteMs, paraComecarMs } = useEvento();
  const { linhas } = useRanking(10, 5000);
  const site = Platform.OS === "web" && typeof window !== "undefined" ? window.location.origin : "https://healthplus-pink-code2.vercel.app";
  const top = linhas.filter((l) => l.posicao <= 10);
  const vencedor = status === "encerrado" ? top[0] : null;

  return (
    <View style={styles.container}>
      <View style={[styles.conteudo, largo && { flexDirection: "row" }]}>
        {/* Ranking */}
        <View style={[styles.painel, largo && { flex: 1.6, marginRight: 24 }]}>
          <View style={styles.cabecalho}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>Gincana NEXT</Text>
              <Text style={styles.subtitulo}>Ranking ao vivo</Text>
            </View>
            <View style={styles.relogio}>
              <Text style={styles.relogioLabel}>
                {status === "antes" ? "Começa em" : status === "aberto" ? "Termina em" : "Encerrado"}
              </Text>
              <Text style={styles.relogioTempo}>
                {status === "antes" ? formatarTempo(paraComecarMs) : status === "aberto" ? formatarTempo(restanteMs) : "Fim"}
              </Text>
            </View>
          </View>

          {vencedor && (
            <View style={styles.vencedor}>
              <Icone nome="trophy" tamanho={80} tom="amarelo" />
              <View>
                <Text style={styles.vencedorLabel}>Vencedor da gincana</Text>
                <Text style={styles.vencedorNome}>{vencedor.nome}</Text>
                <Text style={styles.vencedorPts}>{vencedor.pontos} pontos · {vencedor.passos} passos</Text>
              </View>
            </View>
          )}

          <View style={styles.tabela}>
            {top.length === 0 && <Text style={styles.vazio}>Seja a primeira pessoa no ranking!</Text>}
            {top.map((l) => (
              <View key={l.posicao} style={[styles.linha, l.posicao <= 3 && styles.linhaTop]}>
                <View style={{ width: 52 }}><Posicao n={l.posicao} tamanho={44} claro /></View>
                <Text style={styles.nome} numberOfLines={1}>{l.nome}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <IconeTexto nome="footsteps" cor="#CFEDE4" tamanho={18} />
                  <Text style={styles.passos}>{l.passos.toLocaleString("pt-BR")}</Text>
                </View>
                <Text style={styles.pts}>{l.pontos} pts</Text>
              </View>
            ))}
          </View>
        </View>

        {/* QR para participar */}
        <View style={[styles.painelQr, largo && { flex: 1 }]}>
          <Text style={styles.qrTitulo}>Participe!</Text>
          <Text style={styles.qrTexto}>Escaneie, faça missões, ganhe doces e concorra a uma caixa de bombom</Text>
          <View style={styles.qrCaixa}>
            <QRCode value={site} size={largo ? 260 : 200} color={colors.primary} backgroundColor="#fff" />
          </View>
          <Text style={styles.url}>{site.replace("https://", "")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: 24 },
  conteudo: { flex: 1 },
  painel: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 28, padding: 24, marginBottom: 24 },
  cabecalho: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 },
  logo: { width: 110, height: 84 },
  titulo: { color: colors.white, fontSize: 40, fontWeight: "900" },
  subtitulo: { color: "#CFEDE4", fontSize: 20, fontWeight: "700" },
  relogio: { backgroundColor: colors.white, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 18, alignItems: "center" },
  relogioLabel: { color: colors.primary, fontWeight: "700", fontSize: 14 },
  relogioTempo: { color: colors.primary, fontWeight: "900", fontSize: 34, fontVariant: ["tabular-nums"] },
  vencedor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    backgroundColor: "#FBF1B8",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  vencedorEmoji: { fontSize: 64 },
  vencedorLabel: { color: "#5A6B2F", fontWeight: "800", fontSize: 16 },
  vencedorNome: { color: "#3A4A1F", fontWeight: "900", fontSize: 38 },
  vencedorPts: { color: "#5A6B2F", fontWeight: "700", fontSize: 18 },
  tabela: { gap: 8 },
  vazio: { color: colors.white, fontSize: 22, textAlign: "center", padding: 30 },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 14,
  },
  linhaTop: { backgroundColor: "rgba(255,255,255,0.22)" },
  posicao: { color: colors.white, fontSize: 26, fontWeight: "900", width: 52 },
  nome: { flex: 1, color: colors.white, fontSize: 26, fontWeight: "800" },
  passos: { color: "#CFEDE4", fontSize: 18, fontWeight: "700" },
  pts: { color: colors.white, fontSize: 26, fontWeight: "900", minWidth: 110, textAlign: "right" },
  painelQr: { backgroundColor: colors.white, borderRadius: 28, padding: 24, alignItems: "center", justifyContent: "center" },
  qrTitulo: { color: colors.primary, fontSize: 40, fontWeight: "900" },
  qrTexto: { color: "#3A3A3A", fontSize: 18, textAlign: "center", marginVertical: 12, maxWidth: 360 },
  qrCaixa: { padding: 12, borderRadius: 20, borderWidth: 4, borderColor: colors.green4 },
  url: { color: colors.primary, fontWeight: "800", fontSize: 18, marginTop: 14 },
});
