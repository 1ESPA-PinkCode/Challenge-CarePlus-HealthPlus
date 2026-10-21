// components/FlorVisual.jsx — usa as flores em aquarela (FLORES_AQUARELA)
// e o desenho antigo nas demais.
import Flor from "./Flor";
import FlorAnimada from "./FlorAnimada";
import FlorAquarela, { FLORES_AQUARELA } from "./FlorAquarela";

export default function FlorVisual({ tipo, target = 1, size = 230, animar = true, canteiro = true, celebrar = 0 }) {
  if (FLORES_AQUARELA.includes(tipo)) {
    return <FlorAquarela tipo={tipo} target={target} size={size} animar={animar} canteiro={canteiro} celebrar={celebrar} />;
  }
  if (animar) return <FlorAnimada tipo={tipo} target={target} size={size} showLabel={false} showScenery={false} />;
  return <Flor tipo={tipo} missionsCompleted={40} totalMissions={40} showLabel={false} showScenery={false} size={size} />;
}
