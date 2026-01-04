import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>Name: Chamal Kayssar</Text>
      <Text style={styles.text}>Email: chamal@example.com</Text>
      <Text style={styles.text}>Member since: Jan 2026</Text>
      <Text style={styles.text}>Achievements: 0 / 100 puzzles completed</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10 },
});

export default ProfileScreen;
