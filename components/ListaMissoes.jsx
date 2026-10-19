// components/ListaMissoes.jsx — lista de missões + ação de cada uma
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../constants/colors";
import { INSTAGRAM, useMissoes } from "../context/MissoesContext";
import MissaoCard from "./MissaoCard";

const AJUDA_CODIGO = {
  qr_renmap: "Vá até o estande do RENMAP, aponte a câmera do celular para o QR code e toque no link. Se preferir, digite o código que aparece embaixo do QR.",
  ativacao: "Participe de uma ativação do NEXT. No final, peça o código para a equipe Health Plus.",
  story: `Poste um story marcando a @fiap e o ${INSTAGRAM}. Mostre o story no estande do Health Plus para receber o código.`,
};

export default function ListaMissoes({ estiloItem, soPendentes = false, limite }) {
  const router = useRouter();
  const { missoes, registrar, validarCodigo, avaliar } = useMissoes();
  const [codigoMissao, setCodigoMissao] = useState(null);
  const [avaliando, setAvaliando] = useState(false);

  function agir(m) {
    switch (m.acao) {
      case "registrar":
        return registrar(m.id);
      case "codigo":
        return setCodigoMissao(m);
      case "avaliar":
        return setAvaliando(true);
      case "jardim":
        return router.push("/jardim");
      case "grupos":
        return router.push("/grupos");
      default:
        return router.push(`/missao/${m.acao}`);
    }
  }

  return (
    <>
      {missoes
        .filter((m) => !soPendentes || !m.concluida)
        .slice(0, limite ?? missoes.length)
        .map((m) => (
        <View key={m.id} style={estiloItem}>
          <MissaoCard
            icon={m.icon}
            titulo={m.titulo}
            desc={m.desc}
            atual={m.atual}
            meta={m.meta}
            unidade={m.unidade}
            gemas={m.gemas}
            feita={m.concluida}
            botao={m.botao}
            onRegistrar={() => agir(m)}
          />
        </View>
      ))}

      <ModalCodigo
        missao={codigoMissao}
        onFechar={() => setCodigoMissao(null)}
        onValidar={(c) => validarCodigo(codigoMissao?.id, c)}
      />
      <ModalAvaliar visivel={avaliando} onFechar={() => setAvaliando(false)} onEnviar={avaliar} />
    </>
  );
}

function Caixa({ visivel, onFechar, titulo, children }) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.card}>
            <View style={styles.topo}>
              <Text style={styles.titulo}>{titulo}</Text>
              <TouchableOpacity onPress={onFechar}>
                <Ionicons name="close" size={26} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function ModalCodigo({ missao, onFechar, onValidar }) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function fechar() {
    setCodigo("");
    setErro("");
    onFechar();
  }

  async function enviar() {
    if (codigo.trim().length < 3) return setErro("Digite o código.");
    setCarregando(true);
    const r = await onValidar(codigo);
    setCarregando(false);
    if (r.ok) fechar();
    else setErro(r.erro);
  }

  return (
    <Caixa visivel={!!missao} onFechar={fechar} titulo={missao?.titulo || ""}>
      <Text style={styles.texto}>{missao ? AJUDA_CODIGO[missao.id] : ""}</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o código"
        placeholderTextColor="#A8A8A8"
        autoCapitalize="characters"
        value={codigo}
        onChangeText={(t) => {
          setCodigo(t);
          setErro("");
        }}
        onSubmitEditing={enviar}
      />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      <TouchableOpacity style={styles.botao} onPress={enviar} disabled={carregando} activeOpacity={0.85}>
        {carregando ? <ActivityIndicator color={colors.white} /> : <Text style={styles.botaoTexto}>Validar</Text>}
      </TouchableOpacity>
    </Caixa>
  );
}

function ModalAvaliar({ visivel, onFechar, onEnviar }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    if (!nota) return setErro("Escolha de 1 a 5 estrelas.");
    setCarregando(true);
    const r = await onEnviar(nota, comentario.trim());
    setCarregando(false);
    if (r.ok) {
      setNota(0);
      setComentario("");
      onFechar();
    } else setErro(r.erro);
  }

  return (
    <Caixa visivel={visivel} onFechar={onFechar} titulo="Avalie o Health Plus">
      <Text style={styles.texto}>O que você achou do app? Sua opinião ajuda muito o nosso projeto 💚</Text>
      <View style={styles.estrelas}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => { setNota(n); setErro(""); }}>
            <Ionicons name={n <= nota ? "star" : "star-outline"} size={38} color="#F5B700" />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: "top" }]}
        placeholder="Comentário (opcional)"
        placeholderTextColor="#A8A8A8"
        multiline
        maxLength={500}
        value={comentario}
        onChangeText={setComentario}
      />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      <TouchableOpacity style={styles.botao} onPress={enviar} disabled={carregando} activeOpacity={0.85}>
        {carregando ? <ActivityIndicator color={colors.white} /> : <Text style={styles.botaoTexto}>Enviar avaliação</Text>}
      </TouchableOpacity>
    </Caixa>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", paddingHorizontal: 24 },
  card: { backgroundColor: colors.white, borderRadius: 22, padding: 22 },
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  titulo: { fontSize: 20, fontWeight: "800", color: colors.primary, flex: 1 },
  texto: { fontSize: 14, color: "#4A4A4A", lineHeight: 20, marginBottom: 14 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.green3,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 12,
  },
  estrelas: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 14 },
  erro: { color: "#C0392B", fontSize: 14, marginBottom: 10, fontWeight: "600" },
  botao: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  botaoTexto: { color: colors.white, fontSize: 16, fontWeight: "800" },
});
