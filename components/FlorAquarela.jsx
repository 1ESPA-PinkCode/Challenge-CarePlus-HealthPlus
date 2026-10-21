// components/FlorAquarela.jsx — flores no estilo aquarela desenhada à mão
// Mesmas props da FlorNova: tipo, target (0..1), size, canteiro, animar, celebrar.
// Técnica: tinta translúcida em camadas + borda de pigmento mais escura + traço de lápis,
// e um filtro de "papel molhado" que deixa os contornos levemente tremidos.
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, Ellipse, FeDisplacementMap, FeTurbulence, Filter, G, Path } from "react-native-svg";

export const FLORES_AQUARELA = ["girassol", "margarida", "tulipa", "rosa"];

const BX = 200;
const BY = 318;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const fase = (g, ini, fim) => clamp((g - ini) / (fim - ini));
const suave = (t) => t * t * (3 - 2 * t);
const tremor = (i, k = 1) => Math.sin(i * 12.9898 + k * 78.233) * 0.5; // "mão" (sempre igual para o mesmo i)

// paletas de aquarela: tinta, borda (pigmento acumulado), luz
const TINTAS = {
  folha: { tinta: "#86BF52", borda: "#4C8A2C", luz: "#C4E59A" },
  caule: { tinta: "#6BA83E", borda: "#3F7426" },
  terra: { tinta: "#9A6B43", borda: "#6A4428", luz: "#C29468" },
  girassol: { tinta: "#F7B733", borda: "#D97A1C", luz: "#FFE08A", miolo: "#7B4A22", mioloBorda: "#4A2A12" },
  margarida: { tinta: "#FFFFFF", borda: "#9DB2C9", luz: "#EEF3F9", miolo: "#F5C23E", mioloBorda: "#D58F14" },
  tulipa: { tinta: "#F27EAA", borda: "#C2356D", luz: "#FFC4D9" },
  rosa: { tinta: "#E4475F", borda: "#9C1430", luz: "#F7A3B1" },
};

// Uma "mancha" de aquarela: duas lavagens translúcidas + borda de pigmento + traço de lápis
function Mancha({ d, c, forte = 0.62, borda = 1.6, lapis = true, luz }) {
  return (
    <G>
      <Path d={d} fill={c.tinta} opacity={forte} />
      <Path d={d} fill={c.tinta} opacity={forte * 0.55} transform="translate(1.2 -0.8) scale(0.94)" />
      {luz && <Path d={d} fill={luz} opacity={0.45} transform="translate(-1.5 -2) scale(0.6)" />}
      <Path d={d} fill="none" stroke={c.borda} strokeWidth={borda} opacity={0.5} strokeLinejoin="round" />
      {lapis && <Path d={d} fill="none" stroke={c.borda} strokeWidth={0.6} opacity={0.55} transform="translate(0.8 0.6)" />}
    </G>
  );
}

// pétala com leve assimetria de mão livre
function petala(comp, larg, i) {
  const a = 1 + tremor(i, 1) * 0.18;
  const b = 1 + tremor(i, 2) * 0.18;
  const ponta = tremor(i, 3) * 3;
  return `M0,0 C${-larg * a},${-comp * 0.2} ${-larg * 1.05 * a},${-comp * 0.72} ${ponta},${-comp} C${larg * 1.05 * b},${-comp * 0.72} ${larg * b},${-comp * 0.2} 0,0Z`;
}

const FOLHA = "M0,0 C9,-15 33,-21 54,-7 C36,5 13,7 0,0 Z";

/* ---------------- cabeças ---------------- */

function cabecaGirassol(a, t) {
  const c = TINTAS.girassol;
  return (
    <G transform={`translate(0 -14) scale(${(0.55 + 0.45 * a) * 1.4})`}>
      {Array.from({ length: 16 }, (_, i) => (
        <G key={`f${i}`} transform={`rotate(${i * 22.5 + 11}) translate(0 -16) scale(${0.95 * a} ${0.4 + 0.6 * a})`}>
          <Mancha d={petala(34, 9, i + 40)} c={{ tinta: "#E8952A", borda: c.borda }} forte={0.55} lapis={false} />
        </G>
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <G key={`p${i}`} transform={`rotate(${i * 22.5 + Math.sin(t * 2 + i) * 1.5}) translate(0 -15) scale(${a} ${0.35 + 0.65 * a})`}>
          <Mancha d={petala(36, 9, i)} c={c} luz={c.luz} />
          <Path d={`M0,-4 C${tremor(i) * 2},-14 0,-24 ${tremor(i, 4) * 2},-30`} stroke={c.borda} strokeWidth={0.8} opacity={0.45} fill="none" />
        </G>
      ))}
      <Mancha d="M-20,2 C-22,-14 -10,-23 2,-22 C16,-21 23,-10 21,3 C19,16 8,22 -3,21 C-15,20 -19,12 -20,2Z" c={{ tinta: c.miolo, borda: c.mioloBorda }} forte={0.8} />
      {Array.from({ length: 34 }, (_, i) => {
        const ang = i * 2.39996;
        const r = 2.6 * Math.sqrt(i);
        return <Circle key={i} cx={Math.cos(ang) * r} cy={Math.sin(ang) * r} r={1.2 * a} fill={i % 3 ? "#3A200C" : "#C08A4A"} opacity={0.7} />;
      })}
      <Path d="M-11,-10 C-6,-15 2,-16 7,-13" stroke="#FFFFFF" strokeWidth={2.2} opacity={0.22} fill="none" strokeLinecap="round" />
    </G>
  );
}

function cabecaMargarida(a, t) {
  const c = TINTAS.margarida;
  return (
    <G transform={`translate(0 -14) scale(${(0.55 + 0.45 * a) * 1.35})`}>
      {Array.from({ length: 18 }, (_, i) => (
        <G key={`p${i}`} transform={`rotate(${i * 20 + Math.sin(t * 2 + i) * 1.5}) translate(0 -8) scale(${a} ${0.35 + 0.65 * a})`}>
          <Path d={petala(38, 6, i + 7)} fill="#FFFFFF" />
          <Path d={petala(38, 6, i + 7)} fill={c.luz} opacity={0.7} transform="translate(1.5 0) scale(0.7 0.95)" />
          <Path d={petala(38, 6, i + 7)} fill="none" stroke={c.borda} strokeWidth={1.3} opacity={0.55} />
          <Path d={`M0,-5 C${tremor(i) * 1.5},-16 0,-26 0,-32`} stroke={c.borda} strokeWidth={0.7} opacity={0.35} fill="none" />
        </G>
      ))}
      <Mancha d="M-14,1 C-15,-10 -7,-15 1,-15 C10,-14 15,-7 14,2 C13,11 5,15 -2,14 C-10,13 -14,8 -14,1Z" c={{ tinta: c.miolo, borda: c.mioloBorda }} forte={0.85} luz="#FFE79A" />
      {Array.from({ length: 16 }, (_, i) => {
        const ang = i * 2.39996;
        const r = 2.2 * Math.sqrt(i);
        return <Circle key={i} cx={Math.cos(ang) * r} cy={Math.sin(ang) * r} r={1} fill="#C27A10" opacity={0.6} />;
      })}
    </G>
  );
}

function cabecaTulipa(a) {
  const c = TINTAS.tulipa;
  const giro = 5 + 15 * a;
  const fundo = { tinta: "#D9578A", borda: c.borda };
  return (
    <G transform={`translate(0 -4) scale(${(0.6 + 0.4 * a) * 1.6})`}>
      <G transform={`rotate(${-giro})`}>
        <Mancha d="M0,0 C-21,-4 -24,-35 -9,-53 C-3,-44 2,-28 0,0Z" c={fundo} forte={0.6} lapis={false} />
      </G>
      <G transform={`rotate(${giro})`}>
        <Mancha d="M0,0 C21,-4 24,-35 9,-53 C3,-44 -2,-28 0,0Z" c={fundo} forte={0.6} lapis={false} />
      </G>
      <G transform={`rotate(${-giro * 0.6})`}>
        <Mancha d="M2,3 C-22,1 -26,-30 -14,-49 C-6,-39 4,-22 2,3Z" c={c} luz={c.luz} />
      </G>
      <G transform={`rotate(${giro * 0.6})`}>
        <Mancha d="M-2,3 C22,1 26,-30 14,-49 C6,-39 -4,-22 -2,3Z" c={c} luz={c.luz} />
      </G>
      <Mancha d="M0,5 C-15,1 -17,-29 1,-47 C17,-29 14,1 0,5Z" c={c} luz={c.luz} />
      <Path d="M0,-2 C-1,-16 -1,-28 1,-40 M-6,-6 C-8,-18 -8,-26 -6,-34 M6,-6 C8,-18 8,-26 6,-34" stroke={c.borda} strokeWidth={0.8} opacity={0.4} fill="none" />
    </G>
  );
}

function cabecaRosa(a) {
  const c = TINTAS.rosa;
  const s = 0.55 + 0.45 * a;
  const anel = (n, raio, tam, rot, abertura, tom, chave) =>
    Array.from({ length: n }, (_, i) => {
      const r = tam * (1 + tremor(i + chave, 1) * 0.15);
      const d = `M${-r},2 C${-r},${-r * 0.9} ${r},${-r * 0.9} ${r},2 C${r * 0.5},${r * 0.55} ${-r * 0.5},${r * 0.55} ${-r},2Z`;
      return (
        <G key={`${chave}-${i}`} transform={`rotate(${i * (360 / n) + rot}) translate(0 ${-raio * abertura})`}>
          <Mancha d={d} c={tom} forte={0.6} lapis={i % 2 === 0} luz={i % 2 ? c.luz : undefined} />
        </G>
      );
    });
  return (
    <G transform={`translate(0 -18) scale(${s * 1.7})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <G key={`s${i}`} transform={`rotate(${i * 72 + 36})`}>
          <Mancha d="M0,0 C-5,-8 -4,-25 0,-33 C4,-25 5,-8 0,0Z" c={TINTAS.folha} forte={0.6 * a} lapis={false} />
        </G>
      ))}
      {anel(5, 15, 15, 0, 0.6 + 0.4 * a, { tinta: "#EC6178", borda: c.borda }, 1)}
      {anel(5, 8, 11, 36, 0.5 + 0.5 * a, c, 9)}
      <Mancha d="M-9,1 C-10,-7 -4,-10 1,-10 C7,-9 10,-5 9,1 C8,7 3,9 -1,9 C-6,9 -9,6 -9,1Z" c={{ tinta: "#C42642", borda: "#7A0A20" }} forte={0.85} />
      <Path d="M-5,1 C-6,-6 4,-7 5,-2 C6,3 -1,5 -2,0 C-2,-3 2,-3 2,-1" stroke="#6A0618" strokeWidth={1.2} opacity={0.6} fill="none" />
    </G>
  );
}

const CABECAS = { girassol: cabecaGirassol, margarida: cabecaMargarida, tulipa: cabecaTulipa, rosa: cabecaRosa };

/* ---------------- botão ---------------- */
function desenharBotao(tipo, cresce, abrindo) {
  const c = TINTAS[tipo] || TINTAS.girassol;
  const s = (0.5 + 0.5 * cresce) * (1.5 + 0.4 * abrindo);
  const cor = Math.max(0, (cresce - 0.35) / 0.65);
  const giro = 6 + 26 * abrindo;
  const sepala = 16 + 42 * abrindo;
  const pet = tipo === "margarida" ? { ...c, tinta: "#FFFFFF" } : c;
  return (
    <G transform={`translate(0 -4) scale(${s})`}>
      {[-1, 1].map((lado) => (
        <G key={lado} transform={`rotate(${lado * sepala})`}>
          <Mancha d="M0,0 C-7,-6 -8,-24 0,-37 C8,-24 7,-6 0,0Z" c={TINTAS.folha} forte={0.7} lapis={false} />
        </G>
      ))}
      <G opacity={cor} transform={`scale(${0.75 + 0.25 * cor})`}>
        <G transform={`rotate(${-giro})`}>
          <Mancha d={petala(48, 15, 1)} c={pet} luz={c.luz} />
        </G>
        <G transform={`rotate(${giro})`}>
          <Mancha d={petala(48, 15, 2)} c={pet} luz={c.luz} />
        </G>
        <Mancha d={petala(50, 15, 3)} c={pet} luz={c.luz} />
      </G>
      <Mancha
        d={`M-14,-1 C-15,-${17 - 9 * abrindo} -6,-${30 - 14 * abrindo} 0,-${34 - 16 * abrindo} C6,-${30 - 14 * abrindo} 15,-${17 - 9 * abrindo} 14,-1 C8,5 -8,5 -14,-1Z`}
        c={TINTAS.folha}
        forte={0.85}
        luz={TINTAS.folha.luz}
      />
    </G>
  );
}

/* ---------------- componente ---------------- */

export default function FlorAquarela({ tipo = "girassol", target = 1, duration = 1600, size = 230, canteiro = true, animar = true, celebrar = 0 }) {
  const u = useRef(`a${Math.random().toString(36).slice(2, 8)}`).current;
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

  // ~16 quadros por segundo: suficiente para o balanço suave e leve para o celular
  useEffect(() => {
    if (!animar) return;
    let vivo = true;
    let ultimo = 0;
    const comeco = Date.now();
    function quadro() {
      if (!vivo) return;
      const agora = Date.now();
      if (agora - ultimo > 60) {
        ultimo = agora;
        const { de, para, ini } = anim.current;
        const p = clamp((agora - ini) / duration);
        setG(de + (para - de) * (1 - Math.pow(1 - p, 3)));
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
  const folhas = [fase(g, 0.22, 0.36), fase(g, 0.34, 0.48), fase(g, 0.46, 0.6)];
  const botao = fase(g, 0.58, 0.78);
  const abre = suave(fase(g, 0.76, 1));
  const topoY = BY - Math.max(altura, 24 * broto);

  const forca = 0.4 + 0.6 * fase(g, 0.3, 1);
  const balanco = Math.sin(t * 1.3) * 2.2 * forca;
  const cabeca = Math.sin(t * 1.3 + 0.6) * 3.5 * forca;
  const curva = Math.sin(t * 1.3) * 6 * forca;
  const caule = `M ${BX} ${BY} C ${BX - 7} ${BY - altura * 0.35}, ${BX + curva} ${BY - altura * 0.7}, ${BX} ${topoY}`;

  const dtBrilho = Date.now() / 1000 - brilhoIni;
  const brilhando = animar && dtBrilho >= 0 && dtBrilho < 1.4;
  const desenharCabeca = CABECAS[tipo] || CABECAS.girassol;

  const folhaEm = (p, lado, y, escala, i) =>
    p > 0 && (
      <G key={y} transform={`translate(${BX} ${y}) scale(${lado * escala * p} ${escala * p}) rotate(${-10 + Math.sin(t * 1.6 + y) * 3})`}>
        <Mancha d={FOLHA} c={TINTAS.folha} luz={TINTAS.folha.luz} />
        <Path d="M2,-1 C17,-6 33,-8 50,-6" stroke={TINTAS.folha.borda} strokeWidth={1.1} fill="none" opacity={0.55} />
        <Path d="M14,-4 L20,-12 M26,-6 L33,-14 M20,-3 L26,3 M33,-5 L39,1" stroke={TINTAS.folha.borda} strokeWidth={0.7} opacity={0.4} />
      </G>
    );

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 400 400">
        <Defs>
          {/* papel molhado: deixa as bordas levemente tremidas, como pincel */}
          <Filter id={u + "aq"} x="-10%" y="-10%" width="120%" height="120%">
            <FeTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" result="ruido" />
            <FeDisplacementMap in="SourceGraphic" in2="ruido" scale="4.5" xChannelSelector="R" yChannelSelector="G" />
          </Filter>
        </Defs>

        <G filter={`url(#${u}aq)`}>
          {canteiro && (
            <G>
              <Ellipse cx={BX} cy={BY + 8} rx={78} ry={17} fill={TINTAS.terra.tinta} opacity={0.5} />
              <Path
                d={`M${BX - 74},${BY + 6} C${BX - 60},${BY - 9} ${BX + 55},${BY - 10} ${BX + 76},${BY + 5} C${BX + 60},${BY + 22} ${BX - 58},${BY + 24} ${BX - 74},${BY + 6}Z`}
                fill={TINTAS.terra.tinta}
                opacity={0.55}
              />
              <Path
                d={`M${BX - 74},${BY + 6} C${BX - 60},${BY - 9} ${BX + 55},${BY - 10} ${BX + 76},${BY + 5}`}
                stroke={TINTAS.terra.borda}
                strokeWidth={1.6}
                opacity={0.45}
                fill="none"
              />
              <Path d={`M${BX - 40},${BY + 2} C${BX - 20},${BY - 3} ${BX + 10},${BY - 3} ${BX + 30},${BY + 1}`} stroke={TINTAS.terra.luz} strokeWidth={3} opacity={0.4} fill="none" strokeLinecap="round" />
              {[-66, -52, 50, 64, -30, 34].map((dx, i) => (
                <Path
                  key={dx}
                  d={`M ${BX + dx} ${BY + 9} q ${-3 + Math.sin(t * 2 + i) * 2} -12 ${-1 + Math.sin(t * 2 + i) * 3} -${14 + (i % 3) * 4}`}
                  stroke={i % 2 ? "#7DB84A" : "#5E9E36"}
                  strokeWidth={2.4}
                  opacity={0.75}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
            </G>
          )}

          {/* semente aquarelada */}
          {semente && (
            <G transform={`translate(${BX} ${BY - 4}) rotate(${-15 + Math.sin(t * 3) * 6}) scale(1.8)`}>
              <Mancha d="M-10,0 C-10,-7 -3,-9 2,-8 C9,-7 11,-2 10,2 C8,7 0,8 -4,7 C-9,6 -10,3 -10,0Z" c={{ tinta: "#7A5130", borda: "#4A2E18" }} forte={0.8} luz="#B58A5E" />
            </G>
          )}

          <G transform={`rotate(${balanco} ${BX} ${BY})`}>
            {/* broto: caulezinho curvo + duas folhas redondas (cotilédones) + folha nova */}
            {broto > 0 && altura < 60 && (
              <G opacity={broto} transform={`translate(${BX} ${topoY}) scale(${(0.65 + broto * 0.55) * 1.9})`}>
                <G transform="rotate(-38)">
                  <Mancha d="M0,0 C-3,-8 -14,-14 -22,-10 C-26,-4 -18,3 0,0Z" c={TINTAS.folha} luz={TINTAS.folha.luz} forte={0.7} />
                  <Path d="M-2,-1 C-8,-5 -14,-7 -19,-8" stroke={TINTAS.folha.borda} strokeWidth={0.8} opacity={0.5} fill="none" />
                </G>
                <G transform="rotate(38)">
                  <Mancha d="M0,0 C3,-8 14,-14 22,-10 C26,-4 18,3 0,0Z" c={TINTAS.folha} luz={TINTAS.folha.luz} forte={0.7} />
                  <Path d="M2,-1 C8,-5 14,-7 19,-8" stroke={TINTAS.folha.borda} strokeWidth={0.8} opacity={0.5} fill="none" />
                </G>
                {broto > 0.6 && (
                  <G transform={`scale(${(broto - 0.6) / 0.4})`}>
                    <Mancha d="M0,0 C-4,-6 -3,-13 1,-17 C5,-12 5,-5 0,0Z" c={{ tinta: "#9BD45E", borda: TINTAS.folha.borda }} forte={0.75} lapis={false} />
                  </G>
                )}
              </G>
            )}

            {/* caule: traço de tinta com borda e luz */}
            {(altura > 2 || broto > 0) && (
              <G>
                <Path d={caule} stroke={TINTAS.caule.tinta} strokeWidth={8 + 4 * fase(g, 0.2, 1)} strokeLinecap="round" fill="none" opacity={0.8} />
                <Path d={caule} stroke={TINTAS.caule.borda} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.55} transform="translate(3 0)" />
                <Path d={caule} stroke="#C4E59A" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.45} transform="translate(-2 0)" />
              </G>
            )}

            {folhaEm(folhas[0], -1, BY - 50, 1.45)}
            {folhaEm(folhas[1], 1, BY - 92, 1.35)}
            {folhaEm(folhas[2], -1, BY - 130, 1.15)}

            {botao > 0 && (
              <G transform={`translate(${BX} ${topoY}) rotate(${cabeca})`}>
                {abre < 0.5 && desenharBotao(tipo, botao, abre / 0.5)}
                {abre >= 0.5 && desenharCabeca(0.45 + 0.55 * ((abre - 0.5) / 0.5), t)}
              </G>
            )}
          </G>
        </G>

        {/* brilhos da comemoração (fora do filtro, bem nítidos) */}
        {brilhando &&
          Array.from({ length: 16 }, (_, i) => {
            const ang = (i / 16) * Math.PI * 2;
            const d = 50 + dtBrilho * 110;
            const x = BX + Math.cos(ang) * d;
            const y = topoY - 12 + Math.sin(ang) * d * 0.8;
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
