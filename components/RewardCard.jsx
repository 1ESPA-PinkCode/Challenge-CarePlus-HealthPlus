import { View, Text, StyleSheet, Image } from "react-native";

const gema = require("../assets/images/gema.png");

export default function RewardCard({ reward }) {
  return (
    <View style={styles.card}>
      <View style={styles.textArea}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {reward.title}
        </Text>

        <Text style={styles.description} numberOfLines={3}>
          {reward.description}
        </Text>
      </View>

      <View style={styles.pointsContainer}>
        <Image source={gema} style={styles.gema} />
        <Text style={styles.points}>{reward.points}</Text>
      </View>

      <View style={[styles.button, reward.locked && styles.buttonLocked]}>
        <Text style={styles.buttonText}>
          {reward.locked ? "Bloqueado" : "Resgatar"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    height: 190,
    backgroundColor: "#B8DDCF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    position: "relative",
  },

  textArea: {
    width: "100%",
    paddingBottom: 75,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#16865F",
    lineHeight: 20,
  },

  description: {
    marginTop: 5,
    fontSize: 10,
    color: "#FFFFFF",
    lineHeight: 13,
    fontWeight: "600",
  },

  pointsContainer: {
    position: "absolute",
    left: 15,
    bottom: 55,
    flexDirection: "row",
    alignItems: "center",
  },

  gema: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginRight: -4,
    marginTop: 4,
  },

  points: {
    fontSize: 28,
    fontWeight: "900",
    color: "#8AC94B",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  button: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: 8,
    alignItems: "center",
  },

  buttonLocked: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#16865F",
  },

  buttonText: {
    color: "#16865F",
    fontSize: 14,
    fontWeight: "800",
  },
});