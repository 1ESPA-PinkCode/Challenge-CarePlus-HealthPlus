// components/CenaJardim.jsx
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Circle, Ellipse, Path, G, Defs, ClipPath } from "react-native-svg";

/**
 * Cenário do jardim (céu, sol, arbustos, cerca, gramado e terra arada).
 * É só o "palco" — as flores são plantadas por cima, na tela do Jardim.
 *
 * Props:
 * - width, height: tamanho da cena (default 340 x 180)
 */
export default function CenaJardim({ width = 340, height = 180 }) {
  return (
    <View style={[styles.wrapper, { width, height }]}>
      <Svg width="100%" height="100%" viewBox="0 0 380 200">
        <Defs>
          <ClipPath id="card">
            <Rect x={2} y={2} width={376} height={196} rx={18} />
          </ClipPath>
        </Defs>

        <G clipPath="url(#card)">
          {/* céu */}
          <Rect x={0} y={0} width={380} height={200} fill="#FBFBF6" />

          {/* sol */}
          <Circle cx={330} cy={40} r={27} fill="#FFE25A" opacity={0.25} />
          <Circle cx={330} cy={40} r={20} fill="#FFE25A" />

          {/* arbustos ao fundo */}
          <Ellipse cx={40} cy={150} rx={50} ry={42} fill="#CDE6B8" />
          <Ellipse cx={95} cy={158} rx={42} ry={34} fill="#BFE0A8" />
          <Ellipse cx={340} cy={152} rx={52} ry={40} fill="#CDE6B8" />
          <Ellipse cx={290} cy={160} rx={40} ry={32} fill="#BFE0A8" />

          {/* gramado */}
          <Rect x={0} y={150} width={380} height={50} fill="#AED985" />

          {/* cerca branca */}
          <Rect x={120} y={120} width={140} height={30} rx={2} fill="#FFFFFF" opacity={0.92} />
          <G fill="#F2F2EC">
            <Rect x={126} y={116} width={6} height={34} rx={2} />
            <Rect x={150} y={116} width={6} height={34} rx={2} />
            <Rect x={174} y={116} width={6} height={34} rx={2} />
            <Rect x={198} y={116} width={6} height={34} rx={2} />
            <Rect x={222} y={116} width={6} height={34} rx={2} />
            <Rect x={246} y={116} width={6} height={34} rx={2} />
          </G>
          <Rect x={120} y={124} width={140} height={5} rx={2} fill="#F2F2EC" />
          <Rect x={120} y={138} width={140} height={5} rx={2} fill="#F2F2EC" />

          {/* faixa de terra arada */}
          <Ellipse cx={190} cy={178} rx={170} ry={26} fill="#8A5A33" />
          <Ellipse cx={190} cy={176} rx={160} ry={21} fill="#9C6A3D" />
          {/* pedrinhas */}
          <Ellipse cx={70} cy={180} rx={5} ry={2.5} fill="#C9C2B0" />
          <Ellipse cx={300} cy={182} rx={6} ry={3} fill="#C9C2B0" />
          <Ellipse cx={195} cy={186} rx={5} ry={2.4} fill="#C9C2B0" />

          {/* borboleta */}
          <G transform="translate(310, 138)">
            <Path d="M0 0 Q-6 -5 -10 0 Q-6 4 0 0 Z" fill="#FFD66B" />
            <Path d="M0 0 Q6 -5 10 0 Q6 4 0 0 Z" fill="#FFD66B" />
            <Circle cx={0} cy={0} r={1.4} fill="#7A5A1E" />
          </G>
        </G>

        {/* moldura */}
        <Rect x={2} y={2} width={376} height={196} rx={18} fill="none" stroke="#1C9770" strokeWidth={2.5} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: "center", position: "relative" },
});