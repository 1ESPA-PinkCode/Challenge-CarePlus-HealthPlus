// components/blooms.jsx
import React from "react";
import { Circle, Ellipse, Path, G } from "react-native-svg";


// pontos do miolo do girassol (as "sementinhas")
const SUNFLOWER_DOTS = [
  [-6, -4], [4, -6], [-2, 2], [7, 3], [-8, 4],
  [2, 7], [-3, -8], [9, -2], [-9, -1], [1, -2],
];

/* ---------- GIRASSOL (radial: pétalas em volta + miolo) ---------- */
function girassolBloom(x, y, scale, wilted) {
  const petalOuter = wilted ? "#C9A845" : "#FFC93B";
  const petalInner = wilted ? "#B89535" : "#FFB01E";
  const centerColor = wilted ? "#5A3A1E" : "#6B4423";
  const centerInner = wilted ? "#4A2E18" : "#7D5330";

  const outer = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  const inner = Array.from({ length: 16 }, (_, i) => (i * 360) / 16 + 360 / 32);

  return (
    <G>
      {outer.map((a, i) => (
        <G key={`go-${i}`} transform={`translate(${x}, ${y}) rotate(${a})`}>
          <Ellipse cx={0} cy={-34} rx={9} ry={17} fill={petalOuter} />
        </G>
      ))}
      {inner.map((a, i) => (
        <G key={`gi-${i}`} transform={`translate(${x}, ${y}) rotate(${a})`}>
          <Ellipse cx={0} cy={-26} rx={6} ry={12} fill={petalInner} />
        </G>
      ))}
      <Circle cx={x} cy={y} r={20 * scale} fill={centerColor} />
      <Circle cx={x} cy={y} r={Math.max(0, 20 * scale - 3)} fill={centerInner} />
      {scale > 0.8 && !wilted &&
        SUNFLOWER_DOTS.map(([dx, dy], i) => (
          <Circle key={`gd-${i}`} cx={x + dx} cy={y + dy} r={1.2} fill="#4A2E18" />
        ))}
    </G>
  );
}

/* ---------- MARGARIDA (pétalas brancas radiais + miolo amarelo) ---------- */
function margaridaBloom(x, y, scale, wilted) {
  const petalW  = wilted ? "#E6E0D2" : "#FFFFFF";
  const petalE  = wilted ? "#C8C2B2" : "#D9DEE3";
  const petalSh = wilted ? "#D8D2C2" : "#ECEFF2";
  const cOuter  = wilted ? "#C9A845" : "#F2A81E";
  const cMid    = wilted ? "#D8BC6A" : "#FFC93B";
  const cHi      = wilted ? "#E2CC88" : "#FFD96B";
  const cDot    = wilted ? "#A88A3A" : "#E0941A";

  const N = 18;
  const ring = (off, cy, rx, ry, fill, stroke, sw, key) =>
    Array.from({ length: N }, (_, i) => i * (360 / N) + off).map((a, i) => (
      <G key={`${key}-${i}`} transform={`translate(${x}, ${y}) rotate(${a})`}>
        <Ellipse cx={0} cy={cy} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
      </G>
    ));

  const dots = [
    [-6, -3], [4, -5], [-2, 4], [6, 2], [-7, 2],
    [1, 6], [-4, -6], [7, -2], [-8, -1], [2, -2],
  ];

  return (
    <G>
      {ring(0, -35, 9, 22, petalSh, "none", 0, "sh")}
      {ring(0, -34, 8, 21, petalW, petalE, 0.8, "o")}
      {ring(10, -26, 6.5, 16, petalW, petalE, 0.8, "i")}

      <Circle cx={x} cy={y} r={17 * scale} fill={cOuter} />
      <Circle cx={x} cy={y} r={13 * scale} fill={cMid} />
      <Circle cx={x} cy={y - 3} r={Math.max(0, 8 * scale)} fill={cHi} opacity={0.55} />
      {scale > 0.8 &&
        dots.map(([dx, dy], i) => (
          <Circle key={`d-${i}`} cx={x + dx} cy={y + dy} r={1.2} fill={cDot} />
        ))}
    </G>
  );
}

/* ---------- ROSA (pétalas cupuladas sobrepostas em espiral) ---------- */
function rosaBloom(x, y, scale, wilted) {
  const aneis = wilted
    ? [
        { f: "#7A5A5A", s: "#5A4040" },
        { f: "#8E6868", s: "#6A4A4A" },
        { f: "#A07A7A", s: "#7A5A5A" },
        { f: "#B08A8A", s: "#8E6868" },
        { f: "#C29C9C", s: "#A07A7A" },
      ]
    : [
        { f: "#B01C3A", s: "#7C1228" },
        { f: "#D12C4C", s: "#9E1A38" },
        { f: "#E8546E", s: "#C2294A" },
        { f: "#FF7C92", s: "#DE3A5A" },
        { f: "#FF94A6", s: "#E8546E" },
      ];
  const sepal = wilted ? "#8A9A6A" : "#2F8A3E";
  const sepal2 = wilted ? "#6A7A4A" : "#246B30";

  const P =
    "M 0 0 C -17 -3 -22 -17 -18 -29 C -15 -38 -8 -41 -3 -39 C -1 -35 1 -35 3 -39 C 8 -41 15 -38 18 -29 C 22 -17 17 -3 0 0 Z";
  const S = "M 0 -8 C -6 -22 -3 -40 0 -46 C 3 -40 6 -22 0 -8 Z";

  const ring = (count, off, s, fill, stroke, sw, key) =>
    Array.from({ length: count }, (_, i) => i * (360 / count) + off).map((a, i) => (
      <G key={`${key}-${i}`} transform={`rotate(${a}) scale(${s})`}>
        <Path d={P} fill={fill} stroke={stroke} strokeWidth={sw} />
      </G>
    ));

  return (
    <G transform={`translate(${x}, ${y}) scale(${scale})`}>
      <G transform="rotate(158)"><Path d={S} fill={sepal} /></G>
      <G transform="rotate(180)"><Path d={S} fill={sepal2} /></G>
      <G transform="rotate(202)"><Path d={S} fill={sepal} /></G>

      {ring(5, 0, 1.0, aneis[0].f, aneis[0].s, 0.8, "a1")}
      {ring(5, 36, 0.80, aneis[1].f, aneis[1].s, 0.9, "a2")}
      {ring(5, 18, 0.58, aneis[2].f, aneis[2].s, 1.1, "a3")}
      {ring(5, 54, 0.38, aneis[3].f, aneis[3].s, 1.4, "a4")}
      {ring(3, 0, 0.22, aneis[4].f, aneis[4].s, 1.8, "a5")}

      <Path d="M -4 2 C -9 -2 -6 -9 1 -9 C 6 -9 8 -4 6 0 C 4 3 -1 4 -4 2 Z" fill={aneis[1].f} />
      <Circle cx={0.5} cy={-3} r={2.2} fill={aneis[0].s} />
    </G>
  );
}

/* ---------- TULIPA (taça simétrica, pétala central mais alta) ---------- */
function tulipaBloom(x, y, scale, wilted) {
  const cup   = wilted ? "#9A7080" : "#C23B72";
  const side  = wilted ? "#A87E8E" : "#D14E81";
  const inner = wilted ? "#BC90A4" : "#E7649C";
  const front = wilted ? "#CCA4B8" : "#F285B2";
  const hi      = wilted ? "#E0CAD6" : "#FBC4DC";
  const hiSoft  = wilted ? "#E6D2DC" : "#FBD0E4";
  const eSide  = wilted ? "#7E5868" : "#B0316A";
  const eInner = wilted ? "#8E6678" : "#C23B72";
  const eFront = wilted ? "#A87E8E" : "#D14E81";

  return (
    <G transform={`translate(${x}, ${y}) scale(${scale})`}>
      <Path d="M 0 8 C -15 6 -24 -6 -25 -22 C -26 -34 -20 -44 -10 -47 C -5 -49 5 -49 10 -47 C 20 -44 26 -34 25 -22 C 24 -6 15 6 0 8 Z" fill={cup} />

      <Path d="M 5 6 C -10 1 -20 -12 -22 -28 C -24 -40 -20 -49 -14 -49 C -10 -44 -6 -20 5 6 Z" fill={side} stroke={eSide} strokeWidth={0.7} />
      <Path d="M -5 6 C 10 1 20 -12 22 -28 C 24 -40 20 -49 14 -49 C 10 -44 6 -20 -5 6 Z" fill={side} stroke={eSide} strokeWidth={0.7} />

      <Path d="M 3 4 C -4 0 -9 -16 -9 -32 C -9 -43 -6 -48 -3 -49 C -1 -44 1 -20 3 4 Z" fill={inner} stroke={eInner} strokeWidth={0.6} />
      <Path d="M -3 4 C 4 0 9 -16 9 -32 C 9 -43 6 -48 3 -49 C 1 -44 -1 -20 -3 4 Z" fill={inner} stroke={eInner} strokeWidth={0.6} />

      <Path d="M 0 8 C -16 5 -19 -14 -17 -32 C -15 -46 -8 -54 0 -56 C 8 -54 15 -46 17 -32 C 19 -14 16 5 0 8 Z" fill={front} stroke={eFront} strokeWidth={0.8} />

      <Path d="M -4 5 C -10 -10 -12 -30 -7 -50" stroke={eInner} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.75} />
      <Path d="M 4 5 C 10 -10 12 -30 7 -50" stroke={eInner} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.75} />

      <Path d="M -4 -46 C -10 -39 -12 -20 -9 -4 C -7 -22 -6 -40 -4 -46 Z" fill={hi} opacity={0.85} />
      <Path d="M -13 -42 C -9 -47 -4 -49 -1 -47" stroke={hiSoft} strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.7} />
    </G>
  );
}

/* ---------- GENÉRICO (fallback simples p/ flores ainda não desenhadas) ----------
   6 pétalas em volta + miolo. Usa a cor da espécie. */
export function genericBloom(x, y, scale, wilted, cor = "#E8788A") {
  const petal = wilted ? "#B8A0A0" : cor;
  const center = wilted ? "#8A7A45" : "#F4B400";
  const angles = [0, 60, 120, 180, 240, 300];
  return (
    <G>
      {angles.map((a, i) => (
        <G key={`px-${i}`} transform={`translate(${x}, ${y}) rotate(${a})`}>
          <Ellipse cx={0} cy={-22} rx={9} ry={16} fill={petal} />
        </G>
      ))}
      <Circle cx={x} cy={y} r={11 * scale} fill={center} />
    </G>
  );
}

/* ---------- REGISTRO DAS 9 FLORES ----------
   - nome / genero: pro texto do label ("florido" vs "florida")
   - cor: cor base (usada pelo bloom genérico e pela prévia)
   - peek: as 2 cores que "espiam" no estágio do botão prestes a abrir
   - nivel: nível do usuário necessário p/ desbloquear
   - renderBloom: desenho próprio. Sem isso, usa o genérico.
*/
export const FLORES = {
  girassol:  { nome: "Girassol",  genero: "m", cor: "#FFC93B", peek: ["#FFC93B", "#FFB01E"], nivel: 1, renderBloom: girassolBloom },
  margarida: { nome: "Margarida", genero: "f", cor: "#FFFFFF", peek: ["#FFFFFF", "#FFD24D"], nivel: 2, renderBloom: margaridaBloom },
  tulipa:    { nome: "Tulipa",    genero: "f", cor: "#F285B2", peek: ["#F285B2", "#D14E81"], nivel: 3, renderBloom: tulipaBloom },
  rosa:      { nome: "Rosa",      genero: "f", cor: "#E8546E", peek: ["#E8546E", "#B01C3A"], nivel: 4, renderBloom: rosaBloom },
  lavanda:   { nome: "Lavanda",   genero: "f", cor: "#9B7ED8", peek: ["#9B7ED8", "#7E5FC4"], nivel: 5 },
  lirio:     { nome: "Lírio",     genero: "m", cor: "#F2A0C0", peek: ["#F2A0C0", "#E886AC"], nivel: 6 },
  orquidea:  { nome: "Orquídea",  genero: "f", cor: "#C77DD6", peek: ["#C77DD6", "#B062C2"], nivel: 7 },
  sakura:    { nome: "Sakura",    genero: "f", cor: "#FAC0D0", peek: ["#FAC0D0", "#F2A8BE"], nivel: 8 },
  hortensia: { nome: "Hortênsia", genero: "f", cor: "#8FB7E8", peek: ["#8FB7E8", "#73A0DC"], nivel: 9 },
};

// ordem em que aparecem na grade do jardim
export const FLORES_ORDEM = [
  "girassol", "lavanda", "rosa",
  "margarida", "tulipa", "lirio",
  "orquidea", "sakura", "hortensia",
];

export const FLOR_PADRAO = "girassol";