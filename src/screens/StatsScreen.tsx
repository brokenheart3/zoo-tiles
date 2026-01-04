import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

interface Stats {
  puzzlesCompleted: number;
  bestTimes: { [gridSize: string]: string }; // e.g., { "6x6": "2m 15s" }
  dailyScore: number;
  weeklyScore: number;
  accuracy: number; // percentage
}

const StatsScreen = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  // Mock fetching stats (replace with backend/local storage later)
  useEffect(() => {
    const fetchStats = async () => {
      // Simulated fetch delay
      await new Promise((res) => setTimeout(res, 500));

      setStats({
        puzzlesCompleted: 120,
        bestTimes: { "6x6": "2m 15s", "8x8": "5m 42s", "10x10": "9m 10s", "12x12": "15m 8s" },
        dailyScore: 20,
        weeklyScore: 85,
        accuracy: 92,
      });
    };

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading stats...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Stats</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Puzzles Completed</Text>
        <Text style={styles.cardValue}>{stats.puzzlesCompleted}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Best Times</Text>
        {Object.entries(stats.bestTimes).map(([grid, time]) => (
          <Text key={grid} style={styles.cardText}>
            {grid}: {time}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Challenge Score</Text>
        <Text style={styles.cardValue}>{stats.dailyScore}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Challenge Score</Text>
        <Text style={styles.cardValue}>{stats.weeklyScore}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Accuracy</Text>
        <Text style={styles.cardValue}>{stats.accuracy}%</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 20, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  card: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 5 },
  cardValue: { fontSize: 22, fontWeight: "bold", color: "blue" },
  cardText: { fontSize: 16, marginBottom: 3 },
});

export default StatsScreen;
