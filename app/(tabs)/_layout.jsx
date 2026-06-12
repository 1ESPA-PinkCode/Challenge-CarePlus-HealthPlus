import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import CustomTabBar from "../../components/CustomTabBar";
import Header from "../../components/Header";
import { colors } from "../../constants/colors";

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <Header gemas={60} />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="recompensas" />
        <Tabs.Screen name="grupos" />
        <Tabs.Screen name="index" />
        <Tabs.Screen name="missoes" />
        <Tabs.Screen name="ajustes" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});