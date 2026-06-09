import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors } from "../../constants/colors";
import RewardCard from "../../components/RewardCard";

export default function Recompensas() {
  const rewards = [
    {
      title: "Squeeze",
      description:
        "Retire no local informado após confirmar seu resgate.",
      points: 200,
      locked: false,
    },
    {
      title: "App Meditação",
      description:
        "O Cupom será gerado após o resgate.",
      points: 205,
      locked: true,
    },
    {
      title: "Gift Card (R$20)",
      description:
        "O Cupom será gerado após o resgate.",
      points: 150,
      locked: false,
    },
    {
      title: "Kit de Snacks",
      description:
        "Retire no local informado após confirmar seu resgate.",
      points: 70,
      locked: false,
    },
    {
      title: "20% OFF Skincare",
      description:
        "Retire no local informado após confirmar seu resgate.",
      points: 200,
      locked: false,
    },
    {
      title: "Aula de Yoga",
      description:
        "O Cupom será gerado após o resgate.",
      points: 200,
      locked: false,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.titleBox}>
        <Text style={styles.title}>Recompensas</Text>
      </View>

      <View style={styles.grid}>
        {rewards.map((reward, index) => (
          <RewardCard
            key={index}
            reward={reward}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },

  titleBox: {
    backgroundColor: colors.primary,
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  title: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});