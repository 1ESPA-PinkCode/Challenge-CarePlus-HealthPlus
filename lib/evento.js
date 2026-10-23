// lib/evento.js — horário da gincana e ranking (vêm do banco)
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const PADRAO = { inicio: "2026-10-24T12:00:00-03:00", fim: "2026-10-24T17:45:00-03:00" };

export function useEvento() {
  const [evento, setEvento] = useState({ inicio: new Date(PADRAO.inicio), fim: new Date(PADRAO.fim) });
  const [agora, setAgora] = useState(Date.now());

  useEffect(() => {
    supabase
      .from("evento")
      .select("inicio, fim")
      .eq("id", 1)
      .single()
      .then(({ data }) => data && setEvento({ inicio: new Date(data.inicio), fim: new Date(data.fim) }));
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const status = agora < evento.inicio ? "antes" : agora <= evento.fim ? "aberto" : "encerrado";
  return { ...evento, agora, status, restanteMs: Math.max(0, evento.fim - agora), paraComecarMs: Math.max(0, evento.inicio - agora) };
}

export function formatarTempo(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dd = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${dd(m)}:${dd(seg)}` : `${dd(m)}:${dd(seg)}`;
}

export function useRanking(limite = 10, intervalo = 5000) {
  const [linhas, setLinhas] = useState([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function buscar() {
      const { data } = await supabase.rpc("ranking_evento", { p_limite: limite });
      if (ativo && data) {
        setLinhas(data);
        setCarregado(true);
      }
    }
    buscar();
    const t = setInterval(buscar, intervalo);
    return () => {
      ativo = false;
      clearInterval(t);
    };
  }, [limite, intervalo]);

  return { linhas, carregado };
}
