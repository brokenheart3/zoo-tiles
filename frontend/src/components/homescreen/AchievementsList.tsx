// src/components/homescreen/AchievementsList.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

type Achievement = {
  id: number;
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  unlockDate?: string;
};

type AchievementsListProps = {
  trophies: Achievement[];
  themeColors: any;
};

const AchievementsList: React.FC<AchievementsListProps> = ({ trophies, themeColors }) => {
  // Safety check - ensure trophies is an array
  if (!trophies || !Array.isArray(trophies)) {
    console.log('❌ AchievementsList: trophies is not an array', trophies);
    return (
      <View style={[styles.emptyAchievements, { backgroundColor: themeColors.button }]}>
        <Text style={[styles.emptyAchievementsText, { color: themeColors.text }]}>
          🏆 Loading achievements...
        </Text>
      </View>
    );
  }

  // Filter unlocked trophies
  const unlockedTrophies = trophies.filter(t => t.unlocked === true);
  
  console.log('🏆 AchievementsList - Total trophies:', trophies.length);
  console.log('🏆 AchievementsList - Unlocked trophies:', unlockedTrophies.length);
  console.log('🏆 AchievementsList - First trophy:', trophies[0]);

  if (unlockedTrophies.length === 0) {
    return (
      <View style={[styles.emptyAchievements, { backgroundColor: themeColors.button }]}>
        <Text style={[styles.emptyAchievementsText, { color: themeColors.text }]}>
          🏆 No achievements yet. Complete puzzles to earn trophies!
        </Text>
        {/* Show a few locked achievements as preview */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
          {trophies.slice(0, 3).map((trophy, index) => (
            <View 
              key={index} 
              style={[styles.trophyCard, { backgroundColor: themeColors.button + '80', opacity: 0.5 }]}
            >
              <Text style={styles.trophyEmoji}>{trophy.icon}</Text>
              <Text style={[styles.trophyName, { color: themeColors.text }]}>{trophy.name}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${trophy.progress * 100}%`, backgroundColor: '#4CAF50' }
                  ]} 
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.achievementsScroll}
    >
      {unlockedTrophies.map((trophy) => (
        <View 
          key={trophy.id} 
          style={[styles.trophyCard, { backgroundColor: themeColors.button }]}
        >
          <Text style={styles.trophyEmoji}>{trophy.icon}</Text>
          <Text style={[styles.trophyName, { color: themeColors.text }]}>{trophy.name}</Text>
          <Text style={[styles.trophyDate, { color: themeColors.text }]}>
            {trophy.unlockDate || 'Recently'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  achievementsScroll: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  trophyCard: {
    width: 120,
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  trophyEmoji: {
    fontSize: 35,
    marginBottom: 8,
  },
  trophyName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  trophyDate: {
    fontSize: 11,
    opacity: 0.7,
  },
  emptyAchievements: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  emptyAchievementsText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default AchievementsList;