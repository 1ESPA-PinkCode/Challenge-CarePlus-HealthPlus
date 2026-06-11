// components/FlorAnimada.jsx
import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import Flor from "./Flor";

export default function FlorAnimada({ tipo, target = 1, duration = 1800, ...rest }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [growth, setGrowth] = useState(0);

  useEffect(() => {
    const id = anim.addListener(({ value }) => setGrowth(value));
    Animated.timing(anim, {
      toValue: target,            // cresce até aqui (1 = flor cheia)
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,     // precisamos ler o valor a cada frame
    }).start();
    return () => anim.removeListener(id);
  }, [target, duration]);

  return <Flor tipo={tipo} growth={growth} {...rest} />;
}