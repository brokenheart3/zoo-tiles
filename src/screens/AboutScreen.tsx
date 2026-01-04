import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

const AboutScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* --- Title --- */}
      <Text style={styles.title}>About Zoo-Tiles</Text>

      {/* --- Game Overview --- */}
      <Text style={styles.sectionTitle}>Game Overview</Text>
      <Text style={styles.paragraph}>
        Zoo-Tiles is a fun and educational animal-themed Sudoku game. 
        Instead of numbers, you solve puzzles using animal emojis. 
        The goal is to fill each row, column, and subgrid with unique animals.
      </Text>

      {/* --- Grid Sizes --- */}
      <Text style={styles.sectionTitle}>Grid Sizes</Text>
      <Text style={styles.paragraph}>
        The game includes multiple grid sizes to challenge your brain:
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>• 6x6 (3x2 subgrids)</Text>
        <Text style={styles.listItem}>• 8x8 (4x2 subgrids)</Text>
        <Text style={styles.listItem}>• 10x10 (5x2 subgrids)</Text>
        <Text style={styles.listItem}>• 12x12 (3x4 subgrids)</Text>
      </View>

      {/* --- How to Play --- */}
      <Text style={styles.sectionTitle}>How to Play</Text>
      <Text style={styles.paragraph}>
        1. Select an empty cell on the grid.{"\n"}
        2. Pick an animal emoji from the picker.{"\n"}
        3. Fill the grid so that each row, column, and subgrid contains unique animals.{"\n"}
        4. Use action buttons:
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>• Reset: Clear all your moves and start fresh.</Text>
        <Text style={styles.listItem}>• Undo: Undo your last move(s).</Text>
        <Text style={styles.listItem}>• Next Puzzle: Load a new random puzzle.</Text>
      </View>

      {/* --- Challenges --- */}
      <Text style={styles.sectionTitle}>Daily & Weekly Challenges</Text>
      <Text style={styles.paragraph}>
        Zoo-Tiles offers daily and weekly challenges to keep you engaged:
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>• Daily Challenge: One puzzle per day. Try to complete it in fewer attempts for higher points.</Text>
        <Text style={styles.listItem}>• Weekly Challenge: A new puzzle every week. Compete against others to get top rankings.</Text>
      </View>

      {/* --- Stats --- */}
      <Text style={styles.sectionTitle}>Statistics</Text>
      <Text style={styles.paragraph}>
        Track your progress with the Stats screen:
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>• Puzzles completed</Text>
        <Text style={styles.listItem}>• Best times per grid size</Text>
        <Text style={styles.listItem}>• Daily and weekly challenge scores</Text>
        <Text style={styles.listItem}>• Overall accuracy and performance trends</Text>
      </View>

      {/* --- Closing --- */}
      <Text style={styles.paragraph}>
        Zoo-Tiles is designed to be fun for all ages, helping you exercise your brain while enjoying adorable animals. Have fun and challenge yourself every day!
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  paragraph: { fontSize: 16, lineHeight: 24, marginBottom: 12 },
  list: { marginLeft: 10, marginBottom: 12 },
  listItem: { fontSize: 16, lineHeight: 22, marginBottom: 4 },
});

export default AboutScreen;
