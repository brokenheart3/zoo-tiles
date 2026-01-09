import React, { useContext } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { ThemeContext, themeStyles, ThemeType } from "../context/ThemeContext";

const AboutScreen = () => {
  const { theme } = useContext(ThemeContext);
  const colors = themeStyles[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* --- Header Logo --- */}
        <View style={styles.headerLogoContainer}>
          <Text style={styles.headerLogo}>🦓</Text>
          <Text style={[styles.headerLogoText, { color: colors.text }]}>Zoo-Tiles</Text>
        </View>

        {/* --- Title --- */}
        <Text style={[styles.title, { color: colors.text }]}>About Our Game</Text>

        {/* --- Game Overview --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Overview</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Zoo-Tiles is a fun and educational animal-themed puzzle game. 
            Instead of numbers, you solve puzzles using animal emojis. 
            The goal is to fill each row, column, and subgrid with unique animals.
          </Text>
        </View>

        {/* --- Features --- */}
        <View style={[styles.featureCard, { backgroundColor: colors.button }]}>
          <Text style={[styles.featureTitle, { color: colors.text }]}>Key Features</Text>
          
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: colors.text }]}>🎮</Text>
            <View style={styles.featureText}>
              <Text style={[styles.featureItemTitle, { color: colors.text }]}>Multiple Grid Sizes</Text>
              <Text style={[styles.featureItemDesc, { color: colors.text }]}>
                6x6, 8x8, 10x10, 12x12 grids
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: colors.text }]}>🏆</Text>
            <View style={styles.featureText}>
              <Text style={[styles.featureItemTitle, { color: colors.text }]}>Challenges</Text>
              <Text style={[styles.featureItemDesc, { color: colors.text }]}>
                Daily & weekly challenges
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: colors.text }]}>📊</Text>
            <View style={styles.featureText}>
              <Text style={[styles.featureItemTitle, { color: colors.text }]}>Statistics</Text>
              <Text style={[styles.featureItemDesc, { color: colors.text }]}>
                Track your progress and performance
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: colors.text }]}>🎨</Text>
            <View style={styles.featureText}>
              <Text style={[styles.featureItemTitle, { color: colors.text }]}>Custom Themes</Text>
              <Text style={[styles.featureItemDesc, { color: colors.text }]}>
                Multiple app themes to choose from
              </Text>
            </View>
          </View>
        </View>

        {/* --- Grid Sizes --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Grid Sizes</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The game includes multiple grid sizes to challenge your brain:
          </Text>
          <View style={styles.gridSizes}>
            <View style={[styles.gridSizeCard, { backgroundColor: colors.button }]}>
              <Text style={[styles.gridSizeNumber, { color: colors.text }]}>6x6</Text>
              <Text style={[styles.gridSizeDesc, { color: colors.text }]}>3x2 subgrids</Text>
            </View>
            <View style={[styles.gridSizeCard, { backgroundColor: colors.button }]}>
              <Text style={[styles.gridSizeNumber, { color: colors.text }]}>8x8</Text>
              <Text style={[styles.gridSizeDesc, { color: colors.text }]}>4x2 subgrids</Text>
            </View>
            <View style={[styles.gridSizeCard, { backgroundColor: colors.button }]}>
              <Text style={[styles.gridSizeNumber, { color: colors.text }]}>10x10</Text>
              <Text style={[styles.gridSizeDesc, { color: colors.text }]}>5x2 subgrids</Text>
            </View>
            <View style={[styles.gridSizeCard, { backgroundColor: colors.button }]}>
              <Text style={[styles.gridSizeNumber, { color: colors.text }]}>12x12</Text>
              <Text style={[styles.gridSizeDesc, { color: colors.text }]}>3x4 subgrids</Text>
            </View>
          </View>
        </View>

        {/* --- How to Play --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Play</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            1. Select an empty cell on the grid.{"\n"}
            2. Pick an animal emoji from the picker.{"\n"}
            3. Fill the grid so that each row, column, and subgrid contains unique animals.{"\n"}
            4. Use action buttons:
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: colors.text }]}>• Reset: Clear all your moves and start fresh.</Text>
            <Text style={[styles.listItem, { color: colors.text }]}>• Undo: Undo your last move(s).</Text>
            <Text style={[styles.listItem, { color: colors.text }]}>• Next Puzzle: Load a new random puzzle.</Text>
          </View>
        </View>

        {/* --- Challenges --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily & Weekly Challenges</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Zoo-Tiles offers daily and weekly challenges to keep you engaged:
          </Text>
          <View style={[styles.challengeCard, { backgroundColor: colors.button }]}>
            <Text style={[styles.challengeTitle, { color: colors.text }]}>Daily Challenge</Text>
            <Text style={[styles.challengeDesc, { color: colors.text }]}>
              One puzzle per day. Try to complete it in fewer attempts for higher points.
            </Text>
          </View>
          <View style={[styles.challengeCard, { backgroundColor: colors.button }]}>
            <Text style={[styles.challengeTitle, { color: colors.text }]}>Weekly Challenge</Text>
            <Text style={[styles.challengeDesc, { color: colors.text }]}>
              A new puzzle every week. Compete against others to get top rankings.
            </Text>
          </View>
        </View>

        {/* --- FOOTER WITH LOGO --- */}
        <View style={styles.footer}>
          <View style={[styles.footerLogoContainer, { borderTopColor: colors.text }]}>
            <View style={styles.footerLogoCircle}>
              <Text style={styles.footerLogo}>🦓</Text>
            </View>
            <View style={styles.footerTextContainer}>
              <Text style={[styles.footerLogoText, { color: colors.text }]}>Zoo-Tiles</Text>
              <Text style={[styles.footerTagline, { color: colors.text }]}>
                Puzzle Fun with Animals!
              </Text>
            </View>
          </View>
          
          <View style={[styles.footerInfo, { backgroundColor: `${colors.button}20` }]}>
            <Text style={[styles.footerInfoText, { color: colors.text }]}>Version 1.0.0</Text>
            <Text style={[styles.footerInfoText, { color: colors.text }]}>© 2024 Zoo-Tiles</Text>
            <Text style={[styles.footerInfoText, { color: colors.text }]}>Made with ❤️ for puzzle lovers</Text>
          </View>
          
          <Text style={[styles.footerMessage, { color: colors.text }]}>
            Thank you for playing Zoo-Tiles! We hope you enjoy our animal-themed puzzle adventure.
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
  headerLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerLogo: {
    fontSize: 50,
    marginRight: 15,
  },
  headerLogoText: {
    fontSize: 36,
    fontWeight: "bold",
    fontFamily: "System",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  list: {
    marginLeft: 10,
    marginBottom: 15,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  featureCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  featureIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  featureText: {
    flex: 1,
  },
  featureItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureItemDesc: {
    fontSize: 14,
    opacity: 0.9,
  },
  gridSizes: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  gridSizeCard: {
    width: "48%",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridSizeNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  gridSizeDesc: {
    fontSize: 12,
    textAlign: "center",
  },
  challengeCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  challengeDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: "center",
  },
  footerLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    width: "100%",
  },
  footerLogoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  footerLogo: {
    fontSize: 40,
  },
  footerTextContainer: {
    alignItems: "flex-start",
  },
  footerLogoText: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "System",
    marginBottom: 5,
  },
  footerTagline: {
    fontSize: 16,
    fontStyle: "italic",
    opacity: 0.9,
  },
  footerInfo: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  footerInfoText: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
  },
  footerMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.9,
    marginTop: 10,
  },
});

export default AboutScreen;