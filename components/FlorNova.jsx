// components/FlorNova.jsx — novo visual das flores (girassol, margarida, tulipa e rosa)
// Props:
// - tipo: "girassol" | "margarida" | "tulipa" | "rosa"
// - target: crescimento de 0 a 1 (anima até ele)
// - size, showScenery (céu próprio), canteiro (terra embaixo)
// - animar: false = desenho parado (para listas com muitas flores)
// - celebrar: mude o valor (ex.: um contador) para soltar brilhos
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";

export const FLORES_NOVAS = ["girassol", "margarida", "tulipa", "rosa"];

const BX = 200; // base do caule
const BY = 318;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const fase = (g, ini, fim) => clamp((g - ini) / (fim - ini));
const suave = (t) => t * t * (3 - 2 * t);

const SEMENTES = Array.from({ length: 70 }, (_, i) => {
  const a = i * 2.39996;
  const r = 2.2 * Math.sqrt(i);
  return [Math.cos(a) * r, Math.sin(a) * r, 0.9 + (i / 70) * 0.9];
});
const PONTINHOS = Array.from({ length: 28 }, (_, i) => {
  const a = i * 2.39996;
  const r = 1.6 * Math.sqrt(i);
  return [Math.cos(a) * r, Math.sin(a) * r];
});

const PETALA = "M0,0 C-9,-7 -11,-27 0,-40 C11,-27 9,-7 0,0 Z";
const PETALA_FINA = "M0,0 C-5,-6 -7,-32 0,-44 C7,-32 5,-6 0,0 Z";
const FOLHA = "M0,0 C10,-14 34,-18 52,-6 C34,4 12,6 0,0 Z";

// cor da pontinha que aparece no botão antes de abrir
const PONTA_BOTAO = { girassol: "#FFC93B", margarida: "#FFFFFF", tulipa: "#F27BA8", rosa: "#E23C5A" };

/* ---------------- cabeças das flores ---------------- */
// cada função desenha a flor aberta centrada em (0,0); `abre` vai de 0 a 1

function cabecaGirassol(abre, t) {
  return (
    <G transform={`translate(0 -14) scale(${(0.55 + 0.45 * abre) * 1.35})`}>
      {Array.from({ length: 12 }, (_, i) => (
        <G key={`s${i}`} transform={`rotate(${i * 30 + 15})`}>
          <Path d="M0,0 C-6,-6 -6,-22 0,-34 C6,-22 6,-6 0,0Z" fill="#5C9E35" opacity={abre} />
        </G>
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <G key={`f${i}`} transform={`rotate(${i * 18 + 9}) translate(0 -20) scale(${0.95 * abre} ${0.35 + 0.65 * abre})`}>
          <Path d={PETALA} fill="url(#gPetalaFundo)" />
        </G>
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <G key={`p${i}`} transform={`rotate(${i * 18 + Math.sin(t * 2 + i) * 1.5}) translate(0 -18) scale(${abre} ${0.3 + 0.7 * abre})`}>
          <Path d={PETALA} fill="url(#gPetala)" />
          <Path d="M0,-4 C-1,-14 -1,-24 0,-32" stroke="#E8890A" strokeWidth={0.9} fill="none" opacity={0.5} />
        </G>
      ))}
      <Circle r={22} fill="url(#gMiolo)" />
      {SEMENTES.map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r * abre} fill={i % 3 ? "#2E1A0A" : "#A0703A"} opacity={0.85} />
      ))}
      <Ellipse cx={-7} cy={-8} rx={7} ry={4} fill="#fff" opacity={0.12} />
    </G>
  );
}

function cabecaMargarida(abre, t) {
  return (
    <G transform={`translate(0 -14) scale(${(0.55 + 0.45 * abre) * 1.3})`}>
      {Array.from({ length: 22 }, (_, i) => (
        <G key={`f${i}`} transform={`rotate(${i * (360 / 22) + 8}) translate(0 -10) scale(${0.9 * abre} ${0.3 + 0.7 * abre})`}>
          <Path d={PETALA_FINA} fill="url(#mPetalaFundo)" />
        </G>
      ))}
      {Array.from({ length: 22 }, (_, i) => (
        <G key={`p${i}`} transform={`rotate(${i * (360 / 22) + Math.sin(t * 2 + i) * 1.5}) translate(0 -9) scale(${abre} ${0.3 + 0.7 * abre})`}>
          <Path d={PETALA_FINA} fill="url(#mPetala)" stroke="#E3E8EC" strokeWidth={0.6} />
          <Path d="M0,-6 L0,-36" stroke="#DCE3E8" strokeWidth={0.8} opacity={0.8} />
        </G>
      ))}
      <Circle r={15} fill="url(#mMiolo)" />
      {PONTINHOS.map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={1.1 * abre} fill="#E0941A" opacity={0.7} />
      ))}
      <Ellipse cx={-5} cy={-6} rx={5} ry={3} fill="#fff" opacity={0.35} />
    </G>
  );
}

function cabecaTulipa(abre) {
  const s = 0.6 + 0.4 * abre;
  const giro = 6 + 16 * abre; // pétalas se afastam ao abrir
  return (
    <G transform={`translate(0 -4) scale(${s * 1.6})`}>
      {/* pétalas de trás */}
      <G transform={`rotate(${-giro})`}>
        <Path d="M0,0 C-20,-4 -24,-34 -10,-52 C-4,-44 2,-30 0,0Z" fill="url(#tFundo)" />
      </G>
      <G transform={`rotate(${giro})`}>
        <Path d="M0,0 C20,-4 24,-34 10,-52 C4,-44 -2,-30 0,0Z" fill="url(#tFundo)" />
      </G>
      <Path d="M0,0 C-10,-10 -10,-40 0,-56 C10,-40 10,-10 0,0Z" fill="url(#tFundo)" />
      {/* pétalas da frente */}
      <G transform={`rotate(${-giro * 0.6})`}>
        <Path d="M2,2 C-22,0 -26,-30 -14,-48 C-6,-38 4,-22 2,2Z" fill="url(#tPetala)" />
      </G>
      <G transform={`rotate(${giro * 0.6})`}>
        <Path d="M-2,2 C22,0 26,-30 14,-48 C6,-38 -4,-22 -2,2Z" fill="url(#tPetala)" />
      </G>
      <Path d="M0,4 C-14,0 -16,-30 0,-46 C16,-30 14,0 0,4Z" fill="url(#tPetala)" />
      <Path d="M0,0 C-2,-14 -2,-28 0,-40" stroke="#FFFFFF" strokeWidth={1.4} opacity={0.35} fill="none" />
    </G>
  );
}

function cabecaRosa(abre) {
  const s = 0.55 + 0.45 * abre;
  const anel = (n, raio, tam, cor, rot, abertura) =>
    Array.from({ length: n }, (_, i) => (
      <G key={`${raio}-${i}`} transform={`rotate(${i * (360 / n) + rot}) translate(0 ${-raio * abertura})`}>
        <Ellipse cx={0} cy={0} rx={tam} ry={tam * 0.85} fill={cor} />
        <Path d={`M${-tam * 0.8},${tam * 0.1} C${-tam * 0.3},${-tam * 0.6} ${tam * 0.3},${-tam * 0.6} ${tam * 0.8},${tam * 0.1}`} stroke="#8E0E26" strokeWidth={1} fill="none" opacity={0.35} />
      </G>
    ));
  return (
    <G transform={`translate(0 -18) scale(${s * 1.75})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <G key={`s${i}`} transform={`rotate(${i * 72 + 36})`}>
          <Path d="M0,0 C-5,-8 -4,-26 0,-34 C4,-26 5,-8 0,0Z" fill="#4E8F2E" opacity={abre} />
        </G>
      ))}
      {anel(5, 16, 16, "url(#rFora)", 0, 0.6 + 0.4 * abre)}
      {anel(5, 9, 12, "url(#rMeio)", 36, 0.5 + 0.5 * abre)}
      <Circle r={10} fill="url(#rCentro)" />
      <Path d="M-5,1 C-6,-6 4,-8 5,-2 C6,3 -1,5 -2,0 C-2,-3 2,-3 2,-1" stroke="#7A0A20" strokeWidth={1.3} fill="none" opacity={0.7} />
      <Ellipse cx={-6} cy={-8} rx={6} ry={3} fill="#fff" opacity={0.15} />
    </G>
  );
}

const CABECAS = { girassol: cabecaGirassol, margarida: cabecaMargarida, tulipa: cabecaTulipa, rosa: cabecaRosa };

/* ---------------- componente ---------------- */

export default function FlorNova({
  tipo = "girassol",
  target = 1,
  duration = 1600,
  size = 230,
  showScenery = false,
  canteiro = true,
  animar = true,
  celebrar = 0,
}) {
  const [g, setG] = useState(animar ? 0 : target);
  const [t, setT] = useState(0);
  const [brilhoIni, setBrilhoIni] = useState(-10);
  const anim = useRef({ de: animar ? 0 : target, para: target, ini: 0 });

  useEffect(() => {
    if (!animar) {
      setG(target);
      return;
    }
    anim.current = { de: g, para: target, ini: Date.now() };
  }, [target]);

  useEffect(() => {
    if (celebrar) setBrilhoIni(Date.now() / 1000);
  }, [celebrar]);

  // laço de animação (~24 quadros por segundo; desligado quando animar = false)
  useEffect(() => {
    if (!animar) return;
    let vivo = true;
    let ultimo = 0;
    const comeco = Date.now();
    function quadro() {
      if (!vivo) return;
      const agora = Date.now();
      if (agora - ultimo > 42) {
        ultimo = agora;
        const { de, para, ini } = anim.current;
        const p = clamp((agora - ini) / duration);
        const e = 1 - Math.pow(1 - p, 3);
        setG(de + (para - de) * e);
        setT((agora - comeco) / 1000);
      }
      requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
    return () => {
      vivo = false;
    };
  }, [animar]);

  const semente = g < 0.06;
  const broto = fase(g, 0.04, 0.2);
  const altura = suave(fase(g, 0.12, 0.72)) * 172;
  const folhas = [fase(g, 0.24, 0.36), fase(g, 0.36, 0.48), fase(g, 0.48, 0.6)];
  const botao = fase(g, 0.58, 0.78);
  const abre = suave(fase(g, 0.76, 1));
  const topoY = BY - Math.max(altura, 16 * broto);

  const forca = 0.4 + 0.6 * fase(g, 0.3, 1);
  const balanco = Math.sin(t * 1.3) * 2.2 * forca;
  const cabeca = Math.sin(t * 1.3 + 0.6) * 3.5 * forca;
  const curva = Math.sin(t * 1.3) * 6 * forca;
  const caule = `M ${BX} ${BY} C ${BX - 6} ${BY - altura * 0.35}, ${BX + curva} ${BY - altura * 0.7}, ${BX} ${topoY}`;

  const dtBrilho = Date.now() / 1000 - brilhoIni;
  const brilhando = animar && dtBrilho >= 0 && dtBrilho < 1.4;
  const desenharCabeca = CABECAS[tipo] || CABECAS.girassol;

  const folhaEm = (p, lado, y, escala) =>
    p > 0 && (
      <G key={y} transform={`translate(${BX} ${y}) scale(${lado * escala * p} ${escala * p}) rotate(${-8 + Math.sin(t * 1.6 + y) * 3})`}>
        <Path d={FOLHA} fill="url(#folha)" />
        <Path d="M2,-1 C16,-6 32,-8 48,-6" stroke="#3F7A2A" strokeWidth={1.2} fill="none" opacity={0.6} />
      </G>
    );

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 400 400">
        <Defs>
          <LinearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E3F4FF" />
            <Stop offset="1" stopColor="#F4FBEA" />
          </LinearGradient>
          <RadialGradient id="sol" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFE680" />
            <Stop offset="0.6" stopColor="#FFD24D" />
            <Stop offset="1" stopColor="#FFD24D" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="terra" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#8A5A34" />
            <Stop offset="1" stopColor="#5E3B20" />
          </LinearGradient>
          <LinearGradient id="caule" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#4E8F2E" />
            <Stop offset="0.5" stopColor="#74B843" />
            <Stop offset="1" stopColor="#4E8F2E" />
          </LinearGradient>
          <LinearGradient id="folha" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#5C9E35" />
            <Stop offset="1" stopColor="#9BD45E" />
          </LinearGradient>
          <RadialGradient id="botao" cx="40%" cy="35%" r="70%">
            <Stop offset="0" stopColor="#9BD45E" />
            <Stop offset="1" stopColor="#4E8F2E" />
          </RadialGradient>
          {/* girassol */}
          <LinearGradient id="gPetala" x1="0" y1="0" x2="0" y2="-40" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#F08A0C" />
            <Stop offset="0.45" stopColor="#FFB524" />
            <Stop offset="1" stopColor="#FFDD55" />
          </LinearGradient>
          <LinearGradient id="gPetalaFundo" x1="0" y1="0" x2="0" y2="-40" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#D9700A" />
            <Stop offset="1" stopColor="#F7B52B" />
          </LinearGradient>
          <RadialGradient id="gMiolo" cx="45%" cy="40%" r="60%">
            <Stop offset="0" stopColor="#8B5A2B" />
            <Stop offset="0.7" stopColor="#5A361A" />
            <Stop offset="1" stopColor="#3E2410" />
          </RadialGradient>
          {/* margarida */}
          <LinearGradient id="mPetala" x1="0" y1="0" x2="0" y2="-44" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#EEF2F5" />
            <Stop offset="0.5" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#FFFFFF" />
          </LinearGradient>
          <LinearGradient id="mPetalaFundo" x1="0" y1="0" x2="0" y2="-44" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#D5DDE3" />
            <Stop offset="1" stopColor="#F2F5F7" />
          </LinearGradient>
          <RadialGradient id="mMiolo" cx="40%" cy="35%" r="65%">
            <Stop offset="0" stopColor="#FFE27A" />
            <Stop offset="0.6" stopColor="#FFC93B" />
            <Stop offset="1" stopColor="#F2A81E" />
          </RadialGradient>
          {/* tulipa */}
          <LinearGradient id="tPetala" x1="0" y1="0" x2="0" y2="-50" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#C2366E" />
            <Stop offset="0.5" stopColor="#EE6FA2" />
            <Stop offset="1" stopColor="#FFB3CF" />
          </LinearGradient>
          <LinearGradient id="tFundo" x1="0" y1="0" x2="0" y2="-55" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#9E2456" />
            <Stop offset="1" stopColor="#E0558C" />
          </LinearGradient>
          {/* rosa */}
          <RadialGradient id="rFora" cx="50%" cy="70%" r="70%">
            <Stop offset="0" stopColor="#F05A74" />
            <Stop offset="1" stopColor="#B81A3A" />
          </RadialGradient>
          <RadialGradient id="rMeio" cx="50%" cy="60%" r="70%">
            <Stop offset="0" stopColor="#E8405E" />
            <Stop offset="1" stopColor="#A0122E" />
          </RadialGradient>
          <RadialGradient id="rCentro" cx="45%" cy="40%" r="60%">
            <Stop offset="0" stopColor="#D42A4A" />
            <Stop offset="1" stopColor="#7A0A20" />
          </RadialGradient>
        </Defs>

        {showScenery && (
          <G>
            <Path d="M0 0 H400 V400 H0 Z" fill="url(#ceu)" />
            <Circle cx={330} cy={78} r={58} fill="url(#sol)" opacity={0.9 + Math.sin(t * 2) * 0.05} />
            <Circle cx={330} cy={78} r={24} fill="#FFD84D" />
            <G opacity={0.95} transform={`translate(${((t * 6) % 480) - 80} 0)`}>
              <Ellipse cx={60} cy={92} rx={34} ry={12} fill="#fff" />
              <Ellipse cx={82} cy={82} rx={24} ry={12} fill="#fff" />
            </G>
            <Ellipse cx={200} cy={372} rx={240} ry={70} fill="#A6D676" />
            <Ellipse cx={200} cy={390} rx={260} ry={60} fill="#8CC85C" />
          </G>
        )}

        {canteiro && (
          <G>
            <Ellipse cx={BX} cy={BY + 6} rx={74} ry={16} fill="url(#terra)" />
            <Ellipse cx={BX} cy={BY + 2} rx={60} ry={9} fill="#9B6A3F" opacity={0.6} />
            {[-62, -44, 46, 64].map((dx, i) => (
              <Path
                key={dx}
                d={`M ${BX + dx} ${BY + 8} q ${-3 + Math.sin(t * 2 + i) * 2} -12 ${-1 + Math.sin(t * 2 + i) * 3} -18`}
                stroke="#5FA83A"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </G>
        )}

        {semente && (
          <G transform={`translate(${BX} ${BY}) rotate(${Math.sin(t * 3) * 6})`}>
            <Ellipse cx={0} cy={-3} rx={9} ry={6} fill="#5A3A1E" />
            <Ellipse cx={-2} cy={-5} rx={3} ry={1.6} fill="#8B6239" />
          </G>
        )}

        <G transform={`rotate(${balanco} ${BX} ${BY})`}>
          {broto > 0 && altura < 40 && (
            <G opacity={broto} transform={`translate(${BX} ${topoY}) scale(${0.6 + broto * 0.4})`}>
              <Ellipse cx={-9} cy={-2} rx={10} ry={5} fill="#8FCB55" transform="rotate(-30 -9 -2)" />
              <Ellipse cx={9} cy={-2} rx={10} ry={5} fill="#8FCB55" transform="rotate(30 9 -2)" />
            </G>
          )}

          {(altura > 2 || broto > 0) && (
            <Path d={caule} stroke="url(#caule)" strokeWidth={7 + 4 * fase(g, 0.2, 1)} strokeLinecap="round" fill="none" />
          )}

          {folhaEm(folhas[0], -1, BY - 50, 1.45)}
          {folhaEm(folhas[1], 1, BY - 92, 1.35)}
          {folhaEm(folhas[2], -1, BY - 130, 1.15)}

          {botao > 0 && (
            <G transform={`translate(${BX} ${topoY}) rotate(${cabeca})`}>
              {abre < 1 && (
                <G opacity={1 - abre} transform={`scale(${(0.4 + botao * 0.6) * 1.3})`}>
                  <Ellipse cx={0} cy={-14} rx={16} ry={20} fill="url(#botao)" />
                  <Path d="M-14,-8 C-10,-26 -4,-34 0,-36 C4,-34 10,-26 14,-8" fill="#6FAE40" opacity={0.7} />
                  {botao > 0.7 && <Path d="M-5,-30 C-3,-38 3,-38 5,-30" fill={PONTA_BOTAO[tipo] || "#FFC93B"} />}
                </G>
              )}
              {abre > 0 && desenharCabeca(abre, t)}
            </G>
          )}
        </G>

        {brilhando &&
          Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const d = 50 + dtBrilho * 110;
            const x = BX + Math.cos(a) * d;
            const y = topoY - 12 + Math.sin(a) * d * 0.8;
            const o = 1 - dtBrilho / 1.4;
            const s = 11 * o + 3;
            return (
              <Path
                key={i}
                d={`M ${x} ${y - s} L ${x + s * 0.3} ${y - s * 0.3} L ${x + s} ${y} L ${x + s * 0.3} ${y + s * 0.3} L ${x} ${y + s} L ${x - s * 0.3} ${y + s * 0.3} L ${x - s} ${y} L ${x - s * 0.3} ${y - s * 0.3} Z`}
                fill={i % 2 ? "#FFD84D" : "#FFFFFF"}
                opacity={o}
              />
            );
          })}
      </Svg>
    </View>
  );
}
