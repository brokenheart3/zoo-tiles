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

  // All grid sizes with their subgrid dimensions
  const gridSizesList = [
    { size: "5x5", subgrid: "1x5", description: "Quick & easy" },
    { size: "6x6", subgrid: "2x3", description: "Small challenge" },
    { size: "7x7", subgrid: "1x7", description: "Linear thinking" },
    { size: "8x8", subgrid: "2x4", description: "Balanced" },
    { size: "9x9", subgrid: "3x3", description: "Classic" },
    { size: "10x10", subgrid: "2x5", description: "Extended" },
    { size: "11x11", subgrid: "1x11", description: "Advanced" },
    { size: "12x12", subgrid: "3x4", description: "Complex" },
    { size: "16x16", subgrid: "4x4", description: "Ultimate" },
  ];

  // Split grid sizes into rows of 3
  const gridRows = [];
  for (let i = 0; i < gridSizesList.length; i += 3) {
    gridRows.push(gridSizesList.slice(i, i + 3));
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* --- Header Logo --- */}
        <View style={styles.headerLogoContainer}>
          <Text style={styles.headerLogo}>🎮</Text>
          <Text style={[styles.headerLogoText, { color: colors.text }]}>Sudoku Tiles Pro</Text>
        </View>

        {/* --- Title --- */}
        <Text style={[styles.title, { color: colors.text }]}>About Our Game</Text>

        {/* --- Game Overview --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Overview</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Sudoku Tiles Pro is a fun and educational category-themed puzzle game. 
            Instead of numbers, you solve puzzles using themed emojis from 40+ categories 
            like Animals, Clothing, Cars, Sports, and more! 
            The goal is to fill each row, column, and subgrid with unique items.
          </Text>
        </View>

        {/* --- Features --- */}
        <View style={[styles.featureCard, { backgroundColor: colors.button }]}>
          <Text style={[styles.featureTitle, { color: colors.text }]}>Key Features</Text>
          
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: colors.text }]}>🎮</Text>
            <View style={styles.featureText}>
              <Text style={[styles.featureItemTitle, { color: colors.text }]}>9 Grid Sizes</Text>
              <Text style={[styles.featureItemDesc, { color: colors.text }]}>
                5x5 to 16x16 with various subgrid configurations
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: colors.text }]}>🎨</Text>
            <View style={styles.featureText}>
              <Text style={[styles.featureItemTitle, { color: colors.text }]}>40+ Categories</Text>
              <Text style={[styles.featureItemDesc, { color: colors.text }]}>
                Animals, Clothing, Cars, Sports, Food, and many more!
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: colors.text }]}>🏆</Text>
            <View style={styles.featureText}>
              <Text style={[styles.featureItemTitle, { color: colors.text }]}>Challenges</Text>
              <Text style={[styles.featureItemDesc, { color: colors.text }]}>
                Daily & weekly challenges with leaderboards
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

        {/* --- Grid Sizes - 3 per row --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Grid Sizes</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The game includes 9 different grid sizes to challenge your brain:
          </Text>
          
          {gridRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((grid, index) => (
                <View key={index} style={[styles.gridSizeCard, { backgroundColor: colors.button }]}>
                  <Text style={[styles.gridSizeNumber, { color: colors.text }]}>{grid.size}</Text>
                  <Text style={[styles.gridSizeSubgrid, { color: colors.text }]}>
                    {grid.subgrid}
                  </Text>
                  <Text style={[styles.gridSizeDesc, { color: colors.text }]}>
                    {grid.description}
                  </Text>
                </View>
              ))}
              {/* Add empty placeholders if row has less than 3 items */}
              {row.length < 3 && (
                <>
                  {Array(3 - row.length).fill(null).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.gridSizeCardPlaceholder} />
                  ))}
                </>
              )}
            </View>
          ))}
        </View>

        {/* --- How to Play --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Play</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            1. Select an empty cell on the grid.{"\n"}
            2. Pick an item from the category picker.{"\n"}
            3. Fill the grid so that each row, column, and subgrid contains unique items.{"\n"}
            4. Use action buttons:
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: colors.text }]}>• Reset: Clear all your moves and start fresh.</Text>
            <Text style={[styles.listItem, { color: colors.text }]}>• Undo: Undo your last move(s).</Text>
            <Text style={[styles.listItem, { color: colors.text }]}>• Hint: Get a random hint to help you progress.</Text>
            <Text style={[styles.listItem, { color: colors.text }]}>• Next Puzzle: Load a new random puzzle (Sequential mode).</Text>
          </View>
        </View>

        {/* --- Challenges --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily & Weekly Challenges</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Sudoku Tiles Pro offers daily and weekly challenges to keep you engaged:
          </Text>
          <View style={[styles.challengeCard, { backgroundColor: colors.button }]}>
            <Text style={[styles.challengeTitle, { color: colors.text }]}>Daily Challenge</Text>
            <Text style={[styles.challengeDesc, { color: colors.text }]}>
              One puzzle per day. Try to complete it with the best time and accuracy. 
              Resets every day at UTC midnight.
            </Text>
          </View>
          <View style={[styles.challengeCard, { backgroundColor: colors.button }]}>
            <Text style={[styles.challengeTitle, { color: colors.text }]}>Weekly Challenge</Text>
            <Text style={[styles.challengeDesc, { color: colors.text }]}>
              A new puzzle every week. Compete against others to get top rankings. 
              Resets every Monday at UTC midnight.
            </Text>
          </View>
        </View>

        {/* --- Categories --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Categories</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Sudoku Tiles Pro features over 40 unique categories:
          </Text>
          <View style={styles.categoriesGrid}>
            <View style={[styles.categoryCard, { backgroundColor: colors.button }]}>
              <Text style={styles.categoryEmoji}>🦁</Text>
              <Text style={[styles.categoryName, { color: colors.text }]}>Animals</Text>
            </View>
            <View style={[styles.categoryCard, { backgroundColor: colors.button }]}>
              <Text style={styles.categoryEmoji}>👕</Text>
              <Text style={[styles.categoryName, { color: colors.text }]}>Clothing</Text>
            </View>
            <View style={[styles.categoryCard, { backgroundColor: colors.button }]}>
              <Text style={styles.categoryEmoji}>🚗</Text>
              <Text style={[styles.categoryName, { color: colors.text }]}>Cars</Text>
            </View>
            <View style={[styles.categoryCard, { backgroundColor: colors.button }]}>
              <Text style={styles.categoryEmoji}>🏈</Text>
              <Text style={[styles.categoryName, { color: colors.text }]}>Sports</Text>
            </View>
            <View style={[styles.categoryCard, { backgroundColor: colors.button }]}>
              <Text style={styles.categoryEmoji}>🍎</Text>
              <Text style={[styles.categoryName, { color: colors.text }]}>Food</Text>
            </View>
            <View style={[styles.categoryCard, { backgroundColor: colors.button }]}>
              <Text style={styles.categoryEmoji}>🎵</Text>
              <Text style={[styles.categoryName, { color: colors.text }]}>Music</Text>
            </View>
          </View>
          <Text style={[styles.moreCategories, { color: colors.text }]}>
            ...and 34+ more categories to explore!
          </Text>
        </View>

        {/* --- FOOTER WITH LOGO --- */}
        <View style={styles.footer}>
          <View style={[styles.footerLogoContainer, { borderTopColor: colors.text }]}>
            <View style={styles.footerLogoCircle}>
              <Text style={styles.footerLogo}>🎮</Text>
            </View>
            <View style={styles.footerTextContainer}>
              <Text style={[styles.footerLogoText, { color: colors.text }]}>Sudoku Tiles Pro</Text>
              <Text style={[styles.footerTagline, { color: colors.text }]}>
                Puzzle Fun with Categories!
              </Text>
            </View>
          </View>
          
          <View style={[styles.footerInfo, { backgroundColor: `${colors.button}20` }]}>
            <Text style={[styles.footerInfoText, { color: colors.text }]}>Version 1.0.0</Text>
            <Text style={[styles.footerInfoText, { color: colors.text }]}>© 2024 Sudoku Tiles Pro</Text>
            <Text style={[styles.footerInfoText, { color: colors.text }]}>Made with ❤️ for puzzle lovers</Text>
          </View>
          
          <Text style={[styles.footerMessage, { color: colors.text }]}>
            Thank you for playing Sudoku Tiles Pro! We hope you enjoy our category-themed puzzle adventure.
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
    fontSize: 32,
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
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  gridSizeCard: {
    width: "31%",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridSizeCardPlaceholder: {
    width: "31%",
  },
  gridSizeNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  gridSizeSubgrid: {
    fontSize: 11,
    opacity: 0.8,
    marginBottom: 4,
  },
  gridSizeDesc: {
    fontSize: 10,
    textAlign: "center",
    opacity: 0.7,
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
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  categoryCard: {
    width: "31%",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "500",
  },
  moreCategories: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 5,
    opacity: 0.8,
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
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "System",
    marginBottom: 5,
  },
  footerTagline: {
    fontSize: 14,
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