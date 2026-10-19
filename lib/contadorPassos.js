// lib/contadorPassos.js — detecta passos pelo acelerômetro do navegador
// Regras anti-trapaça: só conta passos em ritmo de caminhada (0,3 s a 1,2 s entre passos)
// e só depois de 4 passos seguidos nesse ritmo. Sacudir o celular rápido não conta.

const INTERVALO_MIN = 300; // ms (no máx. ~3,3 passos/s)
const INTERVALO_MAX = 1200; // ms
const SEQUENCIA_MIN = 4;
const LIMIAR = 1.1; // m/s² acima da média

export function criarContadorPassos(onPasso) {
  let media = 9.8;
  let acimaDoLimiar = false;
  let ultimoPasso = 0;
  let pendentes = 0; // passos ainda não confirmados (sequência curta)

  function aoMover(evento) {
    const a = evento.accelerationIncludingGravity;
    if (!a || a.x == null) return;
    const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    media = media * 0.9 + mag * 0.1; // média móvel (remove a gravidade)
    const sinal = mag - media;

    if (!acimaDoLimiar && sinal > LIMIAR) {
      acimaDoLimiar = true;
      const agora = Date.now();
      const intervalo = agora - ultimoPasso;
      if (intervalo < INTERVALO_MIN) return; // rápido demais: ignora
      ultimoPasso = agora;
      if (intervalo > INTERVALO_MAX) {
        pendentes = 1; // recomeça a sequência
        return;
      }
      pendentes += 1;
      if (pendentes === SEQUENCIA_MIN) onPasso(SEQUENCIA_MIN);
      else if (pendentes > SEQUENCIA_MIN) onPasso(1);
    } else if (acimaDoLimiar && sinal < LIMIAR * 0.3) {
      acimaDoLimiar = false;
    }
  }

  return {
    async iniciar() {
      if (typeof window === "undefined" || typeof DeviceMotionEvent === "undefined") {
        throw new Error("Este navegador não tem sensor de movimento.");
      }
      // iPhone: precisa pedir permissão a partir de um toque
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        const r = await DeviceMotionEvent.requestPermission();
        if (r !== "granted") throw new Error("Permissão de movimento negada. Toque em Permitir para contar seus passos.");
      }
      window.addEventListener("devicemotion", aoMover);
    },
    parar() {
      if (typeof window !== "undefined") window.removeEventListener("devicemotion", aoMover);
    },
  };
}

// Mantém a tela acesa durante a caminhada (quando o navegador suporta)
export async function manterTelaAcesa() {
  try {
    if (typeof navigator !== "undefined" && navigator.wakeLock) return await navigator.wakeLock.request("screen");
  } catch (e) {}
  return null;
}
