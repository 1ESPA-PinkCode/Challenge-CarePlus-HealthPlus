// components/FlorVisual.jsx — usa o visual novo nas flores que já têm (FLORES_NOVAS)
// e o desenho antigo nas demais.
import Flor from "./Flor";
import FlorAnimada from "./FlorAnimada";
import FlorNova, { FLORES_NOVAS } from "./FlorNova";

export default function FlorVisual({ tipo, target = 1, size = 230, animar = true, canteiro = true, celebrar = 0 }) {
  if (FLORES_NOVAS.includes(tipo)) {
    return <FlorNova tipo={tipo} target={target} size={size} animar={animar} canteiro={canteiro} celebrar={celebrar} />;
  }
  if (animar) return <FlorAnimada tipo={tipo} target={target} size={size} showLabel={false} showScenery={false} />;
  return <Flor tipo={tipo} missionsCompleted={40} totalMissions={40} showLabel={false} showScenery={false} size={size} />;
}
