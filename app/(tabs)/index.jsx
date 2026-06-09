import { View, Text, StyleSheet, ScrollView } from "react-native";
import Greeting from "../../components/Greeting";
import { colors } from "../../constants/colors";

export default function Inicio() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Greeting nome="Lucas" />
        <Text style={styles.placeholder}>Conteúdo da tela inicial</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 20 },
  placeholder: {
    color: colors.textDark,
    fontSize: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
});