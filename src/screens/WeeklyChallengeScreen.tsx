import React from "react";
import { View, Text, StyleSheet } from "react-native";

const WeeklyChallengeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Challenge</Text>
      <Text style={styles.text}>One puzzle per week. Compete for top rankings!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  text: { fontSize: 16, textAlign: "center" },
});

export default WeeklyChallengeScreen;
