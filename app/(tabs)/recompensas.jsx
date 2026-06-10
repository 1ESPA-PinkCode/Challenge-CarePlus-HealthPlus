import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import * as Clipboard from "expo-clipboard";

import { colors } from "../../constants/colors";
import RewardCard from "../../components/RewardCard";
import { useGemas } from "../../contexts/GemsContext";

export default function Recompensas() {
  const { gemas, removeGemas } = useGemas();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLockedModal, setIsLockedModal] = useState(false);
  const [isErrorModal, setIsErrorModal] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState("");
  const [redeemedRewards, setRedeemedRewards] = useState({});

  const rewards = [
    {
      title: "Squeeze",
      description: "Retire no local informado após confirmar seu resgate.",
      points: 200,
    },
    {
      title: "App Meditação",
      description: "O cupom será gerado após o resgate.",
      points: 205,
    },
    {
      title: "Gift Card (R$20)",
      description: "O cupom será gerado após o resgate.",
      points: 150,
    },
    {
      title: "Kit de Snacks",
      description: "Retire no local informado após confirmar seu resgate.",
      points: 70,
    },
    {
      title: "20% OFF Skincare",
      description: "Retire no local informado após confirmar seu resgate.",
      points: 200,
    },
    {
      title: "Aula de Yoga",
      description: "O cupom será gerado após o resgate.",
      points: 200,
    },
  ];

  function generateCoupon() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let coupon = "";

    for (let i = 0; i < 10; i++) {
      coupon += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return coupon;
  }

  const rewardsWithStatus = rewards.map((reward) => ({
    ...reward,
    locked: gemas < reward.points,
    redeemed: !!redeemedRewards[reward.title],
  }));

  function openModal(reward) {
    setSelectedReward(reward);
    setCopied(false);
    setIsErrorModal(false);
    setGeneratedCoupon("");

    if (redeemedRewards[reward.title]) {
      setGeneratedCoupon(redeemedRewards[reward.title]);
      setIsLockedModal(false);
      setModalVisible(true);
      return;
    }

    setIsLockedModal(reward.locked);

    if (!reward.locked) {
      try {
        const coupon = generateCoupon();

        if (!coupon) {
          throw new Error("Erro ao gerar cupom");
        }

        setGeneratedCoupon(coupon);
        removeGemas(reward.points);

        setRedeemedRewards((currentRewards) => ({
          ...currentRewards,
          [reward.title]: coupon,
        }));
      } catch (error) {
        setIsErrorModal(true);
      }
    }

    setModalVisible(true);
  }

  async function copyCoupon() {
    if (!generatedCoupon) return;

    await Clipboard.setStringAsync(generatedCoupon);
    setCopied(true);
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.titleBox}>
          <Text style={styles.title}>Recompensas</Text>
        </View>

        <View style={styles.grid}>
          {rewardsWithStatus.map((reward, index) => (
            <RewardCard
              key={index}
              reward={reward}
              onRedeem={() => openModal(reward)}
            />
          ))}
        </View>
      </ScrollView>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {isErrorModal
                ? "Ops! Não conseguimos finalizar seu resgate"
                : isLockedModal
                ? "Recompensa bloqueada"
                : redeemedRewards[selectedReward?.title]
                ? "Cupom já resgatado"
                : "Parabéns pela conquista!"}
            </Text>

            <Text style={styles.modalText}>
              {isErrorModal
                ? "Pode ter sido sua internet ou um problema temporário. Tente novamente em alguns instantes."
                : isLockedModal
                ? `Você ainda não possui gemas suficientes para resgatar "${selectedReward?.title}". Complete mais missões para desbloquear essa recompensa.`
                : redeemedRewards[selectedReward?.title]
                ? "Esse cupom já foi resgatado anteriormente. Você pode copiar e usar o mesmo código abaixo."
                : "Você está cuidando de você e isso merece ser celebrado. Sua recompensa já está disponível para resgate!"}
            </Text>

            <Text style={styles.heart}>
              {isErrorModal
                ? "⚠️"
                : isLockedModal
                ? "🔒"
                : redeemedRewards[selectedReward?.title]
                ? "🎟️"
                : "💚"}
            </Text>

            {!isLockedModal && !isErrorModal && (
              <>
                <Text style={styles.modalSubtitle}>
                  Utilize o cupom abaixo:
                </Text>

                <View style={styles.couponBox}>
                  <Text style={styles.coupon}>{generatedCoupon}</Text>
                </View>

                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={copyCoupon}
                >
                  <Text style={styles.copyButtonText}>
                    {copied ? "Cupom copiado!" : "Copiar cupom"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalBox: {
    width: "100%",
    backgroundColor: "#003C2D",
    borderRadius: 8,
    padding: 28,
    alignItems: "center",
  },

  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 24,
    textAlign: "center",
  },

  modalText: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 20,
  },

  heart: {
    fontSize: 24,
    marginBottom: 20,
  },

  modalSubtitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
  },

  couponBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    marginBottom: 16,
  },

  coupon: {
    color: "#16865F",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },

  copyButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginBottom: 12,
  },

  copyButtonText: {
    color: "#16865F",
    fontSize: 15,
    fontWeight: "800",
  },

  closeButton: {
    paddingVertical: 6,
  },

  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});