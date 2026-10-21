// app/passos.jsx — acompanhamento dos passos (a contagem é automática)
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TelaAtividade from "../components/TelaAtividade";
import { colors } from "../constants/colors";
import { usePassos } from "../context/PassosContext";

const STATUS = {
  contando: { icone: "walk-outline", texto: "Contando seus passos automaticamente", cor: colors.primary },
  aguardando_toque: { icone: "hand-left-outline", texto: "Toque no botão abaixo para liberar a contagem", cor: "#B8860B" },
  negado: { icone: "alert-circle-outline", texto: "A permissão de movimento foi negada", cor: "#C0392B" },
  tentar_de_novo: { icone: "alert-circle-outline", texto: "Não conseguimos liberar o sensor. Toque no botão abaixo", cor: "#B8860B" },
  sem_sensor: { icone: "alert-circle-outline", texto: "Este aparelho ou navegador não tem sensor de movimento", cor: "#C0392B" },
  parado: { icone: "pause-circle-outline", texto: "Entre na sua conta para contar passos", cor: "#8A8A8A" },
};

// detecta se o site foi aberto dentro de outro app (Teams, Instagram, WhatsApp...)
function navegadorEmbutido() {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  if (/Teams/i.test(ua)) return "Teams";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  if (/WhatsApp/i.test(ua)) return "WhatsApp";
  if (/LinkedInApp/i.test(ua)) return "LinkedIn";
  if (/Line\//i.test(ua)) return "Line";
  // iPhone sem "Safari" no nome = navegador embutido de algum app
  if (/iPhone|iPad/i.test(ua) && !/Safari/i.test(ua)) return "app";
  return null;
}

export default function Passos() {
  const { estado, sessao, total, ativar, detalhe } = usePassos();
  const embutido = navegadorEmbutido();
  const st = STATUS[estado] || STATUS.parado;
  const contando = estado === "contando";

  return (
    <TelaAtividade titulo="Passos">
      <View style={styles.centro}>
        <Text style={styles.label}>Seus passos no NEXT</Text>
        <Text style={styles.total}>{total.toLocaleString("pt-BR")}</Text>
        <Text style={styles.pontos}>= {Math.floor(total / 100)} pontos · 1 ponto a cada 100 passos</Text>

        <View style={[styles.circulo, contando && styles.circuloAtivo]}>
          <Ionicons name="footsteps-outline" size={64} color={contando ? colors.white : colors.primary} />
          {contando && sessao > 0 && <Text style={styles.sessao}>+{sessao}</Text>}
        </View>

        <View style={styles.status}>
          <Ionicons name={st.icone} size={20} color={st.cor} />
          <Text style={[styles.statusTexto, { color: st.cor }]}>{st.texto}</Text>
        </View>

        {embutido && estado !== "contando" && (
          <View style={styles.alerta}>
            <Ionicons name="open-outline" size={20} color="#8A5A00" />
            <Text style={styles.alertaTexto}>
              Você abriu o Health Plus dentro do {embutido}, que bloqueia o sensor de passos. Toque em{" "}
              <Text style={{ fontWeight: "800" }}>⋯</Text> (ou no ícone de compartilhar) e escolha{" "}
              <Text style={{ fontWeight: "800" }}>"Abrir no Safari"</Text> / <Text style={{ fontWeight: "800" }}>"Abrir no navegador"</Text>.
            </Text>
          </View>
        )}

        {(estado === "aguardando_toque" || estado === "negado" || estado === "tentar_de_novo") && (
          <TouchableOpacity style={styles.botao} onPress={ativar}>
            <Text style={styles.botaoTexto}>Permitir contagem de passos</Text>
          </TouchableOpacity>
        )}

        <View style={styles.aviso}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.avisoTexto}>
            Os passos contam sozinhos enquanto o Health Plus estiver <Text style={{ fontWeight: "800" }}>aberto na tela</Text>,
            em qualquer aba do app. Com o site fechado ou o celular bloqueado, o navegador não deixa contar. Só valem passos
            em ritmo de caminhada.
            {estado === "negado" ? " No iPhone, para liberar de novo: Ajustes › Safari › Avançado › Dados do Site, apague o do Health Plus e abra o app de novo." : ""}
          </Text>
        </View>
        {!!detalhe && estado !== "contando" && <Text style={styles.detalhe}>Detalhe técnico: {detalhe}</Text>}
      </View>
    </TelaAtividade>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "space-evenly" },
  label: { fontSize: 16, color: "#8A8A8A", fontWeight: "700" },
  total: { fontSize: 56, fontWeight: "900", color: colors.primary },
  pontos: { fontSize: 14, color: "#6A6A6A", marginTop: -8 },
  circulo: { width: 170, height: 170, borderRadius: 48, borderWidth: 4, borderColor: colors.green4, alignItems: "center", justifyContent: "center" },
  circuloAtivo: { backgroundColor: "#4FBFAE", borderColor: colors.primary },
  sessao: { color: colors.white, fontSize: 22, fontWeight: "900", marginTop: 4 },
  status: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8 },
  statusTexto: { fontWeight: "800", fontSize: 15, flexShrink: 1, textAlign: "center" },
  botao: { backgroundColor: colors.primary, borderRadius: 30, paddingVertical: 16, alignSelf: "stretch", alignItems: "center" },
  botaoTexto: { color: colors.white, fontSize: 17, fontWeight: "800" },
  alerta: { flexDirection: "row", gap: 8, backgroundColor: "#FBF1B8", borderRadius: 14, padding: 12 },
  alertaTexto: { flex: 1, fontSize: 13, color: "#5A4500", lineHeight: 19 },
  detalhe: { fontSize: 11, color: "#AAAAAA", textAlign: "center" },
  aviso: { flexDirection: "row", gap: 8, backgroundColor: "#EAF3DC", borderRadius: 14, padding: 12 },
  avisoTexto: { flex: 1, fontSize: 13, color: "#3A3A3A", lineHeight: 19 },
});
