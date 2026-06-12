// context/UsuarioContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Carrega o usuário salvo no AsyncStorage quando o app abre
  useEffect(() => {
    async function carregarUsuario() {
      try {
        const salvo = await AsyncStorage.getItem("@healthplus:usuario");
        if (salvo) {
          setUsuario(JSON.parse(salvo));
        }
      } catch (e) {
        console.log("Erro ao carregar usuário:", e);
      } finally {
        setCarregando(false);
      }
    }
    carregarUsuario();
  }, []);

  // Salva o usuário no AsyncStorage e no contexto
  async function salvarUsuario(dados) {
    try {
      await AsyncStorage.setItem("@healthplus:usuario", JSON.stringify(dados));
      setUsuario(dados);
    } catch (e) {
      console.log("Erro ao salvar usuário:", e);
    }
  }

  // Remove o usuário do AsyncStorage e do contexto (logout)
  async function logout() {
    try {
      await AsyncStorage.removeItem("@healthplus:usuario");
      setUsuario(null);
    } catch (e) {
      console.log("Erro ao fazer logout:", e);
    }
  }

  return (
    <UsuarioContext.Provider value={{ usuario, carregando, salvarUsuario, logout }}>
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuario() {
  const ctx = useContext(UsuarioContext);
  if (!ctx) throw new Error("useUsuario precisa estar dentro de <UsuarioProvider>");
  return ctx;
}