// components/Flor.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Ellipse, Path, G } from "react-native-svg";
import { FLORES, FLOR_PADRAO, genericBloom } from "./blooms";

const STAGE_CONFIG = {
  0: { stem: 0, leaf1: 0, leaf2: 0, leaf3: 0, sprout: 0, bud: 0, petals: 0, center: 0, wilted: false, seed: true },
  1: { stem: 10, leaf1: 0, leaf2: 0, leaf3: 0, sprout: 1, bud: 0, petals: 0, center: 0, wilted: false, seed: false },
  2: { stem: 42, leaf1: 1, leaf2: 1, leaf3: 0, sprout: 0, bud: 0, petals: 0, center: 0, wilted: false, seed: false },
  3: { stem: 70, leaf1: 1, leaf2: 1, leaf3: 0.7, sprout: 0, bud: 0.6, petals: 0, center: 0, wilted: false, seed: false },
  4: { stem: 100, leaf1: 1, leaf2: 1, leaf3: 1, sprout: 0, bud: 1, petals: 0, center: 0, wilted: false, seed: false },
  5: { stem: 100, leaf1: 1, leaf2: 1, leaf3: 1, sprout: 0, bud: 0, petals: 1, center: 1, wilted: false, seed: false },
  6: { stem: 100, leaf1: 0.75, leaf2: 0.75, leaf3: 0.75, sprout: 0, bud: 0, petals: 0.9, center: 1, wilted: true, seed: false },
};

const lerp = (a, b, t) => a + (b - a) * t;

// t (0..1) percorre os estágios 0→5 e devolve um config intermediário
function configAt(t) {
  const p = Math.max(0, Math.min(1, t)) * 5; // 0..5
  const i = Math.min(4, Math.floor(p));
  const f = p - i;
  const a = STAGE_CONFIG[i];
  const b = STAGE_CONFIG[i + 1];
  return {
    stem: lerp(a.stem, b.stem, f),
    leaf1: lerp(a.leaf1, b.leaf1, f),
    leaf2: lerp(a.leaf2, b.leaf2, f),
    leaf3: lerp(a.leaf3, b.leaf3, f),
    sprout: lerp(a.sprout, b.sprout, f),
    bud: lerp(a.bud, b.bud, f),
    petals: lerp(a.petals, b.petals, f),
    center: lerp(a.center, b.center, f),
    wilted: false,
    seed: t < 0.04,
  };
}

export function calculateStage(missionsCompleted, totalMissions, isWilted = false) {
  if (isWilted) return 6;
  if (!totalMissions || totalMissions === 0) return 0;
  const ratio = missionsCompleted / totalMissions;
  if (ratio === 0) return 0;
  if (ratio < 0.2) return 1;
  if (ratio < 0.4) return 2;
  if (ratio < 0.6) return 3;
  if (ratio < 0.8) return 4;
  return 5;
}

export function getStageLabel(stage, tipo = FLOR_PADRAO) {
  const flor = FLORES[tipo] || FLORES[FLOR_PADRAO];
  const fem = flor.genero === "f";
  const labels = {
    0: "Sementinha recém-plantada",
    1: "Brotinho com folhinhas",
    2: "Muda crescendo",
    3: "Caule alto e botão se formando",
    4: "Botão prestes a abrir",
    5: `${flor.nome} florid${fem ? "a" : "o"}`,
    6: `Murch${fem ? "a" : "o"} — precisa de cuidado`,
  };
  return labels[stage] || "";
}

export default function Flor({
  tipo = FLOR_PADRAO,
  missionsCompleted = 0,
  totalMissions = 0,
  isWilted = false,
  growth = null,        // 0..1 — se vier, anima o crescimento (ignora os estágios fixos)
  showLabel = true,
  showScenery = true,
  size = 220,
}) {
  const flor = FLORES[tipo] || FLORES[FLOR_PADRAO];

  // com growth -> config interpolado (crescimento suave); sem -> estágio fixo
  const stage =
    growth != null
      ? Math.min(5, Math.round(growth * 5))
      : calculateStage(missionsCompleted, totalMissions, isWilted);
  const c = growth != null ? configAt(growth) : STAGE_CONFIG[stage];

  const baseX = 200;
  const baseY = 328;
  const maxTop = 135;
  const stemTop = baseY - ((baseY - maxTop) * c.stem) / 100;
  const stemWidth = 2 + c.stem * 0.025;

  const stemColor = c.wilted ? "#8A7A45" : "#6DA038";
  const leafColor = c.wilted ? "#A89758" : "#7DB847";
  const leafColorLight = c.wilted ? "#B8A868" : "#8FBF4F";
  const leafVein = c.wilted ? "#8A7A45" : "#5A8F32";

  const stemPath = c.wilted
    ? `M ${baseX} ${baseY} Q ${baseX + 3} 260 ${baseX + 12} 220 Q ${baseX + 20} 200 ${baseX + 28} ${stemTop}`
    : `M ${baseX} ${baseY} Q ${baseX - 1} ${(baseY + stemTop) / 2} ${baseX} ${stemTop}`;

  const flowerX = c.wilted ? baseX + 28 : baseX;
  const flowerY = stemTop;

  const budPetalPeek = c.bud >= 1;
  const [peekA, peekB] = flor.peek;

  const makeLeaf = (progress, sideLeft, y, sizeMul) => {
    if (progress <= 0) return null;
    const dir = sideLeft ? -1 : 1;
    const length = 24 * sizeMul;
    const tipX = baseX + dir * length;
    const tipY = y + 3;
    const ctrlX1 = baseX + dir * (length * 0.4);
    const ctrlY1 = y - 8;
    const ctrlX2 = baseX + dir * (length * 0.4);
    const ctrlY2 = y + 10;
    return (
      <G key={`leaf-${y}`} scale={progress} originX={baseX} originY={y} opacity={progress}>
        <Path d={`M ${baseX} ${y} Q ${ctrlX1} ${ctrlY1} ${tipX} ${tipY} Q ${ctrlX2} ${ctrlY2} ${baseX} ${y + 3} Z`} fill={leafColor} />
        <Path d={`M ${baseX} ${y + 1} Q ${ctrlX1} ${y + 1} ${tipX - dir * 3} ${tipY}`} stroke={leafVein} strokeWidth={0.7} fill="none" opacity={c.wilted ? 0.4 : 0.9} />
      </G>
    );
  };

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size} viewBox="0 0 400 400">
        {showScenery && (
          <>
            <Circle cx={340} cy={70} r={28} fill={c.wilted ? "#E8C568" : "#FFD96B"} opacity={c.wilted ? 0.7 : 1} />
            {!c.wilted && <Circle cx={340} cy={70} r={40} fill="none" stroke="#FFD96B" strokeWidth={1.2} strokeDasharray="2 6" opacity={0.6} />}
            <G>
              <Ellipse cx={90} cy={80} rx={32} ry={10} fill={c.wilted ? "#C8C0A8" : "#FFFFFF"} opacity={0.85} />
              <Ellipse cx={110} cy={72} rx={24} ry={9} fill={c.wilted ? "#C8C0A8" : "#FFFFFF"} opacity={0.85} />
            </G>
            {!c.wilted && <Ellipse cx={230} cy={50} rx={22} ry={7} fill="#FFFFFF" opacity={0.75} />}
            <Ellipse cx={200} cy={340} rx={180} ry={14} fill="#8B6B3D" opacity={0.35} />
            <Path d="M 40 330 Q 50 325 60 330" stroke="#7DA843" strokeWidth={1.5} fill="none" strokeLinecap="round" />
            <Path d="M 340 335 Q 350 328 360 335" stroke="#7DA843" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </>
        )}

        <G>
          {c.seed && (
            <G>
              <Ellipse cx={baseX} cy={baseY} rx={8} ry={5} fill="#4A3520" />
              <Path d={`M ${baseX} ${baseY} L ${baseX} ${baseY - 6}`} stroke="#7DA843" strokeWidth={1.5} strokeLinecap="round" />
            </G>
          )}

          {c.sprout > 0 && (
            <G opacity={c.sprout}>
              <Ellipse cx={baseX} cy={baseY} rx={10} ry={4} fill="#4A3520" opacity={0.5} />
              <Path d={`M ${baseX} ${baseY} L ${baseX} ${baseY - 14}`} stroke={stemColor} strokeWidth={2} strokeLinecap="round" fill="none" />
              <Ellipse cx={baseX - 5} cy={baseY - 13} rx={5} ry={2.8} fill={leafColorLight} transform={`rotate(-35, ${baseX - 5}, ${baseY - 13})`} />
              <Ellipse cx={baseX + 5} cy={baseY - 13} rx={5} ry={2.8} fill={leafColorLight} transform={`rotate(35, ${baseX + 5}, ${baseY - 13})`} />
            </G>
          )}

          {/* caule: tira o "sprout === 0" pra não sumir durante a interpolação */}
          {c.stem > 0 && (
            <Path d={stemPath} stroke={stemColor} strokeWidth={stemWidth} strokeLinecap="round" fill="none" />
          )}

          {makeLeaf(c.leaf1, true, 282, 1.0)}
          {makeLeaf(c.leaf2, false, 250, 1.0)}
          {makeLeaf(c.leaf3, true, 215, 0.9)}

          {c.bud > 0 && (
            <G scale={c.bud} originX={baseX} originY={flowerY} opacity={c.bud}>
              <Ellipse cx={baseX - 6} cy={flowerY + 4} rx={7} ry={10} fill={leafColorLight} transform={`rotate(-20, ${baseX - 6}, ${flowerY + 4})`} opacity={0.9} />
              <Ellipse cx={baseX + 6} cy={flowerY + 4} rx={7} ry={10} fill={leafColorLight} transform={`rotate(20, ${baseX + 6}, ${flowerY + 4})`} opacity={0.9} />
              <Ellipse cx={baseX} cy={flowerY + 2} rx={12} ry={15} fill="#6DA038" />
              {budPetalPeek && (
                <G>
                  <Path d={`M ${baseX - 8} ${flowerY - 6} Q ${baseX - 5} ${flowerY - 14} ${baseX} ${flowerY - 13}`} fill={peekA} />
                  <Path d={`M ${baseX + 8} ${flowerY - 6} Q ${baseX + 5} ${flowerY - 14} ${baseX} ${flowerY - 13}`} fill={peekA} />
                  <Path d={`M ${baseX - 4} ${flowerY - 10} Q ${baseX - 2} ${flowerY - 16} ${baseX} ${flowerY - 13}`} fill={peekB} />
                  <Path d={`M ${baseX + 4} ${flowerY - 10} Q ${baseX + 2} ${flowerY - 16} ${baseX} ${flowerY - 13}`} fill={peekB} />
                </G>
              )}
            </G>
          )}

          {/* flor aberta: cresce junto (escala + opacidade vêm de c.petals) */}
          {c.petals > 0 && (
            <G
              opacity={c.petals}
              transform={`translate(${flowerX}, ${flowerY}) scale(${c.petals})${c.wilted ? " rotate(30)" : ""}`}
            >
              {flor.renderBloom
                ? flor.renderBloom(0, 0, c.center, c.wilted)
                : genericBloom(0, 0, c.center, c.wilted, flor.cor)}
            </G>
          )}
        </G>
      </Svg>

      {showLabel && <Text style={styles.label}>{getStageLabel(stage, tipo)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center" },
  label: { marginTop: 8, fontSize: 13, color: "#5A8F32", fontWeight: "600" },
});