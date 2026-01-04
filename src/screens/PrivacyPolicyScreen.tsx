import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

const PrivacyPolicyScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.paragraph}>
        Your privacy is important to us. Zoo-Tiles does not collect personal data without your consent.
        All game progress is stored locally or optionally synced to your account. We never share your
        information with third parties.
      </Text>
      <Text style={styles.paragraph}>
        By using this app, you consent to the collection of anonymous usage statistics to improve the game experience.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  paragraph: { fontSize: 16, marginBottom: 12, lineHeight: 22 },
});

export default PrivacyPolicyScreen;
