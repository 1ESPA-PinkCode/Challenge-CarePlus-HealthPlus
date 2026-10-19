// lib/supabase.js — conexão única com o banco
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    // no navegador o próprio supabase usa localStorage; no celular, AsyncStorage
    storage: Platform.OS === "web" ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// O login do app é por CPF. O Supabase Auth trabalha com e-mail,
// então cada CPF vira um e-mail interno (nunca exibido ao usuário).
export function emailDoCpf(cpf) {
  return `${String(cpf).replace(/\D/g, "")}@healthplus.app`;
}

// Traduz os erros do banco para mensagens amigáveis
export function mensagemErro(e) {
  const m = (e?.message || "").toLowerCase();
  if (m.includes("invalid login")) return "CPF ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Já existe uma conta com esse CPF.";
  if (m.includes("gemas insuficientes")) return "Você ainda não tem gemas suficientes.";
  if (m.includes("já resgatada")) return "Essa recompensa já foi resgatada.";
  if (m.includes("código não encontrado")) return "Código de convite não encontrado.";
  if (m.includes("network") || m.includes("fetch")) return "Erro de conexão. Verifique sua internet.";
  return e?.message || "Algo deu errado. Tente novamente.";
}
