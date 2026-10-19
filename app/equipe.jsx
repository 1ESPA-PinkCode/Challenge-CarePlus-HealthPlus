// app/equipe.jsx — painel da equipe: entregar doces e ver/trocar códigos
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import TelaAtividade from "../components/TelaAtividade";
import { colors } from "../constants/colors";
import { CATALOGO_MISSOES } from "../context/MissoesContext";
import { useUsuario } from "../context/UsuarioContext";
import { mensagemErro, supabase } from "../lib/supabase";

const nomeMissao = (id) => CATALOGO_MISSOES.find((m) => m.id === id)?.titulo || id;

export default function Equipe() {
  const router = useRouter();
  const { perfil, carregando } = useUsuario();
  const [resumo, setResumo] = useState(null);
  const [codigos, setCodigos] = useState([]);
  const [busca, setBusca] = useState("");
  const [doce, setDoce] = useState(null);
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [editando, setEditando] = useState({});

  const carregar = useCallback(async () => {
    const [r, c] = await Promise.all([supabase.rpc("equipe_resumo"), supabase.rpc("equipe_codigos")]);
    if (r.data) setResumo(r.data);
    if (c.data) setCodigos(c.data);
  }, []);

  useEffect(() => {
    if (perfil?.equipe) {
      carregar();
      const t = setInterval(carregar, 15000);
      return () => clearInterval(t);
    }
  }, [perfil?.equipe]);

  async function buscarDoce() {
    setMsg("");
    setDoce(null);
    if (busca.trim().length < 4) return setMsg("Digite o código do cupom.");
    setOcupado(true);
    const { data, error } = await supabase.rpc("equipe_buscar_doce", { p_codigo: busca });
    setOcupado(false);
    if (error) return setMsg(mensagemErro(error));
    if (!data?.length) return setMsg("Cupom não encontrado.");
    setDoce(data[0]);
  }

  async function entregar() {
    setOcupado(true);
    const { data, error } = await supabase.rpc("equipe_entregar_doce", { p_codigo: doce.codigo });
    setOcupado(false);
    if (error) return setMsg(mensagemErro(error));
    setMsg(data ? "✅ Doce entregue!" : "Esse cupom já tinha sido usado.");
    setDoce(null);
    setBusca("");
    carregar();
  }

  async function trocarCodigo(id) {
    const novo = (editando[id] || "").trim();
    if (novo.length < 3) return;
    const { error } = await supabase.rpc("equipe_trocar_codigo", { p_missao: id, p_codigo: novo });
    if (error) return setMsg(mensagemErro(error));
    setEditando((e) => ({ ...e, [id]: "" }));
    carregar();
  }

  if (carregando) return <TelaAtividade titulo="Equipe"><ActivityIndicator color={colors.primary} /></TelaAtividade>;

  if (!perfil?.equipe) {
    return (
      <TelaAtividade titulo="Equipe">
        <View style={styles.centro}>
          <Text style={{ fontSize: 56 }}>🔒</Text>
          <Text style={styles.titulo}>Área da equipe Health Plus</Text>
          <Text style={styles.texto}>
            {perfil ? "Sua conta ainda não está liberada como equipe." : "Entre com a conta da equipe para continuar."}
          </Text>
          {!perfil && (
            <TouchableOpacity style={styles.botao} onPress={() => router.push("/auth/login")}>
              <Text style={styles.botaoTexto}>Entrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </TelaAtividade>
    );
  }

  return (
    <TelaAtividade titulo="Equipe">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Entregar doce */}
        <Text style={styles.secao}>🍬 Entregar doce</Text>
        <View style={styles.linhaBusca}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Código do cupom"
            placeholderTextColor="#A8A8A8"
            autoCapitalize="characters"
            value={busca}
            onChangeText={(t) => {
              setBusca(t);
              setMsg("");
            }}
            onSubmitEditing={buscarDoce}
          />
          <TouchableOpacity style={styles.botaoPeq} onPress={buscarDoce} disabled={ocupado}>
            <Text style={styles.botaoTexto}>Buscar</Text>
          </TouchableOpacity>
        </View>
        {doce && (
          <View style={[styles.card, doce.entregue && { borderColor: "#E57373" }]}>
            <Text style={styles.doceNome}>{doce.nome}</Text>
            <Text style={styles.texto}>{nomeMissao(doce.missao_id)} · cupom {doce.codigo}</Text>
            {doce.entregue ? (
              <Text style={styles.erro}>Este cupom JÁ FOI USADO.</Text>
            ) : (
              <TouchableOpacity style={styles.botao} onPress={entregar} disabled={ocupado}>
                <Text style={styles.botaoTexto}>Confirmar entrega</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {msg ? <Text style={styles.msg}>{msg}</Text> : null}

        {/* Códigos */}
        <Text style={styles.secao}>🔑 Códigos das missões</Text>
        {codigos.map((c) => (
          <View key={c.id} style={styles.card}>
            <Text style={styles.texto}>{nomeMissao(c.id)}</Text>
            <Text style={styles.codigo}>{c.codigo}</Text>
            {c.id !== "qr_renmap" && (
              <View style={styles.linhaBusca}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Novo código"
                  placeholderTextColor="#A8A8A8"
                  autoCapitalize="characters"
                  value={editando[c.id] || ""}
                  onChangeText={(t) => setEditando((e) => ({ ...e, [c.id]: t }))}
                />
                <TouchableOpacity style={styles.botaoPeq} onPress={() => trocarCodigo(c.id)}>
                  <Text style={styles.botaoTexto}>Trocar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Resumo */}
        {resumo && (
          <>
            <Text style={styles.secao}>📊 Resumo ao vivo</Text>
            <View style={styles.grade}>
              {[
                ["Participantes", resumo.participantes],
                ["Missões feitas", resumo.missoes],
                ["Doces entregues", resumo.doces],
                ["Doces a entregar", resumo.doces_pend],
                ["Nota do app", resumo.nota_media ?? "–"],
              ].map(([l, v]) => (
                <View key={l} style={styles.stat}>
                  <Text style={styles.statValor}>{v}</Text>
                  <Text style={styles.statLabel}>{l}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={[styles.botao, { marginVertical: 20 }]} onPress={() => router.push("/telao")}>
          <Text style={styles.botaoTexto}>Abrir telão do ranking</Text>
        </TouchableOpacity>
      </ScrollView>
    </TelaAtividade>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  titulo: { fontSize: 22, fontWeight: "900", color: colors.primary, textAlign: "center" },
  secao: { fontSize: 18, fontWeight: "900", color: colors.primary, marginTop: 8, marginBottom: 10 },
  linhaBusca: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    borderWidth: 1.5,
    borderColor: colors.green3,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    color: "#1A1A1A",
    letterSpacing: 1,
  },
  card: { borderWidth: 2, borderColor: colors.green4, borderRadius: 16, padding: 14, marginVertical: 8, gap: 8 },
  doceNome: { fontSize: 22, fontWeight: "900", color: "#1A1A1A" },
  texto: { fontSize: 15, color: "#4A4A4A", textAlign: "left" },
  codigo: { fontSize: 28, fontWeight: "900", color: colors.primary, letterSpacing: 2 },
  erro: { color: "#C0392B", fontWeight: "900", fontSize: 16 },
  msg: { fontSize: 16, fontWeight: "800", color: colors.primary, marginVertical: 8 },
  botao: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, alignItems: "center" },
  botaoPeq: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16 },
  botaoTexto: { color: colors.white, fontWeight: "800", fontSize: 16 },
  grade: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stat: { backgroundColor: "#EAF3DC", borderRadius: 14, padding: 12, minWidth: "30%", flexGrow: 1, alignItems: "center" },
  statValor: { fontSize: 26, fontWeight: "900", color: colors.primary },
  statLabel: { fontSize: 12, color: "#5A6B2F", fontWeight: "700", textAlign: "center" },
});
