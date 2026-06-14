// context/GruposContext.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const GruposContext = createContext(null);
const STORAGE_KEY = "@healthplus:grupos_v1";

// Grupo começa vazio — os membros são adicionados pelo usuário (por CPF)
const MEMBROS_INICIAIS = [];

// ----- validação de CPF (algoritmo oficial) -----
export function limparCpf(cpf) {
  return (cpf || "").replace(/\D/g, "");
}

export function formatarCpf(cpf) {
  const c = limparCpf(cpf).slice(0, 11);
  return c
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function cpfValido(cpf) {
  const c = limparCpf(cpf);
  if (c.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(c)) return false; // rejeita 111.111.111-11 etc.

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(c[i]) * (10 - i);
  let dig1 = (soma * 10) % 11;
  if (dig1 === 10) dig1 = 0;
  if (dig1 !== Number(c[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(c[i]) * (11 - i);
  let dig2 = (soma * 10) % 11;
  if (dig2 === 10) dig2 = 0;
  if (dig2 !== Number(c[10])) return false;

  return true;
}

export function GruposProvider({ children }) {
  const [nomeGrupo, setNomeGrupo] = useState("PinkCode");
  const [membros, setMembros] = useState(MEMBROS_INICIAIS);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const salvo = await AsyncStorage.getItem(STORAGE_KEY);
        if (salvo) {
          const dados = JSON.parse(salvo);
          if (dados.nomeGrupo) setNomeGrupo(dados.nomeGrupo);
          if (dados.membros) setMembros(dados.membros);
        }
      } catch (e) {
        console.log("Erro ao carregar grupos:", e);
      } finally {
        setCarregado(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!carregado) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ nomeGrupo, membros })).catch((e) =>
      console.log("Erro ao salvar grupos:", e)
    );
  }, [nomeGrupo, membros, carregado]);

  // Adiciona um membro por CPF. Retorna { ok, erro } pra tela mostrar feedback.
  function adicionarMembro(nome, cpf) {
    const nomeLimpo = (nome || "").trim();
    const cpfLimpo = limparCpf(cpf);

    if (nomeLimpo.length < 2) return { ok: false, erro: "Digite o nome da pessoa." };
    if (!cpfValido(cpfLimpo)) return { ok: false, erro: "CPF inválido. Confira os números." };
    if (membros.some((m) => limparCpf(m.cpf) === cpfLimpo))
      return { ok: false, erro: "Essa pessoa já está no grupo." };

    setMembros((lista) => [
      ...lista,
      { cpf: cpfLimpo, nome: nomeLimpo, missoes: 0, vitorias: 0 },
    ]);
    return { ok: true };
  }

  function removerMembro(cpf) {
    const cpfLimpo = limparCpf(cpf);
    setMembros((lista) => lista.filter((m) => limparCpf(m.cpf) !== cpfLimpo));
  }

  // Rankings ordenados (cópias pra não bagunçar o estado)
  const rankingMissoes = [...membros].sort((a, b) => b.missoes - a.missoes);
  const rankingVitorias = [...membros].sort((a, b) => b.vitorias - a.vitorias);

  return (
    <GruposContext.Provider
      value={{
        nomeGrupo,
        setNomeGrupo,
        membros,
        adicionarMembro,
        removerMembro,
        rankingMissoes,
        rankingVitorias,
        carregado,
      }}
    >
      {children}
    </GruposContext.Provider>
  );
}

export function useGrupos() {
  const ctx = useContext(GruposContext);
  if (!ctx) throw new Error("useGrupos precisa estar dentro de <GruposProvider>");
  return ctx;
}