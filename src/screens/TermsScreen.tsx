import React, { useContext } from "react";
import { ScrollView, Text, StyleSheet, SafeAreaView } from "react-native";
import { ThemeContext, themeStyles, ThemeType } from "../context/ThemeContext";

const TermsScreen = () => {
  const { theme } = useContext(ThemeContext);
  const colors = themeStyles[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Terms of Use</Text>
        
        <Text style={[styles.subtitle, { color: colors.text }]}>Last Updated: January 2024</Text>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          By using Zoo-Tiles, you agree to these Terms of Use. If you disagree with any part of these terms, you may not use our app.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. App Usage</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Zoo-Tiles is a puzzle game designed for entertainment and cognitive exercise. You agree to use this app responsibly and for its intended purpose.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. User Responsibilities</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • You will not use the app for cheating, modifying puzzles, or distributing content illegally.{'\n'}
          • You will not attempt to reverse engineer or decompile the app.{'\n'}
          • You will not use the app in any way that could damage, disable, or impair the service.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Intellectual Property</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          All content, design, graphics, and code in Zoo-Tiles are owned by the developers and protected by copyright laws.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Limitation of Liability</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          The app is provided "as-is" without any warranties. The developers are not liable for any loss of data, device issues, or any damages arising from the use of this app.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Privacy</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Your privacy is important to us. Please review our Privacy Policy for information on how we collect and use your data.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Changes to Terms</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We may update these Terms of Use from time to time. Continued use of the app after changes constitutes acceptance of the new terms.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Contact</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          For questions about these Terms, contact us at: support@zootiles.com
        </Text>

        <Text style={[styles.footer, { color: colors.text }]}>
          Thank you for using Zoo-Tiles!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: { 
    padding: 20,
    paddingBottom: 40,
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: { 
    fontSize: 16, 
    marginBottom: 15, 
    lineHeight: 24,
  },
  footer: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 30,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default TermsScreen;
