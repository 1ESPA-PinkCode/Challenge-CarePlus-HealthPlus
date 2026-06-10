import { Text, StyleSheet, TouchableOpacity } from "react-native";

export default function RewardButton({
  locked,
  redeemed,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        locked && styles.buttonLocked,
        redeemed && styles.buttonRedeemed,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonText,
          redeemed && styles.buttonTextRedeemed,
        ]}
      >
        {redeemed
          ? "Resgatado"
          : locked
          ? "Bloqueado"
          : "Resgatar"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonLocked: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#16865F",
  },

  buttonRedeemed: {
    backgroundColor: "#BDBDBD",
    borderWidth: 1,
    borderColor: "#757575",
  },

  buttonText: {
    color: "#16865F",
    fontSize: 14,
    fontWeight: "800",
  },

  buttonTextRedeemed: {
    color: "#424242",
  },
});