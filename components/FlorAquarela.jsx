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
  rosa: { tinta: "#EC7A8E", borda: "#C2405A", luz: "#F9C3CC" },
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
// folha de roseira: borda serrilhada e verde-oliva
const FOLHA_ROSA =
  "M0,0 C4,-8 10,-13 16,-15 L18,-18 L21,-15 C26,-17 31,-17 36,-15 L39,-18 L41,-14 C46,-13 50,-10 54,-6 L58,-6 L55,-3 C49,3 40,6 31,6 L29,9 L26,6 C18,6 9,4 0,0Z";
const TINTA_FOLHA_ROSA = { tinta: "#8BA858", borda: "#56702E", luz: "#C3D79A" };

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
  // rosa aberta em aquarela: pétalas onduladas em camadas, miolo em espiral
  // e "fios" brancos onde o papel aparece entre as pétalas
  const clara = { tinta: "#F4A3B0", borda: "#E0687E" };
  const media = { tinta: "#EE7F92", borda: "#D24A64" };
  const forte = { tinta: "#E45C74", borda: "#B8304C" };
  const funda = { tinta: "#CF3A56", borda: "#97203A" };
  const s = (0.55 + 0.45 * a) * 1.22;
  const abre = 0.8 + 0.2 * a;
  // pétala externa ondulada (aponta para cima, base no centro)
  const ondulada = (i) => {
    const w = 30 + tremor(i, 5) * 6;
    const h = 40 + tremor(i, 6) * 6;
    const o = tremor(i, 7) * 4;
    return `M0,0 C${-w * 0.7},-4 ${-w * 1.1},${-h * 0.55} ${-w * 0.75},${-h * 0.9} C${-w * 0.5},${-h * 1.05} ${-w * 0.2},${-h * 0.92} ${o},${-h} C${w * 0.25},${-h * 0.92} ${w * 0.55},${-h * 1.06} ${w * 0.78},${-h * 0.88} C${w * 1.1},${-h * 0.55} ${w * 0.7},-4 0,0Z`;
  };
  return (
    <G transform={`translate(0 -22) scale(${s * 1.12} ${s})`}>
      {/* sépalas */}
      {[-150, -110, 110, 150].map((ang, i) => (
        <G key={`s${i}`} transform={`rotate(${ang}) translate(0 -14)`}>
          <Mancha d="M0,0 C-4,-7 -3,-20 0,-27 C3,-20 4,-7 0,0Z" c={{ tinta: "#7FA850", borda: "#4E7A2C" }} forte={0.6 * a} lapis={false} />
        </G>
      ))}
      {/* pétalas externas, abertas como uma taça */}
      {[-112, -84, -56, -24, 8, 40, 70, 98, 116].map((ang, i) => (
        <G key={`e${i}`} transform={`rotate(${ang * abre}) translate(0 ${-4 * a}) scale(${(0.7 + 0.3 * a) * (Math.abs(ang) > 110 ? 0.85 : 1)} ${0.7 + 0.3 * a})`}>
          <Mancha d={ondulada(i)} c={clara} forte={0.55} luz="#FBD3DA" borda={1.3} />
        </G>
      ))}
      {/* taça: pétalas da frente, embaixo */}
      <Mancha d="M-38,-6 C-40,10 -20,26 0,26 C20,26 40,10 38,-6 C30,2 16,6 0,6 C-16,6 -30,2 -38,-6Z" c={media} forte={0.6} luz="#F8BBC6" />
      <Path d="M-34,-3 C-24,4 -10,7 2,7 C14,7 26,3 34,-3" stroke="#FFFFFF" strokeWidth={2.4} opacity={0.75} fill="none" strokeLinecap="round" />
      {/* camadas do meio */}
      <Mancha d="M-30,-10 C-30,-30 -10,-38 2,-37 C16,-36 31,-28 30,-10 C22,-18 10,-21 0,-21 C-12,-21 -22,-18 -30,-10Z" c={forte} forte={0.6} />
      <Mancha d="M-26,-8 C-24,2 -12,10 0,10 C12,10 24,2 26,-8 C18,-4 9,-2 0,-2 C-9,-2 -18,-4 -26,-8Z" c={forte} forte={0.55} />
      <Path d="M-24,-12 C-16,-20 -6,-23 4,-22" stroke="#FFFFFF" strokeWidth={2} opacity={0.7} fill="none" strokeLinecap="round" />
      <Path d="M20,-6 C14,-1 6,1 -2,1" stroke="#FFFFFF" strokeWidth={1.8} opacity={0.65} fill="none" strokeLinecap="round" />
      {/* miolo em espiral */}
      {/* miolo: pétalas internas enroladas, com o papel branco aparecendo entre elas */}
      <Mancha d="M-17,-8 C-18,-20 -7,-27 2,-26 C12,-25 19,-18 17,-8 C11,-12 5,-13 0,-13 C-6,-13 -12,-12 -17,-8Z" c={funda} forte={0.7} />
      <Mancha d="M-15,-6 C-13,1 -6,5 1,5 C8,5 14,1 16,-6 C10,-3 5,-2 0,-2 C-5,-2 -10,-3 -15,-6Z" c={forte} forte={0.7} />
      <Mancha d="M-9,-10 C-8,-17 -1,-20 5,-18 C10,-16 11,-11 9,-8 C6,-10 2,-11 -1,-11 C-4,-11 -7,-11 -9,-10Z" c={{ tinta: "#B8243F", borda: "#7A0F26" }} forte={0.8} lapis={false} />
      <Path d="M-15,-9 C-10,-12 -4,-13 1,-13 C7,-13 12,-12 16,-9" stroke="#FFFFFF" strokeWidth={1.8} opacity={0.75} fill="none" strokeLinecap="round" />
      <Path d="M-8,-9 C-4,-11 2,-11 8,-8" stroke="#FFFFFF" strokeWidth={1.4} opacity={0.7} fill="none" strokeLinecap="round" />
      <Path d="M-13,-4 C-7,-1 7,-1 14,-5" stroke="#FFFFFF" strokeWidth={1.4} opacity={0.6} fill="none" strokeLinecap="round" />
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

  const ehRosa = tipo === "rosa";
  const folhaEm = (p, lado, y, escala, i) =>
    p > 0 && (
      <G key={y} transform={`translate(${BX} ${y}) scale(${lado * escala * p} ${escala * p}) rotate(${-10 + Math.sin(t * 1.6 + y) * 3})`}>
        <Mancha d={ehRosa ? FOLHA_ROSA : FOLHA} c={ehRosa ? TINTA_FOLHA_ROSA : TINTAS.folha} luz={ehRosa ? TINTA_FOLHA_ROSA.luz : TINTAS.folha.luz} />
        <Path d="M2,-1 C17,-5 33,-6 52,-5" stroke={ehRosa ? TINTA_FOLHA_ROSA.borda : TINTAS.folha.borda} strokeWidth={1.1} fill="none" opacity={0.55} />
        <Path d="M14,-3 L20,-11 M26,-4 L33,-12 M20,-2 L26,4 M33,-4 L39,2" stroke={ehRosa ? TINTA_FOLHA_ROSA.borda : TINTAS.folha.borda} strokeWidth={0.7} opacity={0.4} />
        {ehRosa && <Path d="M10,-6 C18,-10 28,-11 36,-9" stroke="#FFFFFF" strokeWidth={1.6} opacity={0.45} fill="none" strokeLinecap="round" />}
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
                <Path d={caule} stroke={ehRosa ? "#5E8A36" : TINTAS.caule.tinta} strokeWidth={8 + 4 * fase(g, 0.2, 1)} strokeLinecap="round" fill="none" opacity={0.8} />
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
