import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Stats = {
  puzzlesSolved: number;
  accuracy: number;
  currentStreak: number;
};

type StatsSummaryProps = {
  stats: Stats;
  unlockedTrophiesCount: number;
  themeColors: any;
};

const StatsSummary: React.FC<StatsSummaryProps> = ({
  stats,
  unlockedTrophiesCount,
  themeColors,
}) => {
  return (
    <View style={[styles.statsCard, { backgroundColor: themeColors.button }]}>
      <Text style={[styles.statsTitle, { color: themeColors.text }]}>Your Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: themeColors.text }]}>
            {stats?.puzzlesSolved || 0}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.text }]}>Puzzles</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: themeColors.text }]}>
            {stats?.accuracy || 0}%
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.text }]}>Accuracy</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: themeColors.text }]}>
            {stats?.currentStreak || 0}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.text }]}>Day Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: themeColors.text }]}>
            {unlockedTrophiesCount || 0}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.text }]}>Trophies</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
});

export default StatsSummary;