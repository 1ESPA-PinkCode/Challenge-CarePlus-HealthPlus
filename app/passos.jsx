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
  sem_sensor: { icone: "alert-circle-outline", texto: "Este aparelho ou navegador não tem sensor de movimento", cor: "#C0392B" },
  parado: { icone: "pause-circle-outline", texto: "Entre na sua conta para contar passos", cor: "#8A8A8A" },
};

export default function Passos() {
  const { estado, sessao, total, ativar } = usePassos();
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

        {(estado === "aguardando_toque" || estado === "negado") && (
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
            {estado === "negado" ? " No iPhone, para liberar de novo: Ajustes › Safari › Movimento e Orientação." : ""}
          </Text>
        </View>
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
  aviso: { flexDirection: "row", gap: 8, backgroundColor: "#EAF3DC", borderRadius: 14, padding: 12 },
  avisoTexto: { flex: 1, fontSize: 13, color: "#3A3A3A", lineHeight: 19 },
});
