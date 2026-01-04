import React from "react";
import { View, Text, StyleSheet } from "react-native";

const DailyChallengeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Challenge</Text>
      <Text style={styles.text}>One puzzle per day. Complete it to earn points!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  text: { fontSize: 16, textAlign: "center" },
});

export default DailyChallengeScreen;
