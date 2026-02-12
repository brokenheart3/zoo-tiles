// components/stats/AchievementCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AchievementCardProps {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedDate?: string;
  backgroundColor: string;
  textColor: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  name,
  description,
  icon,
  unlocked,
  progress = 0,
  maxProgress = 100,
  unlockedDate,
  backgroundColor,
  textColor,
}) => {
  const percentage = Math.min((progress / maxProgress) * 100, 100);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.icon]}>{icon}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.name, { color: textColor }]}>{name}</Text>
        <Text style={[styles.description, { color: textColor }]}>{description}</Text>
        {unlockedDate && (
          <Text style={[styles.unlockedDate, { color: textColor }]}>
            Unlocked: {unlockedDate}
          </Text>
        )}
        {!unlocked && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${percentage}%`, backgroundColor: '#4CAF50' },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 6,
  },
  unlockedDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#DDD',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default AchievementCard;

