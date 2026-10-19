// context/MissoesContext.jsx — missões da gincana NEXT (regras e pontos ficam no banco)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { mensagemErro, supabase } from "../lib/supabase";
import { useUsuario } from "./UsuarioContext";

const MissoesContext = createContext(null);

export const INSTAGRAM = "@healthplusnext";

// Textos e ícones de cada missão. Pontos, metas e códigos vêm do banco.
// acao: o que acontece ao tocar no botão da missão
export const CATALOGO_MISSOES = [
  { id: "qr_renmap",   icon: "qr-code-outline",       titulo: "Caça ao QR code",       desc: "Encontre o QR code no estande do RENMAP e escaneie com a câmera", unidade: "QR code",   acao: "codigo",      botao: "Validar" },
  { id: "ativacao",    icon: "flash-outline",         titulo: "Bora se ativar!",       desc: "Participe de uma ativação do NEXT e peça o código para a equipe",  unidade: "ativação",  acao: "codigo",      botao: "Validar" },
  { id: "story",       icon: "logo-instagram",        titulo: "Mostra pro mundo",      desc: `Poste um story marcando a @fiap e o ${INSTAGRAM}`,                  unidade: "story",     acao: "codigo",      botao: "Validar" },
  { id: "agua",        icon: "water-outline",         titulo: "Hidratação no evento",  desc: "Beba 1 litro de água: 4 copos de 250 ml",                          unidade: "copos",     acao: "registrar",   botao: "+1 copo" },
  { id: "respira",     icon: "leaf-outline",          titulo: "Respira com a Bloom",   desc: "1 minuto de respiração guiada para recarregar",                    unidade: "minuto",    acao: "respira",     botao: "Começar" },
  { id: "alongamento", icon: "body-outline",          titulo: "Alongamento relâmpago", desc: "2 minutos de alongamento guiado, aí mesmo onde você está",         unidade: "sessão",    acao: "alongamento", botao: "Começar" },
  { id: "quiz",        icon: "bulb-outline",          titulo: "Quiz de autocuidado",   desc: "Acerte 3 perguntas rápidas sobre saúde",                           unidade: "quiz",      acao: "quiz",        botao: "Jogar" },
  { id: "flor",        icon: "flower-outline",        titulo: "Plante sua flor",       desc: "Escolha a flor do seu jardim",                                     unidade: "flor",      acao: "jardim",      botao: "Ir" },
  { id: "amigo",       icon: "person-add-outline",    titulo: "Traga um amigo",        desc: "Ganhe quando alguém entrar no seu grupo pelo seu código",          unidade: "amigo",     acao: "grupos",      botao: "Ir" },
  { id: "grupo3",      icon: "people-outline",        titulo: "Grupo de 3",            desc: "Tenha um grupo com pelo menos 3 pessoas",                          unidade: "grupo",     acao: "grupos",      botao: "Ir" },
  { id: "avaliar",     icon: "star-outline",          titulo: "Avalie o Health Plus",  desc: "Dê sua nota e conte o que achou do app",                           unidade: "avaliação", acao: "avaliar",     botao: "Avaliar" },
];

const montar = (dadosBanco = {}) =>
  CATALOGO_MISSOES.map((m) => {
    const b = dadosBanco[m.id] || {};
    return { ...m, gemas: b.pontos ?? 0, meta: b.meta ?? 1, atual: b.atual ?? 0, concluida: !!b.concluida };
  });

export function MissoesProvider({ children }) {
  const { perfil, recarregarPerfil } = useUsuario();
  const [missoes, setMissoes] = useState(() => montar());
  const [carregado, setCarregado] = useState(false);
  const [aviso, setAviso] = useState(null); // { titulo, gemas } ao concluir uma missão
  const userId = perfil?.id;

  const carregar = useCallback(async () => {
    if (!userId) {
      setMissoes(montar());
      return;
    }
    const { data, error } = await supabase.rpc("minhas_missoes");
    if (!error) setMissoes(montar(Object.fromEntries((data || []).map((r) => [r.id, r]))));
    setCarregado(true);
  }, [userId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // QR escaneado antes do login: valida assim que a pessoa entra
  useEffect(() => {
    if (!userId) return;
    AsyncStorage.getItem("@healthplus:qr_pendente").then(async (codigo) => {
      if (!codigo) return;
      await AsyncStorage.removeItem("@healthplus:qr_pendente");
      const { data, error } = await supabase.rpc("validar_codigo", { p_missao: "qr_renmap", p_codigo: codigo });
      if (!error && data) {
        await carregar();
        setAviso({ titulo: "Caça ao QR code", gemas: 30 });
        recarregarPerfil();
      }
    });
  }, [userId]);

  function aoConcluir(id) {
    const m = missoes.find((x) => x.id === id);
    setMissoes((lista) => lista.map((x) => (x.id === id ? { ...x, atual: x.meta, concluida: true } : x)));
    if (m) setAviso({ titulo: m.titulo, gemas: m.gemas });
    recarregarPerfil();
  }

  // Missões que a pessoa marca (ex.: copos de água)
  async function registrar(id) {
    const m = missoes.find((x) => x.id === id);
    if (!m || m.concluida) return;
    setMissoes((lista) => lista.map((x) => (x.id === id ? { ...x, atual: Math.min(x.meta, x.atual + 1) } : x)));
    const { data, error } = await supabase.rpc("registrar_missao", { p_missao: id, p_passo: 1 });
    if (error) {
      carregar();
      return { ok: false, erro: mensagemErro(error) };
    }
    if (data.concluiu_agora) aoConcluir(id);
    else setMissoes((lista) => lista.map((x) => (x.id === id ? { ...x, atual: data.atual } : x)));
    return { ok: true };
  }

  async function validarCodigo(id, codigo) {
    const { data, error } = await supabase.rpc("validar_codigo", { p_missao: id, p_codigo: codigo });
    if (error) return { ok: false, erro: mensagemErro(error) };
    if (data) aoConcluir(id);
    else carregar();
    return { ok: true, nova: data };
  }

  async function concluirAuto(id) {
    const m = missoes.find((x) => x.id === id);
    if (m?.concluida) return { ok: true, nova: false };
    const { data, error } = await supabase.rpc("concluir_auto", { p_missao: id });
    if (error) return { ok: false, erro: mensagemErro(error) };
    if (data) aoConcluir(id);
    return { ok: true, nova: data };
  }

  async function avaliar(nota, comentario) {
    const { data, error } = await supabase.rpc("avaliar", { p_nota: nota, p_comentario: comentario });
    if (error) return { ok: false, erro: mensagemErro(error) };
    if (data) aoConcluir("avaliar");
    return { ok: true };
  }

  const totalMissoes = missoes.length;
  const concluidas = missoes.filter((m) => m.concluida).length;
  const crescimentoFlor = totalMissoes > 0 ? concluidas / totalMissoes : 0;

  return (
    <MissoesContext.Provider
      value={{
        missoes,
        registrar,
        validarCodigo,
        concluirAuto,
        avaliar,
        recarregar: carregar,
        concluidas,
        totalMissoes,
        crescimentoFlor,
        carregado,
        aviso,
        fecharAviso: () => setAviso(null),
      }}
    >
      {children}
    </MissoesContext.Provider>
  );
}

export function useMissoes() {
  const ctx = useContext(MissoesContext);
  if (!ctx) throw new Error("useMissoes precisa estar dentro de <MissoesProvider>");
  return ctx;
}
