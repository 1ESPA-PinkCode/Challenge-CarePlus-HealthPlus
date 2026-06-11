import { createContext, useContext, useState } from "react";

const GemsContext = createContext();

export function GemsProvider({ children }) {
  const [gemas, setGemas] = useState(150);

  function addGemas(valor) {
    setGemas((atual) => atual + valor);
  }

  function removeGemas(valor) {
    setGemas((atual) => atual - valor);
  }

  return (
    <GemsContext.Provider
      value={{
        gemas,
        addGemas,
        removeGemas,
      }}
    >
      {children}
    </GemsContext.Provider>
  );
}

export function useGemas() {
  return useContext(GemsContext);
}