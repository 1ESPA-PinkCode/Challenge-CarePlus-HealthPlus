// components/FlorNova.jsx — PROTÓTIPO do novo visual das flores (girassol)
// Mesmas props da Flor atual: tipo, growth/target (0..1), size, showScenery.
// Extra: `celebrar` — mude o valor (ex.: um contador) para soltar brilhos.
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";

const BX = 200; // base do caule
const BY = 318;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const fase = (g, ini, fim) => clamp((g - ini) / (fim - ini)); // 0..1 dentro de uma faixa
const suave = (t) => t * t * (3 - 2 * t);

// sementes do miolo em espiral (ângulo de ouro), como um girassol de verdade
const SEMENTES = Array.from({ length: 70 }, (_, i) => {
  const a = i * 2.39996;
  const r = 2.2 * Math.sqrt(i);
  return [Math.cos(a) * r, Math.sin(a) * r, 0.9 + (i / 70) * 0.9];
});

const PETALA = "M0,0 C-9,-7 -11,-27 0,-40 C11,-27 9,-7 0,0 Z";
const FOLHA = "M0,0 C10,-14 34,-18 52,-6 C34,4 12,6 0,0 Z";

export default function FlorNova({ target = 1, duration = 1600, size = 230, showScenery = true, celebrar = 0 }) {
  const [g, setG] = useState(0); // crescimento atual
  const [t, setT] = useState(0); // tempo (s) para balanço e brilhos
  const [brilhoIni, setBrilhoIni] = useState(-10);
  const anim = useRef({ de: 0, para: target, ini: 0 });

  // nova meta de crescimento: anima do valor atual até ela
  useEffect(() => {
    anim.current = { de: g, para: target, ini: Date.now() };
  }, [target]);

  useEffect(() => {
    if (celebrar) setBrilhoIni(Date.now() / 1000);
  }, [celebrar]);

  // laço de animação (~30 fps)
  useEffect(() => {
    let vivo = true;
    let ultimo = 0;
    const comeco = Date.now();
    function quadro() {
      if (!vivo) return;
      const agora = Date.now();
      if (agora - ultimo > 33) {
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
  }, []);

  // ----- estágios -----
  const semente = g < 0.06;
  const broto = fase(g, 0.04, 0.2);
  const altura = suave(fase(g, 0.12, 0.72)) * 172; // caule
  const folhas = [fase(g, 0.24, 0.36), fase(g, 0.36, 0.48), fase(g, 0.48, 0.6)];
  const botao = fase(g, 0.58, 0.78);
  const abre = suave(fase(g, 0.76, 1)); // pétalas se abrindo
  const topoY = BY - Math.max(altura, 16 * broto);

  // ----- vento -----
  const forca = 0.4 + 0.6 * fase(g, 0.3, 1);
  const balanco = Math.sin(t * 1.3) * 2.2 * forca;
  const cabeca = Math.sin(t * 1.3 + 0.6) * 3.5 * forca;
  const curva = Math.sin(t * 1.3) * 6 * forca;

  const caule = `M ${BX} ${BY} C ${BX - 6} ${BY - altura * 0.35}, ${BX + curva} ${BY - altura * 0.7}, ${BX} ${topoY}`;

  // ----- brilhos -----
  const dtBrilho = Date.now() / 1000 - brilhoIni; // segundos desde a comemoração
  const brilhando = dtBrilho >= 0 && dtBrilho < 1.4;

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
          <LinearGradient id="petala" x1="0" y1="0" x2="0" y2="-40" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#F08A0C" />
            <Stop offset="0.45" stopColor="#FFB524" />
            <Stop offset="1" stopColor="#FFDD55" />
          </LinearGradient>
          <LinearGradient id="petalaFundo" x1="0" y1="0" x2="0" y2="-40" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#D9700A" />
            <Stop offset="1" stopColor="#F7B52B" />
          </LinearGradient>
          <RadialGradient id="miolo" cx="45%" cy="40%" r="60%">
            <Stop offset="0" stopColor="#8B5A2B" />
            <Stop offset="0.7" stopColor="#5A361A" />
            <Stop offset="1" stopColor="#3E2410" />
          </RadialGradient>
          <RadialGradient id="botao" cx="40%" cy="35%" r="70%">
            <Stop offset="0" stopColor="#9BD45E" />
            <Stop offset="1" stopColor="#4E8F2E" />
          </RadialGradient>
        </Defs>

        {/* cenário */}
        {showScenery && (
          <G>
            <Path d="M0 0 H400 V400 H0 Z" fill="url(#ceu)" />
            <Circle cx={330} cy={78} r={58} fill="url(#sol)" opacity={0.9 + Math.sin(t * 2) * 0.05} />
            <Circle cx={330} cy={78} r={24} fill="#FFD84D" />
            <G opacity={0.95} transform={`translate(${((t * 6) % 480) - 80} 0)`}>
              <Ellipse cx={60} cy={92} rx={34} ry={12} fill="#fff" />
              <Ellipse cx={82} cy={82} rx={24} ry={12} fill="#fff" />
            </G>
            <G opacity={0.8} transform={`translate(${((t * 4 + 200) % 480) - 80} 0)`}>
              <Ellipse cx={60} cy={48} rx={26} ry={9} fill="#fff" />
            </G>
            <Ellipse cx={200} cy={372} rx={240} ry={70} fill="#A6D676" />
            <Ellipse cx={200} cy={390} rx={260} ry={60} fill="#8CC85C" />
          </G>
        )}

        {/* canteiro */}
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

        {/* semente */}
        {semente && (
          <G transform={`translate(${BX} ${BY}) rotate(${Math.sin(t * 3) * 6})`}>
            <Ellipse cx={0} cy={-3} rx={9} ry={6} fill="#5A3A1E" />
            <Ellipse cx={-2} cy={-5} rx={3} ry={1.6} fill="#8B6239" />
          </G>
        )}

        {/* planta inteira balança a partir da base */}
        <G transform={`rotate(${balanco} ${BX} ${BY})`}>
          {/* broto com duas folhinhas */}
          {broto > 0 && altura < 40 && (
            <G opacity={broto} transform={`translate(${BX} ${topoY}) scale(${0.6 + broto * 0.4})`}>
              <Ellipse cx={-9} cy={-2} rx={10} ry={5} fill="#8FCB55" transform="rotate(-30 -9 -2)" />
              <Ellipse cx={9} cy={-2} rx={10} ry={5} fill="#8FCB55" transform="rotate(30 9 -2)" />
            </G>
          )}

          {/* caule */}
          {(altura > 2 || broto > 0) && (
            <Path d={caule} stroke="url(#caule)" strokeWidth={7 + 4 * fase(g, 0.2, 1)} strokeLinecap="round" fill="none" />
          )}

          {/* folhas */}
          {folhaEm(folhas[0], -1, BY - 50, 1.45)}
          {folhaEm(folhas[1], 1, BY - 92, 1.35)}
          {folhaEm(folhas[2], -1, BY - 130, 1.15)}

          {/* cabeça da flor */}
          {botao > 0 && (
            <G transform={`translate(${BX} ${topoY}) rotate(${cabeca})`}>
              {/* botão fechado (some quando abre) */}
              {abre < 1 && (
                <G opacity={1 - abre} transform={`scale(${(0.4 + botao * 0.6) * 1.3})`}>
                  <Ellipse cx={0} cy={-14} rx={16} ry={20} fill="url(#botao)" />
                  <Path d="M-14,-8 C-10,-26 -4,-34 0,-36 C4,-34 10,-26 14,-8" fill="#6FAE40" opacity={0.7} />
                  {botao > 0.7 && <Path d="M-5,-30 C-3,-38 3,-38 5,-30" fill="#FFC93B" />}
                </G>
              )}

              {/* flor abrindo: pétalas giram para fora e crescem */}
              {abre > 0 && (
                <G transform={`translate(0 -14) scale(${(0.55 + 0.45 * abre) * 1.35})`}>
                  {/* sépalas verdes atrás */}
                  {Array.from({ length: 12 }, (_, i) => (
                    <G key={`s${i}`} transform={`rotate(${i * 30 + 15})`}>
                      <Path d="M0,0 C-6,-6 -6,-22 0,-34 C6,-22 6,-6 0,0Z" fill="#5C9E35" opacity={abre} />
                    </G>
                  ))}
                  {/* pétalas de trás */}
                  {Array.from({ length: 20 }, (_, i) => (
                    <G key={`f${i}`} transform={`rotate(${i * 18 + 9}) translate(0 -20) scale(${0.95 * abre} ${0.35 + 0.65 * abre})`}>
                      <Path d={PETALA} fill="url(#petalaFundo)" />
                    </G>
                  ))}
                  {/* pétalas da frente */}
                  {Array.from({ length: 20 }, (_, i) => (
                    <G
                      key={`p${i}`}
                      transform={`rotate(${i * 18 + Math.sin(t * 2 + i) * 1.5}) translate(0 -18) scale(${abre} ${0.3 + 0.7 * abre})`}
                    >
                      <Path d={PETALA} fill="url(#petala)" />
                      <Path d="M0,-4 C-1,-14 -1,-24 0,-32" stroke="#E8890A" strokeWidth={0.9} fill="none" opacity={0.5} />
                    </G>
                  ))}
                  {/* miolo com sementes em espiral */}
                  <Circle r={22} fill="url(#miolo)" />
                  {SEMENTES.map(([x, y, r], i) => (
                    <Circle key={i} cx={x} cy={y} r={r * abre} fill={i % 3 ? "#2E1A0A" : "#A0703A"} opacity={0.85} />
                  ))}
                  <Ellipse cx={-7} cy={-8} rx={7} ry={4} fill="#fff" opacity={0.12} />
                </G>
              )}
            </G>
          )}
        </G>

        {/* brilhos da comemoração */}
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
