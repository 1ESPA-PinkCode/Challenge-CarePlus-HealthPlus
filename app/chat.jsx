import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { useUsuario } from "../context/UsuarioContext";

const CAREPLUS_URL = "https://www.careplus.com.br";

const steps = {
  start: {
    bloom:
      "Oi, eu sou a Bloom. Vou te acompanhar com algumas perguntas simples para entender como você está hoje.",
    options: [
      { text: "Estou bem", next: "bem" },
      { text: "Estou cansado(a)", next: "cansado" },
      { text: "Estou com dor física", next: "dorFisica" },
      { text: "Não estou bem emocionalmente", next: "emocional" },
    ],
  },

  bem: {
    bloom: "Que bom saber disso! Seu corpo também está se sentindo bem hoje?",
    options: [
      { text: "Sim, estou disposto(a)", next: "disposto" },
      { text: "Mais ou menos", next: "maisOuMenos" },
      { text: "Estou com um leve desconforto", next: "dorFisica" },
    ],
  },

  cansado: {
    bloom: "Entendi. Esse cansaço parece mais físico, mental ou os dois?",
    options: [
      { text: "Mais físico", next: "cansacoFisico" },
      { text: "Mais mental", next: "emocional" },
      { text: "Os dois", next: "ambos" },
    ],
  },

  dorFisica: {
    bloom:
      "Sinto muito por isso. Essa dor é a primeira vez que acontece ou você já sentiu antes?",
    options: [
      { text: "É a primeira vez", next: "primeiraDor" },
      { text: "Já senti antes", next: "dorRecorrente" },
      { text: "Não tenho certeza", next: "observarDor" },
    ],
  },

  primeiraDor: {
    bloom: "Entendi. A dor começou de repente ou foi aparecendo aos poucos?",
    options: [
      { text: "Começou de repente", next: "dorRepentina" },
      { text: "Foi aumentando aos poucos", next: "dorGradual" },
      { text: "Não sei dizer", next: "observarDor" },
    ],
  },

  dorRecorrente: {
    bloom:
      "Comparando com as outras vezes, essa dor está igual, mais fraca ou mais forte?",
    options: [
      { text: "Está igual", next: "dorIgual" },
      { text: "Está mais fraca", next: "dorFraca" },
      { text: "Está mais forte", next: "dorForte" },
    ],
  },

  dorIgual: {
    bloom:
      "Você já sabe se algo costuma melhorar essa dor, como repouso, água, alongamento leve ou alimentação?",
    options: [
      { text: "Sim, algo costuma ajudar", next: "cuidadosDor" },
      { text: "Nada costuma ajudar", next: "consultaCarePlus" },
      { text: "Ainda não observei", next: "observarDor" },
    ],
  },

  dorFraca: {
    bloom:
      "Que bom que está mais fraca. Mesmo assim, vale observar. Você consegue fazer suas atividades normalmente?",
    options: [
      { text: "Sim, consigo", next: "cuidadosLeves" },
      { text: "Com dificuldade", next: "reduzirRitmo" },
    ],
  },

  dorForte: {
    bloom:
      "Dor mais forte que o normal merece atenção. Ela está atrapalhando suas atividades ou veio com outro sintoma?",
    options: [
      { text: "Está atrapalhando bastante", next: "consultaCarePlus" },
      { text: "Veio com outro sintoma", next: "consultaCarePlus" },
      { text: "Não, só está mais forte", next: "reduzirRitmo" },
    ],
  },

  dorRepentina: {
    bloom:
      "Dor repentina pode precisar de mais atenção. Ela é intensa ou veio acompanhada de tontura, falta de ar, febre ou mal-estar forte?",
    options: [
      { text: "Sim, veio com sintomas", next: "consultaCarePlus" },
      { text: "É intensa", next: "consultaCarePlus" },
      { text: "Não, é leve", next: "cuidadosLeves" },
    ],
  },

  dorGradual: {
    bloom:
      "Às vezes dores graduais aparecem por esforço, postura, tensão ou cansaço. Você fez algo diferente hoje?",
    options: [
      { text: "Fiz esforço físico", next: "cuidadosDor" },
      { text: "Fiquei muito tempo sentado(a)", next: "cuidadosLeves" },
      { text: "Não fiz nada diferente", next: "observarDor" },
    ],
  },

  observarDor: {
    bloom:
      "Tente observar onde dói, há quanto tempo começou e se melhora ou piora com movimento. Se persistir ou piorar, procure um profissional.",
    options: [
      { text: "Quero uma sugestão leve", next: "cuidadosLeves" },
      { text: "Quero buscar atendimento", next: "consultaCarePlus" },
    ],
  },

  cuidadosDor: {
    bloom:
      "Você pode tentar uma pausa, beber água, evitar esforço e fazer movimentos leves apenas se não aumentar a dor.",
    options: [
      { text: "Entendi", next: "consultaCarePlus" },
      { text: "Também estou emocionalmente mal", next: "emocional" },
    ],
  },

  cuidadosLeves: {
    bloom:
      "Para hoje, uma missão leve pode ajudar: beber água, respirar fundo por 2 minutos e fazer uma pausa curta. Sem se forçar.",
    options: [
      { text: "Gostei da sugestão", next: "consultaCarePlus" },
      { text: "Quero falar com um profissional", next: "consultaCarePlus" },
    ],
  },

  reduzirRitmo: {
    bloom:
      "Talvez seja um bom momento para reduzir o ritmo. Evite esforço, observe a dor e procure ajuda se ela piorar ou não passar.",
    options: [
      { text: "Vou observar", next: "consultaCarePlus" },
      { text: "Quero falar sobre emoções", next: "emocional" },
    ],
  },

  consultaCarePlus: {
    bloom:
      "Caso o desconforto continue ou volte a acontecer, você pode acessar a CarePlus para verificar opções de atendimento e agendar uma consulta.",
    options: [
      { text: "Acessar CarePlus", next: "abrirCarePlus" },
      { text: "Finalizar conversa", next: "end" },
    ],
  },

  emocional: {
    bloom:
      "Sinto muito que você esteja se sentindo assim. Você diria que está mais ansioso(a), triste, irritado(a) ou sobrecarregado(a)?",
    options: [
      { text: "Ansioso(a)", next: "ansiedade" },
      { text: "Triste", next: "tristeza" },
      { text: "Sobrecarregado(a)", next: "sobrecarga" },
      { text: "Irritado(a)", next: "irritacao" },
    ],
  },

  ansiedade: {
    bloom:
      "Obrigada por compartilhar. Que tal respirar com calma por alguns segundos e escolher uma ação pequena para agora?",
    options: [
      { text: "Respirar por 2 minutos", next: "end" },
      { text: "Beber água", next: "end" },
      { text: "Fazer uma pausa", next: "end" },
    ],
  },

  tristeza: {
    bloom:
      "Sinto muito. Em dias assim, uma atitude pequena já conta. Você gostaria de conversar com alguém ou fazer algo leve?",
    options: [
      { text: "Conversar com alguém", next: "end" },
      { text: "Fazer algo leve", next: "cuidadosLeves" },
    ],
  },

  sobrecarga: {
    bloom:
      "Parece que tem muita coisa acumulada. Tente escolher apenas uma tarefa pequena agora, sem tentar resolver tudo de uma vez.",
    options: [
      { text: "Vou escolher uma tarefa pequena", next: "end" },
      { text: "Quero uma sugestão leve", next: "cuidadosLeves" },
    ],
  },

  irritacao: {
    bloom:
      "Entendi. Talvez seu corpo esteja pedindo uma pausa. Se puder, afaste-se um pouco do que está te irritando e respire com calma.",
    options: [
      { text: "Vou tentar", next: "end" },
      { text: "Quero uma sugestão leve", next: "cuidadosLeves" },
    ],
  },

  cansacoFisico: {
    bloom: "Seu corpo pode estar pedindo recuperação. Você dormiu bem e se alimentou hoje?",
    options: [
      { text: "Sim", next: "cuidadosLeves" },
      { text: "Não muito", next: "cuidadosLeves" },
      { text: "Mais ou menos", next: "cuidadosLeves" },
    ],
  },

  ambos: {
    bloom:
      "Parece que hoje está sendo um dia pesado para o corpo e para a mente. Vamos começar com algo pequeno?",
    options: [
      { text: "Beber água", next: "end" },
      { text: "Respirar um pouco", next: "end" },
      { text: "Quero falar com um profissional", next: "consultaCarePlus" },
    ],
  },

  disposto: {
    bloom:
      "Ótimo! Talvez hoje seja um bom dia para cumprir uma missão leve e manter esse ritmo.",
    options: [{ text: "Finalizar conversa", next: "end" }],
  },

  maisOuMenos: {
    bloom:
      "Tudo bem ter dias assim. Tente fazer algo pequeno por você hoje, como beber água ou respirar fundo por alguns minutos.",
    options: [{ text: "Finalizar conversa", next: "end" }],
  },

  end: {
    bloom:
      "Obrigada por conversar comigo. Lembre-se: cuidar de você também é uma conquista.",
    options: [{ text: "Voltar para início", next: "home" }],
  },
};

export default function Chat() {
  const { usuario } = useUsuario();
  const [currentStep, setCurrentStep] = useState("start");
  const [messages, setMessages] = useState([
    {
      sender: "bloom",
      text: `Oi${usuario?.nome ? `, ${usuario.nome.split(" ")[0]}` : ""}! Eu sou a Bloom. Vou te acompanhar com algumas perguntas simples para entender como você está hoje.`,
    },
  ]);

  function handleOption(option) {
    if (option.next === "home") {
      router.replace("/");
      return;
    }

    if (option.next === "abrirCarePlus") {
      Linking.openURL(CAREPLUS_URL);
      return;
    }

    const userMessage = {
      sender: "user",
      text: option.text,
    };

    const bloomMessage = {
      sender: "bloom",
      text: steps[option.next].bloom,
    };

    setMessages([...messages, userMessage, bloomMessage]);
    setCurrentStep(option.next);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Bloom</Text>

        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.chatContent}>
        <Text style={styles.today}>HOJE</Text>

        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.bubble,
              message.sender === "user"
                ? styles.userBubble
                : styles.bloomBubble,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.optionsContainer}>
        {steps[currentStep].options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleOption(option)}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  header: {
    backgroundColor: colors.primary,
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  chatContent: {
    padding: 18,
    paddingBottom: 20,
  },

  today: {
    textAlign: "center",
    color: "#B5B5B5",
    fontWeight: "800",
    marginBottom: 18,
  },

  bubble: {
    maxWidth: "78%",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },

  bloomBubble: {
    backgroundColor: "#D9D9D9",
    alignSelf: "flex-start",
  },

  userBubble: {
    backgroundColor: "#89E08C",
    alignSelf: "flex-end",
  },

  messageText: {
    fontSize: 15,
    color: "#1F1F1F",
    lineHeight: 20,
  },

  optionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    padding: 14,
    backgroundColor: "#FFFFFF",
  },

  optionButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  optionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});