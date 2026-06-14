import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import RewardButton from "./RewardButton";

const gema = require("../assets/images/gema.png");

export default function RewardCard({
  reward,
  onRedeem,
  coupon,
  isRedeemedSection = false,
  onCopyCoupon,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.textArea}>
        <Text style={styles.cardTitle}>{reward.title}</Text>
        <Text style={styles.description}>{reward.description}</Text>
      </View>

      {isRedeemedSection ? (
        <View style={styles.couponMiniBox}>
          <Text style={styles.couponLabel}>Cupom</Text>
          <Text style={styles.couponMiniText}>{coupon}</Text>

          <TouchableOpacity style={styles.copyMiniButton} onPress={onCopyCoupon}>
            <Text style={styles.copyMiniText}>Copiar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.pointsContainer}>
            <Image source={gema} style={styles.gema} />
            <Text style={styles.points}>{reward.points}</Text>
          </View>

          <RewardButton
            locked={reward.locked}
            redeemed={reward.redeemed}
            onPress={onRedeem}
          />
        </>
      )}
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
    paddingBottom: 55,
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
    width: 55,
    height: 55,
    resizeMode: "contain",
    marginRight: -4,
    marginTop: 4,
  },

  points: {
    fontSize: 26,
    fontWeight: "900",
    color: "#8AC94B",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  couponMiniBox: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 7,
    alignItems: "center",
  },

  couponLabel: {
    color: "#16865F",
    fontSize: 9,
    fontWeight: "700",
  },

  couponMiniText: {
    color: "#16865F",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 2,
  },

  copyMiniButton: {
    marginTop: 6,
    backgroundColor: "#16865F",
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 18,
  },

  copyMiniText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
});