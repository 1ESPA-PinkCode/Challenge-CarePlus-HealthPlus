// context/JardimContext.jsx
import { createContext, useContext, useState } from "react";

const JardimContext = createContext(null);

export function JardimProvider({ children }) {
  // flor exibida na Home (e selecionada no Jardim)
  const [florAtual, setFlorAtual] = useState("girassol");

  // nível do usuário — define quais flores estão desbloqueadas.
  // 2 => girassol (nível 1) e rosa (nível 2) liberados; resto bloqueado.
  const [nivelUsuario, setNivelUsuario] = useState(2);

  // simulação de progresso pra testar os estágios da flor
  const [missoesFeitas, setMissoesFeitas] = useState(35);
  const totalMissoes = 40;

  return (
    <JardimContext.Provider
      value={{
        florAtual,
        setFlorAtual,
        nivelUsuario,
        setNivelUsuario,
        missoesFeitas,
        setMissoesFeitas,
        totalMissoes,
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