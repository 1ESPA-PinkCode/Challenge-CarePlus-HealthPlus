// context/UsuarioContext.jsx — sessão (Supabase Auth) + perfil do banco
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { emailDoCpf, supabase } from "../lib/supabase";

const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
  const [sessao, setSessao] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregarPerfil = useCallback(async (userId) => {
    if (!userId) {
      setPerfil(null);
      return null;
    }
    const { data, error } = await supabase.from("perfis").select("*").eq("id", userId).single();
    if (error) {
      console.log("Erro ao carregar perfil:", error.message);
      return null;
    }
    setPerfil(data);
    return data;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSessao(data.session);
      await carregarPerfil(data.session?.user?.id);
      setCarregando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
      if (!novaSessao) setPerfil(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [carregarPerfil]);

  async function entrar(cpf, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailDoCpf(cpf), password: senha });
    if (error) throw error;
    setSessao(data.session);
    await carregarPerfil(data.user.id);
  }

  async function cadastrar(nome, cpf, senha) {
    const { data, error } = await supabase.auth.signUp({
      email: emailDoCpf(cpf),
      password: senha,
      options: { data: { nome } },
    });
    if (error) throw error;
    // sem confirmação de e-mail, o cadastro já devolve a sessão
    if (data.session) {
      setSessao(data.session);
      await carregarPerfil(data.user.id);
    }
    return !!data.session;
  }

  async function atualizarPerfil(campos) {
    if (!perfil) return;
    const { data, error } = await supabase.from("perfis").update(campos).eq("id", perfil.id).select().single();
    if (error) throw error;
    setPerfil(data);
  }

  async function mudarSenha(novaSenha) {
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
    setPerfil(null);
    setSessao(null);
  }

  const recarregarPerfil = () => carregarPerfil(sessao?.user?.id);

  // mantém gemas/pontos atualizados (a equipe pode descontar ou dar missões a qualquer momento)
  useEffect(() => {
    const uid = sessao?.user?.id;
    if (!uid) return;
    const t = setInterval(() => carregarPerfil(uid), 12000);
    const aoVoltar = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") carregarPerfil(uid);
    };
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      clearInterval(t);
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [sessao?.user?.id, carregarPerfil]);

  // Compatibilidade com as telas existentes (usuario.nome, usuario.foto)
  const usuario = perfil ? { ...perfil, foto: perfil.foto_url } : null;
  async function salvarUsuario(dados) {
    const campos = {};
    if (dados.nome !== undefined) campos.nome = dados.nome;
    if (dados.foto !== undefined) campos.foto_url = dados.foto;
    await atualizarPerfil(campos);
  }

  return (
    <UsuarioContext.Provider
      value={{
        sessao,
        usuario,
        perfil,
        carregando,
        entrar,
        cadastrar,
        atualizarPerfil,
        salvarUsuario,
        mudarSenha,
        recarregarPerfil,
        logout,
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuario() {
  const ctx = useContext(UsuarioContext);
  if (!ctx) throw new Error("useUsuario precisa estar dentro de <UsuarioProvider>");
  return ctx;
}
