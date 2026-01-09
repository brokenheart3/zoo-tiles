import React, { useState, useEffect, useContext } from 'react';
import {
  ScrollView,
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemeContext, themeStyles } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import common components
import { AppFooter } from '../components/common';

// Import stat components
import {
  QuickStatCard,
  ProgressBar,
  GridSizeStat,
  StreakDisplay,
  AchievementCard,
  StatSection,
  StatTabs,
  StatsGrid,
  TimeDisplay,
} from '../components/stats';

// Import shared utils
import {
  getAccuracyColor,
  getStreakColor,
  getGridDifficulty,
  formatDate,
} from '../utils/formatters';

// Navigation types
type RootStackParamList = {
  Stats: undefined;
  Home: undefined;
  Profile: undefined;
};

type StatsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Extended stats interface
interface ExtendedStats {
  puzzlesCompleted: number;
  bestTimes: { [gridSize: string]: string };
  dailyScore: number;
  weeklyScore: number;
  accuracy: number;
  totalPlayTime: number;
  currentStreak: number;
  longestStreak: number;
  averageTime: { [gridSize: string]: string };
  lastPlayed: string;
  totalPlayDays: number;
  weekendPuzzles: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  maxProgress: number;
}

const StatsScreen = () => {
  const navigation = useNavigation<StatsScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { profile } = useProfile();
  
  const colors = themeStyles[theme];
  
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'detailed', label: 'Detailed', icon: '📈' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
  ];

  useEffect(() => {
    fetchStats();
    fetchAchievements();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Try to get from AsyncStorage first
      const storedStats = await AsyncStorage.getItem('userStats');
      
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      } else {
        const profileStats = profile?.stats || {};
        
        // Default extended stats
        const defaultStats: ExtendedStats = {
          puzzlesCompleted: profileStats.puzzlesSolved || 0,
          bestTimes: { 
            "6x6": "2m 15s", 
            "8x8": "5m 42s", 
            "10x10": "9m 10s", 
            "12x12": "15m 8s" 
          },
          dailyScore: 20,
          weeklyScore: 85,
          accuracy: profileStats.accuracy || 0,
          totalPlayTime: 450,
          currentStreak: profileStats.currentStreak || 0,
          longestStreak: profileStats.currentStreak > 14 ? profileStats.currentStreak : 14,
          averageTime: { 
            "6x6": "3m 30s", 
            "8x8": "7m 15s", 
            "10x10": "12m 20s", 
            "12x12": "18m 45s" 
          },
          lastPlayed: formatDate(profileStats.lastPlayDate) || 'Today',
          totalPlayDays: profileStats.totalPlayDays || 1,
          weekendPuzzles: profileStats.weekendPuzzles || 0
        };
        
        setStats(defaultStats);
        await AsyncStorage.setItem('userStats', JSON.stringify(defaultStats));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const storedAchievements = await AsyncStorage.getItem('userAchievements');
      
      if (storedAchievements) {
        setAchievements(JSON.parse(storedAchievements));
      } else {
        // Calculate achievements based on stats
        const currentStats = stats || {
          puzzlesCompleted: 0,
          accuracy: 0,
          currentStreak: 0,
          dailyScore: 0,
          weeklyScore: 0,
          totalPlayTime: 0,
        };
        
        const defaultAchievements: Achievement[] = [
          {
            id: 'first_puzzle',
            name: 'First Steps',
            description: 'Complete your first puzzle',
            icon: '🎯',
            unlocked: currentStats.puzzlesCompleted > 0,
            progress: Math.min(currentStats.puzzlesCompleted, 1),
            maxProgress: 1
          },
          {
            id: 'puzzle_master',
            name: 'Puzzle Master',
            description: 'Complete 100 puzzles',
            icon: '👑',
            unlocked: currentStats.puzzlesCompleted >= 100,
            progress: Math.min(currentStats.puzzlesCompleted, 100),
            maxProgress: 100
          },
          {
            id: 'streak_7',
            name: 'Weekly Warrior',
            description: 'Maintain a 7-day streak',
            icon: '🔥',
            unlocked: currentStats.currentStreak >= 7,
            progress: Math.min(currentStats.currentStreak, 7),
            maxProgress: 7
          },
          {
            id: 'accuracy_90',
            name: 'Precision Expert',
            description: 'Maintain 90% accuracy',
            icon: '🎯',
            unlocked: currentStats.accuracy >= 90,
            progress: Math.min(currentStats.accuracy, 90),
            maxProgress: 90
          },
          {
            id: 'daily_champion',
            name: 'Daily Champion',
            description: 'Score 100 points in daily challenges',
            icon: '🏆',
            unlocked: currentStats.dailyScore >= 100,
            progress: Math.min(currentStats.dailyScore, 100),
            maxProgress: 100
          },
          {
            id: 'weekly_champion',
            name: 'Weekly Champion',
            description: 'Score 500 points in weekly challenges',
            icon: '🥇',
            unlocked: currentStats.weeklyScore >= 500,
            progress: Math.min(currentStats.weeklyScore, 500),
            maxProgress: 500
          },
          {
            id: 'time_traveler',
            name: 'Time Traveler',
            description: 'Play for 10 hours total',
            icon: '⏰',
            unlocked: currentStats.totalPlayTime >= 600,
            progress: Math.min(currentStats.totalPlayTime, 600),
            maxProgress: 600
          },
          {
            id: 'weekend_warrior',
            name: 'Weekend Warrior',
            description: 'Complete 50 weekend puzzles',
            icon: '🎮',
            unlocked: (stats?.weekendPuzzles || 0) >= 50,
            progress: Math.min(stats?.weekendPuzzles || 0, 50),
            maxProgress: 50
          }
        ];
        setAchievements(defaultAchievements);
        await AsyncStorage.setItem('userAchievements', JSON.stringify(defaultAchievements));
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchAchievements()]);
  };

  const handleNewPuzzle = () => {
    navigation.navigate('Home');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your stats...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Failed to load stats
          </Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.button }]}
            onPress={handleRefresh}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              {profile?.name ? `${profile.name}'s Stats` : 'Your Stats'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Text style={[styles.refreshButtonText, { color: colors.text }]}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <StatTabs
          tabs={tabs}
          activeTab={selectedTab}
          onTabChange={setSelectedTab}
          backgroundColor={colors.button + '30'}
          activeBackgroundColor={colors.button}
          textColor={colors.text + 'CC'}
          activeTextColor={colors.text}
        />

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <>
            <StatSection title="Quick Stats" textColor={colors.text}>
              <StatsGrid columns={2}>
                <QuickStatCard
                  value={stats.puzzlesCompleted}
                  label="Puzzles Completed"
                  icon="🧩"
                  backgroundColor={colors.button}
                  textColor={colors.text}
                />
                <QuickStatCard
                  value={`${stats.accuracy}%`}
                  label="Accuracy"
                  icon="🎯"
                  valueColor={getAccuracyColor(stats.accuracy)}
                  backgroundColor={colors.button}
                  textColor={colors.text}
                />
                <QuickStatCard
                  value={stats.currentStreak}
                  label="Current Streak"
                  icon="🔥"
                  valueColor={getStreakColor(stats.currentStreak)}
                  backgroundColor={colors.button}
                  textColor={colors.text}
                />
                <QuickStatCard
                  value={`${unlockedAchievements}/${totalAchievements}`}
                  label="Achievements"
                  icon="🏆"
                  backgroundColor={colors.button}
                  textColor={colors.text}
                />
              </StatsGrid>
            </StatSection>

            <StatSection title="Challenge Progress" textColor={colors.text}>
              <ProgressBar
                label="Daily Challenge Score"
                current={stats.dailyScore}
                total={100}
                fillColor="#2196F3"
                textColor={colors.text}
                showPercentage={true}
              />
              <ProgressBar
                label="Weekly Challenge Score"
                current={stats.weeklyScore}
                total={500}
                fillColor="#9C27B0"
                textColor={colors.text}
                showPercentage={true}
              />
            </StatSection>

            <StatSection title="Activity Summary" textColor={colors.text}>
              <View style={[styles.summaryCard, { backgroundColor: colors.button }]}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {stats.totalPlayDays}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.text }]}>
                      Days Played
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {stats.weekendPuzzles}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.text }]}>
                      Weekend Puzzles
                    </Text>
                  </View>
                </View>
                <TimeDisplay
                  minutes={stats.totalPlayTime}
                  label="Total Play Time"
                  textColor={colors.text}
                  compact={true}
                />
                <Text style={[styles.lastPlayed, { color: colors.text }]}>
                  Last played: {stats.lastPlayed}
                </Text>
              </View>
            </StatSection>
          </>
        )}

        {/* Detailed Tab */}
        {selectedTab === 'detailed' && (
          <>
            <StatSection title="Grid Performance" textColor={colors.text}>
              {Object.entries(stats.bestTimes).map(([gridSize, bestTime]) => (
                <GridSizeStat
                  key={gridSize}
                  gridSize={gridSize}
                  bestTime={bestTime}
                  averageTime={stats.averageTime[gridSize]}
                  difficulty={getGridDifficulty(gridSize)}
                  backgroundColor={colors.button}
                  textColor={colors.text}
                />
              ))}
            </StatSection>

            <StatSection title="Streak Performance" textColor={colors.text}>
              <StreakDisplay
                currentStreak={stats.currentStreak}
                longestStreak={stats.longestStreak}
                backgroundColor={colors.button}
                textColor={colors.text}
              />
            </StatSection>

            <StatSection title="Additional Stats" textColor={colors.text}>
              <View style={[styles.additionalStats, { backgroundColor: colors.button }]}>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {stats.puzzlesCompleted}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>
                      Total Puzzles
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {stats.accuracy}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>
                      Overall Accuracy
                    </Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {stats.dailyScore}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>
                      Daily Score
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {stats.weeklyScore}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>
                      Weekly Score
                    </Text>
                  </View>
                </View>
              </View>
            </StatSection>
          </>
        )}

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <>
            <StatSection 
              title={`Achievements (${unlockedAchievements}/${totalAchievements})`} 
              textColor={colors.text}
            >
              {achievements.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: colors.button }]}>
                  <Text style={[styles.emptyStateText, { color: colors.text }]}>
                    No achievements yet. Play more puzzles to earn achievements!
                  </Text>
                  <TouchableOpacity 
                    style={[styles.playButton, { backgroundColor: '#4CAF50' }]}
                    onPress={handleNewPuzzle}
                  >
                    <Text style={styles.playButtonText}>Play Now</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                achievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    name={achievement.name}
                    description={achievement.description}
                    icon={achievement.icon}
                    unlocked={achievement.unlocked}
                    progress={achievement.progress}
                    maxProgress={achievement.maxProgress}
                    unlockedDate={achievement.unlockedDate}
                    backgroundColor={colors.button}
                    textColor={colors.text}
                  />
                ))
              )}
            </StatSection>
            
            {unlockedAchievements > 0 && (
              <View style={[styles.progressSummary, { backgroundColor: colors.button }]}>
                <Text style={[styles.progressText, { color: colors.text }]}>
                  {unlockedAchievements === totalAchievements 
                    ? '🎉 All achievements unlocked!'
                    : `You've unlocked ${unlockedAchievements} of ${totalAchievements} achievements`
                  }
                </Text>
              </View>
            )}
          </>
        )}

        {/* Play Now Button - Moved above footer */}
        <TouchableOpacity 
          style={[styles.playNowButton, { backgroundColor: '#4CAF50' }]}
          onPress={handleNewPuzzle}
        >
          <Text style={styles.playNowText}>🎮 Play Now</Text>
        </TouchableOpacity>

        {/* Footer - Now below Play Now button */}
        <AppFooter 
          textColor={colors.text} 
          version="1.0.0"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  lastPlayed: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  additionalStats: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  emptyState: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  playButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  playButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressSummary: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  playNowButton: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  playNowText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StatsScreen;