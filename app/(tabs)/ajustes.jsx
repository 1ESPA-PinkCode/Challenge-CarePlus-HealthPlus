// app/(tabs)/ajustes.jsx
import { useMissoes } from "../../context/MissoesContext";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useUsuario } from "../../context/UsuarioContext";
import { colors } from "../../constants/colors";

export default function Ajustes() {
  const router = useRouter();
  const { usuario, salvarUsuario, logout } = useUsuario();
  const { missoes, concluidas, totalMissoes } = useMissoes();
  const [modalResumo, setModalResumo] = useState(false);
  const gemasHoje = missoes
    .filter((m) => m.atual >= m.meta)
    .reduce((acc, m) => acc + m.gemas, 0);

  const [foto, setFoto] = useState(usuario?.foto || null);

  // Modal Editar Perfil
  const [modalPerfil, setModalPerfil] = useState(false);
  const [novoNome, setNovoNome] = useState(usuario?.nome || "");
  const [erroPerfil, setErroPerfil] = useState("");
  const [loadingPerfil, setLoadingPerfil] = useState(false);

  // Modal Mudar Senha
  const [modalSenha, setModalSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState("");
  const [loadingSenha, setLoadingSenha] = useState(false);

  // Modal Preferências
  const [modalPrefs, setModalPrefs] = useState(false);
  const [notificacoes, setNotificacoes] = useState(true);
  const [somAmbiente, setSomAmbiente] = useState(false);
  const [modoNoturno, setModoNoturno] = useState(false);

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert("Permissão necessária", "Precisamos acessar sua galeria para trocar a foto.");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!resultado.canceled) {
      const novaFoto = resultado.assets[0].uri;
      setFoto(novaFoto);
      await salvarUsuario({ ...usuario, foto: novaFoto });
    }
  }

  async function handleSalvarPerfil() {
    if (!novoNome.trim()) {
      setErroPerfil("O nome não pode estar vazio.");
      return;
    }
    setLoadingPerfil(true);
    setErroPerfil("");
    try {
      const response = await fetch(`https://health-plus-api.onrender.com/usuario/${usuario.cpf}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome }),
      });
      const data = await response.json();
      if (response.ok) {
        await salvarUsuario({ ...usuario, nome: novoNome });
        setModalPerfil(false);
      } else {
        setErroPerfil(data.erro || "Erro ao atualizar.");
      }
    } catch (e) {
      setErroPerfil("Erro de conexão.");
    } finally {
      setLoadingPerfil(false);
    }
  }

  async function handleMudarSenha() {
    if (novaSenha.length < 6) {
      setErroSenha("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }
    setLoadingSenha(true);
    setErroSenha("");
    try {
      const response = await fetch(`https://health-plus-api.onrender.com/usuario/${usuario.cpf}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha: novaSenha }),
      });
      const data = await response.json();
      if (response.ok) {
        setSucessoSenha("Senha atualizada com sucesso! 🌱");
        setTimeout(() => {
          setModalSenha(false);
          setSenhaAtual("");
          setNovaSenha("");
          setConfirmarSenha("");
          setSucessoSenha("");
        }, 2000);
      } else {
        setErroSenha(data.erro || "Erro ao atualizar.");
      }
    } catch (e) {
      setErroSenha("Erro de conexão.");
    } finally {
      setLoadingSenha(false);
    }
  }

  async function handleLogout() {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/auth/login");
          },
        },
      ]
    );
  }

  const itensMenu = [
    { icone: "create-outline", label: "Editar Perfil", onPress: () => setModalPerfil(true) },
    { icone: "lock-closed-outline", label: "Mudar Senha", onPress: () => setModalSenha(true) },
    { icone: "options-outline", label: "Preferências", onPress: () => setModalPrefs(true) },
    { icone: "bar-chart-outline", label: "Resumo diário", onPress: () => setModalResumo(true) },
    { icone: "gift-outline", label: "Resgates", onPress: () => router.push("/recompensas?section=resgates") },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Topo verde com foto e nome */}
      <View style={styles.topo}>
        <TouchableOpacity onPress={escolherFoto} style={styles.fotoContainer} activeOpacity={0.8}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.foto} />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Ionicons name="person" size={48} color={colors.white} />
            </View>
          )}
          <View style={styles.fotoEditar}>
            <Ionicons name="camera" size={14} color={colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.nome}>{usuario?.nome || "Usuário"}</Text>
        <Text style={styles.cpf}>
          {usuario?.cpf
            ? usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
            : ""}
        </Text>
      </View>

      {/* Menu de opções */}
      <View style={styles.menuCard}>
        {itensMenu.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index < itensMenu.length - 1 && styles.menuItemBorder]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icone} size={22} color={colors.primary} style={styles.menuIcone} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        ))}

        {/* Sair */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="exit-outline" size={22} color="#E53935" style={styles.menuIcone} />
          <Text style={[styles.menuLabel, { color: "#E53935" }]}>Sair</Text>
          <Ionicons name="chevron-forward" size={20} color="#E53935" />
        </TouchableOpacity>
      </View>

      {/* Modal Editar Perfil */}
      <Modal visible={modalPerfil} transparent animationType="slide" onRequestClose={() => setModalPerfil(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Editar Perfil</Text>
            <Text style={styles.modalLabel}>Nome</Text>
            <TextInput
              style={styles.modalInput}
              value={novoNome}
              onChangeText={(t) => { setNovoNome(t); setErroPerfil(""); }}
              placeholder="Seu nome"
              placeholderTextColor="#ccc"
            />
            {erroPerfil ? <Text style={styles.modalErro}>{erroPerfil}</Text> : null}
            <TouchableOpacity style={styles.modalBotao} onPress={handleSalvarPerfil} activeOpacity={0.8}>
              {loadingPerfil ? <ActivityIndicator color={colors.white} /> : <Text style={styles.modalBotaoText}>Salvar</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelar} onPress={() => setModalPerfil(false)}>
              <Text style={styles.modalCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Mudar Senha */}
      <Modal visible={modalSenha} transparent animationType="slide" onRequestClose={() => setModalSenha(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Mudar Senha</Text>
            <Text style={styles.modalLabel}>Nova senha</Text>
            <TextInput
              style={styles.modalInput}
              value={novaSenha}
              onChangeText={(t) => { setNovaSenha(t); setErroSenha(""); }}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#ccc"
              secureTextEntry
            />
            <Text style={styles.modalLabel}>Confirmar nova senha</Text>
            <TextInput
              style={styles.modalInput}
              value={confirmarSenha}
              onChangeText={(t) => { setConfirmarSenha(t); setErroSenha(""); }}
              placeholder="Repita a nova senha"
              placeholderTextColor="#ccc"
              secureTextEntry
            />
            {erroSenha ? <Text style={styles.modalErro}>{erroSenha}</Text> : null}
            {sucessoSenha ? <Text style={styles.modalSucesso}>{sucessoSenha}</Text> : null}
            <TouchableOpacity style={styles.modalBotao} onPress={handleMudarSenha} activeOpacity={0.8}>
              {loadingSenha ? <ActivityIndicator color={colors.white} /> : <Text style={styles.modalBotaoText}>Confirmar</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelar} onPress={() => setModalSenha(false)}>
              <Text style={styles.modalCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Preferências */}
      <Modal visible={modalPrefs} transparent animationType="slide" onRequestClose={() => setModalPrefs(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Preferências</Text>

            {[
              { label: "Notificações", valor: notificacoes, set: setNotificacoes },
              { label: "Som ambiente", valor: somAmbiente, set: setSomAmbiente },
              { label: "Modo noturno", valor: modoNoturno, set: setModoNoturno },
            ].map((pref, i) => (
              <TouchableOpacity
                key={i}
                style={styles.prefRow}
                onPress={() => pref.set(!pref.valor)}
                activeOpacity={0.7}
              >
                <Text style={styles.prefLabel}>{pref.label}</Text>
                <View style={[styles.toggle, pref.valor && styles.toggleAtivo]}>
                  <View style={[styles.toggleCircle, pref.valor && styles.toggleCircleAtivo]} />
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={[styles.modalBotao, { marginTop: 16 }]} onPress={() => setModalPrefs(false)}>
              <Text style={styles.modalBotaoText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal Resumo Diário */}
      <Modal visible={modalResumo} transparent animationType="slide" onRequestClose={() => setModalResumo(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Resumo do dia</Text>

            {/* Progresso geral */}
            <View style={styles.resumoProgresso}>
              <Text style={styles.resumoTexto}>
                {concluidas} de {totalMissoes} missões concluídas
              </Text>
              <View style={styles.resumoBarra}>
                <View style={[styles.resumoBarraFill, { width: `${(concluidas / totalMissoes) * 100}%` }]} />
              </View>
              <Text style={styles.resumoGemas}>🔮 {gemasHoje} gemas ganhas hoje</Text>
            </View>

            {/* Lista de missões */}
            {missoes.map((m) => {
              const concluida = m.atual >= m.meta;
              return (
                <View key={m.id} style={styles.resumoItem}>
                  <View style={[styles.resumoIcone, concluida && styles.resumoIconeConcluido]}>
                    <Ionicons
                      name={m.icon}
                      size={18}
                      color={concluida ? colors.white : colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resumoItemTitulo}>{m.titulo}</Text>
                    <Text style={styles.resumoItemDesc}>
                      {m.atual} / {m.meta} {m.unidade}
                    </Text>
                  </View>
                  {concluida && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </View>
              );
            })}

            <TouchableOpacity style={styles.modalBotao} onPress={() => setModalResumo(false)}>
              <Text style={styles.modalBotaoText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 32 },

  topo: {
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 32,
  },
  fotoContainer: { position: "relative", marginBottom: 12 },
  foto: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.white },
  fotoPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.green3,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: colors.white,
  },
  fotoEditar: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: colors.green2,
    borderRadius: 12, padding: 4,
    borderWidth: 2, borderColor: colors.white,
  },
  nome: { fontSize: 22, fontWeight: "800", color: colors.white },
  cpf: { fontSize: 13, color: colors.white, opacity: 0.75, marginTop: 4 },

  menuCard: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E4EFE4",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E4EFE4",
  },
  menuIcone: { marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.textDark },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center", paddingHorizontal: 24,
  },
  modalBox: { backgroundColor: colors.white, borderRadius: 20, padding: 24, width: "100%" },
  modalTitulo: { fontSize: 20, fontWeight: "800", color: colors.primary, marginBottom: 16 },
  modalLabel: { fontSize: 13, fontWeight: "600", color: colors.textDark, marginBottom: 6 },
  modalInput: {
    backgroundColor: "#F5F5F5", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: colors.textDark, marginBottom: 14,
  },
  modalErro: { color: "#E53935", fontSize: 13, fontWeight: "600", marginBottom: 10 },
  modalSucesso: { color: colors.primary, fontSize: 13, fontWeight: "600", marginBottom: 10 },
  modalBotao: {
    backgroundColor: colors.primary, borderRadius: 50,
    paddingVertical: 14, alignItems: "center", marginBottom: 10,
  },
  modalBotaoText: { color: colors.white, fontSize: 15, fontWeight: "700" },
  modalCancelar: { alignItems: "center", paddingVertical: 8 },
  modalCancelarText: { color: colors.inactive, fontSize: 14, fontWeight: "600" },

  prefRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  prefLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.textDark },
  toggle: {
    width: 48, height: 26, borderRadius: 13,
    backgroundColor: "#E0E0E0", padding: 2,
    justifyContent: "center",
  },
  toggleAtivo: { backgroundColor: colors.primary },
  toggleCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.white,
    alignSelf: "flex-start",
  },
  toggleCircleAtivo: { alignSelf: "flex-end" },

  resumoProgresso: {
    backgroundColor: "#F5F9F5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  resumoTexto: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  resumoBarra: {
    height: 8,
    backgroundColor: "#E0EDE8",
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 8,
  },
  resumoBarraFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 50,
  },
  resumoGemas: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: "600",
  },
  resumoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  resumoIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E8F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  resumoIconeConcluido: {
    backgroundColor: colors.primary,
  },
  resumoItemTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark,
  },
  resumoItemDesc: {
    fontSize: 12,
    color: colors.inactive,
    marginTop: 2,
  },
});