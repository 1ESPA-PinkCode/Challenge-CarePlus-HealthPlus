import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialMessages = [
  {
    sender: "bloom",
    text: "Oi, eu sou a Bloom. Vou te acompanhar com algumas perguntas simples para entender como você está hoje.",
  },
];

const ChatContext = createContext({
  messages: initialMessages,
  setMessages: () => {},
  currentStep: "start",
  setCurrentStep: () => {},
  resetChat: () => {},
});

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState(initialMessages);
  const [currentStep, setCurrentStep] = useState("start");

  useEffect(() => {
    async function carregarChat() {
      const mensagensSalvas = await AsyncStorage.getItem("@bloom_messages");
      const etapaSalva = await AsyncStorage.getItem("@bloom_step");

      if (mensagensSalvas) {
        setMessages(JSON.parse(mensagensSalvas));
      }

      if (etapaSalva) {
        setCurrentStep(etapaSalva);
      }
    }

    carregarChat();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("@bloom_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    AsyncStorage.setItem("@bloom_step", currentStep);
  }, [currentStep]);

  function resetChat() {
    setMessages(initialMessages);
    setCurrentStep("start");
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        currentStep,
        setCurrentStep,
        resetChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}