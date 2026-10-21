// components/ListaMissoes.jsx — lista de missões + ação de cada uma
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { useUsuario } from "../context/UsuarioContext";
import MissaoCard from "./MissaoCard";
import Icone from "./Icone";

const AJUDA_EQUIPE = {
  ativacao: "Participe de uma ativação do NEXT e mostre este código para alguém da equipe Health Plus. A missão aparece concluída na hora.",
  story: `Poste um story marcando a @fiap e o ${INSTAGRAM}. Mostre o story e este código no estande do Health Plus.`,
};

const AJUDA_CODIGO = {
  qr_renmap: "Vá até o estande do RENMAP, aponte a câmera do celular para o QR code e toque no link. Se preferir, digite o código que aparece embaixo do QR.",
};

export default function ListaMissoes({ estiloItem, soPendentes = false, limite }) {
  const router = useRouter();
  const { missoes, registrar, validarCodigo, avaliar, recarregar } = useMissoes();
  const { perfil } = useUsuario();
  const [codigoMissao, setCodigoMissao] = useState(null);
  const [missaoEquipe, setMissaoEquipe] = useState(null);
  const [avaliando, setAvaliando] = useState(false);

  function agir(m) {
    switch (m.acao) {
      case "registrar":
        return registrar(m.id);
      case "codigo":
        return setCodigoMissao(m);
      case "equipe":
        return setMissaoEquipe(m);
      case "avaliar":
        return setAvaliando(true);
      case "jardim":
        return router.push("/jardim");
      case "grupos":
        // abre o grupo da pessoa com o código de convite em destaque
        return router.push({ pathname: "/grupos", params: { convidar: String(Date.now()) } });
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
      <ModalCodigoPessoal
        missao={missaoEquipe ? missoes.find((x) => x.id === missaoEquipe.id) : null}
        codigo={perfil?.codigo_pessoal}
        onFechar={() => setMissaoEquipe(null)}
        recarregar={recarregar}
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

// Mostra o código pessoal enquanto a equipe confirma (atualiza sozinho)
function ModalCodigoPessoal({ missao, codigo, onFechar, recarregar }) {
  useEffect(() => {
    if (!missao || missao.concluida) return;
    const t = setInterval(recarregar, 3000);
    return () => clearInterval(t);
  }, [missao?.id, missao?.concluida]);

  return (
    <Caixa visivel={!!missao} onFechar={onFechar} titulo={missao?.titulo || ""}>
      {missao?.concluida ? (
        <View style={{ alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Icone nome="checkmark-circle" tamanho={64} tom="verde" />
          <Text style={[styles.texto, { fontWeight: "800", color: colors.primary, marginBottom: 0 }]}>Missão confirmada pela equipe!</Text>
        </View>
      ) : (
        <>
          <Text style={styles.texto}>{missao ? AJUDA_EQUIPE[missao.id] : ""}</Text>
          <Text style={styles.label}>Seu código</Text>
          <Text style={styles.codigoPessoal}>#{codigo || "----"}</Text>
          <Text style={styles.aguardando}>Esperando a confirmação da equipe…</Text>
        </>
      )}
      <TouchableOpacity style={styles.botao} onPress={onFechar} activeOpacity={0.85}>
        <Text style={styles.botaoTexto}>{missao?.concluida ? "Fechar" : "Voltar"}</Text>
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
      <Text style={styles.texto}>O que você achou do app? Sua opinião ajuda muito o nosso projeto.</Text>
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
    minWidth: 0,
    borderWidth: 1.5,
    borderColor: colors.green3,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 12,
  },
  label: { textAlign: "center", color: "#8A8A8A", fontWeight: "700" },
  codigoPessoal: { textAlign: "center", fontSize: 54, fontWeight: "900", color: colors.primary, letterSpacing: 6, marginVertical: 6 },
  aguardando: { textAlign: "center", color: "#8A8A8A", fontSize: 13, marginBottom: 14 },
  estrelas: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 14 },
  erro: { color: "#C0392B", fontSize: 14, marginBottom: 10, fontWeight: "600" },
  botao: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  botaoTexto: { color: colors.white, fontSize: 16, fontWeight: "800" },
});
