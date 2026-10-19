// app/passos.jsx — contador de passos ao vivo (critério de desempate)
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TelaAtividade from "../components/TelaAtividade";
import { colors } from "../constants/colors";
import { useUsuario } from "../context/UsuarioContext";
import { criarContadorPassos, manterTelaAcesa } from "../lib/contadorPassos";
import { mensagemErro, supabase } from "../lib/supabase";

const SINCRONIZAR_A_CADA = 10000; // ms

export default function Passos() {
  const { perfil, recarregarPerfil } = useUsuario();
  const [andando, setAndando] = useState(false);
  const [sessao, setSessao] = useState(0); // passos desta caminhada
  const [erro, setErro] = useState("");
  const naoEnviados = useRef(0);
  const contador = useRef(null);
  const travaTela = useRef(null);
  const assinaturaNativa = useRef(null);

  const total = (perfil?.passos ?? 0) + naoEnviados.current;

  function somar(n) {
    naoEnviados.current += n;
    setSessao((s) => s + n);
  }

  async function enviar() {
    const n = naoEnviados.current;
    if (n <= 0) return;
    naoEnviados.current = 0;
    const { error } = await supabase.rpc("registrar_passos", { p_passos: n });
    if (error) {
      setErro(mensagemErro(error));
      return;
    }
    recarregarPerfil();
  }

  // envia os passos ao banco periodicamente
  useEffect(() => {
    if (!andando) return;
    const t = setInterval(enviar, SINCRONIZAR_A_CADA);
    return () => clearInterval(t);
  }, [andando]);

  // ao sair da tela: para e envia o que faltou
  useEffect(() => () => parar(), []);

  async function comecar() {
    setErro("");
    try {
      if (Platform.OS === "web") {
        contador.current = criarContadorPassos(somar);
        await contador.current.iniciar();
        travaTela.current = await manterTelaAcesa();
      } else {
        const { Pedometer } = await import("expo-sensors");
        const disponivel = await Pedometer.isAvailableAsync();
        if (!disponivel) throw new Error("Contador de passos indisponível neste aparelho.");
        await Pedometer.requestPermissionsAsync();
        let anterior = 0;
        assinaturaNativa.current = Pedometer.watchStepCount((r) => {
          somar(r.steps - anterior);
          anterior = r.steps;
        });
      }
      setSessao(0);
      setAndando(true);
    } catch (e) {
      setErro(e.message || "Não foi possível acessar o sensor de movimento.");
    }
  }

  function parar() {
    contador.current?.parar();
    contador.current = null;
    assinaturaNativa.current?.remove?.();
    assinaturaNativa.current = null;
    travaTela.current?.release?.().catch(() => {});
    travaTela.current = null;
    setAndando(false);
    enviar();
  }

  return (
    <TelaAtividade titulo="Passos">
      <View style={styles.centro}>
        <Text style={styles.label}>Seus passos no NEXT</Text>
        <Text style={styles.total}>{total.toLocaleString("pt-BR")}</Text>
        <Text style={styles.pontos}>= {Math.floor(total / 100)} pontos · 1 ponto a cada 100 passos</Text>

        <View style={[styles.circulo, andando && styles.circuloAtivo]}>
          <Ionicons name="footsteps" size={64} color={andando ? colors.white : colors.primary} />
          {andando && <Text style={styles.sessao}>+{sessao}</Text>}
        </View>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity style={[styles.botao, andando && styles.botaoParar]} onPress={andando ? parar : comecar}>
          <Text style={styles.botaoTexto}>{andando ? "Parar caminhada" : "Começar caminhada"}</Text>
        </TouchableOpacity>

        <View style={styles.aviso}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.avisoTexto}>
            Mantenha esta tela <Text style={{ fontWeight: "800" }}>aberta e desbloqueada</Text> enquanto anda, com o
            celular na mão ou no bolso. Só contam passos em ritmo de caminhada.
            {Platform.OS === "web" ? " No iPhone, toque em Permitir quando aparecer o pedido de movimento." : ""}
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
  circulo: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 4,
    borderColor: colors.green4,
    alignItems: "center",
    justifyContent: "center",
  },
  circuloAtivo: { backgroundColor: colors.green4, borderColor: colors.primary },
  sessao: { color: colors.white, fontSize: 22, fontWeight: "900", marginTop: 4 },
  erro: { color: "#C0392B", fontWeight: "700", textAlign: "center" },
  botao: { backgroundColor: colors.primary, borderRadius: 30, paddingVertical: 16, alignSelf: "stretch", alignItems: "center" },
  botaoParar: { backgroundColor: "#E57373" },
  botaoTexto: { color: colors.white, fontSize: 18, fontWeight: "800" },
  aviso: { flexDirection: "row", gap: 8, backgroundColor: "#EAF3DC", borderRadius: 14, padding: 12 },
  avisoTexto: { flex: 1, fontSize: 13, color: "#3A3A3A", lineHeight: 19 },
});
