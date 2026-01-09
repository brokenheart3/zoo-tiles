import React, { useContext } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  View,
} from "react-native";
import { ThemeContext, themeStyles, ThemeType } from "../context/ThemeContext";

const PrivacyPolicyScreen = () => {
  const { theme } = useContext(ThemeContext);
  const colors = themeStyles[theme];

  const privacySections = [
    {
      title: "Information We Collect",
      content: "Zoo-Tiles collects minimal data to provide and improve the game experience. This includes:",
      points: [
        "Game progress and statistics (puzzles solved, accuracy, streaks)",
        "App usage data for improving features",
        "Optional account information if you choose to create an account"
      ]
    },
    {
      title: "Data Storage",
      content: "Your game data is stored:",
      points: [
        "Locally on your device (default)",
        "Securely in the cloud if you enable sync",
        "Temporarily for session management"
      ]
    },
    {
      title: "Data Usage",
      content: "We use collected data to:",
      points: [
        "Provide personalized game experiences",
        "Improve app performance and fix bugs",
        "Analyze usage patterns to enhance features",
        "Send important app updates and notifications"
      ]
    },
    {
      title: "Third-Party Services",
      content: "Zoo-Tiles uses these third-party services:",
      points: [
        "Google Play Services (Android only)",
        "Apple Game Center (iOS only)",
        "Firebase Analytics (anonymous usage data)",
        "No advertising networks are used"
      ]
    },
    {
      title: "Your Rights",
      content: "You have the right to:",
      points: [
        "Access your personal data",
        "Delete your account and all associated data",
        "Opt-out of data collection (some features may be limited)",
        "Export your game progress data"
      ]
    },
    {
      title: "Children's Privacy",
      content: "Zoo-Tiles is suitable for all ages:",
      points: [
        "We do not knowingly collect personal information from children under 13",
        "Parental guidance is recommended for young users",
        "All content is family-friendly"
      ]
    },
    {
      title: "Changes to This Policy",
      content: "We may update this privacy policy:",
      points: [
        "Updates will be posted in the app",
        "Continued use after changes constitutes acceptance",
        "Major changes will be notified in-app"
      ]
    },
    {
      title: "Contact Us",
      content: "For privacy-related questions:",
      points: [
        "Email: privacy@zootiles.com",
        "Response time: 3-5 business days",
        "We take all privacy concerns seriously"
      ]
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>Last Updated: January 2024</Text>
        
        <View style={[styles.introCard, { backgroundColor: colors.button }]}>
          <Text style={[styles.introText, { color: colors.text }]}>
            Your privacy is important to us. Zoo-Tiles is designed with privacy in mind.
            This document explains how we handle your information.
          </Text>
        </View>

        <Text style={[styles.summaryTitle, { color: colors.text }]}>Summary</Text>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          Zoo-Tiles does not collect personal data without your consent. 
          All game progress is stored locally or optionally synced to your account. 
          We never sell or share your information with third parties. 
          By using this app, you consent to the collection of anonymous usage statistics to improve the game experience.
        </Text>

        {privacySections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={[styles.sectionHeader, { borderBottomColor: colors.text }]}>
              <View style={[styles.sectionNumber, { backgroundColor: colors.button }]}>
                <Text style={[styles.sectionNumberText, { color: colors.text }]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {section.title}
              </Text>
            </View>
            
            <Text style={[styles.sectionContent, { color: colors.text }]}>
              {section.content}
            </Text>
            
            {section.points.map((point, pointIndex) => (
              <View key={pointIndex} style={styles.pointItem}>
                <Text style={[styles.pointBullet, { color: colors.text }]}>•</Text>
                <Text style={[styles.pointText, { color: colors.text }]}>
                  {point}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={[styles.importantCard, { backgroundColor: `${colors.button}30` }]}>
          <Text style={[styles.importantTitle, { color: colors.text }]}>Important Notice</Text>
          <Text style={[styles.importantText, { color: colors.text }]}>
            By using Zoo-Tiles, you agree to this Privacy Policy. 
            If you do not agree with any part of this policy, please discontinue use of the app. 
            For questions or concerns, contact us at privacy@zootiles.com.
          </Text>
        </View>

        <View style={[styles.versionInfo, { backgroundColor: colors.button }]}>
          <Text style={[styles.versionText, { color: colors.text }]}>
            Zoo-Tiles Privacy Policy v1.0
          </Text>
          <Text style={[styles.effectiveText, { color: colors.text }]}>
            Effective Date: January 1, 2024
          </Text>
        </View>
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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 30,
    textAlign: "center",
  },
  introCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
  },
  sectionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  sectionNumberText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  pointItem: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  pointBullet: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  pointText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  importantCard: {
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#ff6b6b",
  },
  importantTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ff6b6b",
  },
  importantText: {
    fontSize: 14,
    lineHeight: 20,
  },
  versionInfo: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  effectiveText: {
    fontSize: 12,
    opacity: 0.9,
  },
});

export default PrivacyPolicyScreen;
