import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  backgroundColor: string;
  textColor: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  longestStreak,
  backgroundColor,
  textColor,
}) => {
  const getStreakColor = (streak: number) => {
    if (streak >= 14) return '#FF9800';
    if (streak >= 7) return '#4CAF50';
    if (streak > 0) return '#2196F3';
    return '#AAA';
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Streak Stats</Text>

      <View style={styles.streaksContainer}>
        <View style={styles.streakItem}>
          <Text style={[styles.streakValue, { color: getStreakColor(currentStreak) }]}>
            {currentStreak}
          </Text>
          <Text style={[styles.streakLabel, { color: textColor }]}>Current</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.streakItem}>
          <Text style={[styles.streakValue, { color: getStreakColor(longestStreak) }]}>
            {longestStreak}
          </Text>
          <Text style={[styles.streakLabel, { color: textColor }]}>Longest</Text>
        </View>
      </View>

      {currentStreak > 0 && (
        <View style={styles.fireContainer}>
          {Array.from({ length: Math.min(currentStreak, 7) }).map((_, index) => (
            <Text key={index} style={styles.fireEmoji}>🔥</Text>
          ))}
          {currentStreak > 7 && (
            <Text style={[styles.streakText, { color: textColor }]}>
              +{currentStreak - 7}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  streaksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#DDD',
  },
  fireContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  fireEmoji: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default StreakDisplay;
