// context/JardimContext.jsx — nível e flor atual, derivados do perfil no banco
import { createContext, useContext } from "react";
import { useUsuario } from "./UsuarioContext";

const JardimContext = createContext(null);

// Regra: a cada 4 missões concluídas (≈ 1 dia completo) sobe 1 nível.
// Nível 1 libera o girassol; nível 9 libera todas as flores.
export const MISSOES_POR_NIVEL = 4;

export function JardimProvider({ children }) {
  const { perfil, atualizarPerfil } = useUsuario();
  const missoesFeitas = perfil?.missoes_total ?? 0;
  const nivelUsuario = Math.min(9, 1 + Math.floor(missoesFeitas / MISSOES_POR_NIVEL));
  const florAtual = perfil?.flor_atual || "girassol";

  function setFlorAtual(flor) {
    atualizarPerfil({ flor_atual: flor }).catch((e) => console.log("Erro ao trocar flor:", e.message));
  }

  return (
    <JardimContext.Provider
      value={{
        florAtual,
        setFlorAtual,
        nivelUsuario,
        missoesFeitas,
        totalMissoes: 9 * MISSOES_POR_NIVEL,
        streak: perfil?.streak ?? 0,
      }}
    >
      {children}
    </JardimContext.Provider>
  );
}

export function useJardim() {
  const ctx = useContext(JardimContext);
  if (!ctx) throw new Error("useJardim precisa estar dentro de <JardimProvider>");
  return ctx;
}
