// context/PassosContext.jsx — conta passos automaticamente enquanto o app está aberto
// - Android e computador: começa sozinho ao entrar no app
// - iPhone: a Apple exige um toque para liberar o sensor; o primeiro toque em
//   qualquer lugar do app já pede a permissão e começa a contar
// O navegador não deixa ler o sensor com o site fechado ou em segundo plano.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { criarContadorPassos } from "../lib/contadorPassos";
import { supabase } from "../lib/supabase";
import { useUsuario } from "./UsuarioContext";

const PassosContext = createContext(null);
const SINCRONIZAR_A_CADA = 10000; // ms

export function PassosProvider({ children }) {
  const { perfil, recarregarPerfil } = useUsuario();
  const userId = perfil?.id;
  const [estado, setEstado] = useState("parado"); // parado | aguardando_toque | contando | sem_sensor | negado
  const [sessao, setSessao] = useState(0);
  const naoEnviados = useRef(0);
  const contador = useRef(null);
  const assinaturaNativa = useRef(null);

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
      // evento encerrado ou sem internet: guarda para tentar de novo (exceto se encerrou)
      if (!(error.message || "").includes("encerrado")) naoEnviados.current += n;
      return;
    }
    recarregarPerfil();
  }

  async function ativar() {
    if (contador.current || assinaturaNativa.current) return;
    try {
      if (Platform.OS === "web") {
        contador.current = criarContadorPassos(somar);
        await contador.current.iniciar();
      } else {
        const { Pedometer } = await import("expo-sensors");
        if (!(await Pedometer.isAvailableAsync())) throw new Error("sem sensor");
        await Pedometer.requestPermissionsAsync();
        let anterior = 0;
        assinaturaNativa.current = Pedometer.watchStepCount((r) => {
          somar(r.steps - anterior);
          anterior = r.steps;
        });
      }
      setEstado("contando");
    } catch (e) {
      contador.current = null;
      setEstado((e.message || "").toLowerCase().includes("negad") ? "negado" : "sem_sensor");
    }
  }

  function parar() {
    contador.current?.parar();
    contador.current = null;
    assinaturaNativa.current?.remove?.();
    assinaturaNativa.current = null;
  }

  // liga sozinho quando a pessoa está logada
  useEffect(() => {
    if (!userId) {
      parar();
      setEstado("parado");
      return;
    }
    if (Platform.OS !== "web") {
      ativar();
      return () => parar();
    }
    if (typeof window === "undefined" || typeof DeviceMotionEvent === "undefined") {
      setEstado("sem_sensor");
      return;
    }
    const precisaToque = typeof DeviceMotionEvent.requestPermission === "function";
    if (!precisaToque) {
      ativar();
      return () => parar();
    }
    // iPhone: espera o primeiro toque em qualquer lugar do app
    setEstado("aguardando_toque");
    const aoTocar = () => {
      document.removeEventListener("touchend", aoTocar, true);
      document.removeEventListener("click", aoTocar, true);
      ativar();
    };
    document.addEventListener("touchend", aoTocar, true);
    document.addEventListener("click", aoTocar, true);
    return () => {
      document.removeEventListener("touchend", aoTocar, true);
      document.removeEventListener("click", aoTocar, true);
      parar();
    };
  }, [userId]);

  // envia os passos de tempos em tempos e ao sair/minimizar o app
  useEffect(() => {
    if (!userId) return;
    const t = setInterval(enviar, SINCRONIZAR_A_CADA);
    const aoEsconder = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") enviar();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", aoEsconder);
      window.addEventListener("pagehide", enviar);
    }
    return () => {
      clearInterval(t);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", aoEsconder);
        window.removeEventListener("pagehide", enviar);
      }
      enviar();
    };
  }, [userId]);

  const total = (perfil?.passos ?? 0) + naoEnviados.current;

  return (
    <PassosContext.Provider value={{ estado, sessao, total, ativar }}>{children}</PassosContext.Provider>
  );
}

export function usePassos() {
  const ctx = useContext(PassosContext);
  if (!ctx) throw new Error("usePassos precisa estar dentro de <PassosProvider>");
  return ctx;
}
