import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

const TermsScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Terms of Use</Text>
      <Text style={styles.paragraph}>
        By using Zoo-Tiles, you agree to use this app responsibly. The app is provided as-is without any warranties.
        The developers are not liable for any loss of data or device issues.
      </Text>
      <Text style={styles.paragraph}>
        You agree not to use the app for cheating, modifying puzzles, or distributing content illegally.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  paragraph: { fontSize: 16, marginBottom: 12, lineHeight: 22 },
});

export default TermsScreen;
