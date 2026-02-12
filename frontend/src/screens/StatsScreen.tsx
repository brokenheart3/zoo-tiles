// screens/StatsScreen.tsx
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
import { AppFooter } from '../components/common';
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
import {
  getAccuracyColor,
  getStreakColor,
  getGridDifficulty,
  formatDate,
} from '../utils/formatters';

type RootStackParamList = { Stats: undefined; Home: undefined; Profile: undefined };
type StatsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'detailed', label: 'Detailed', icon: '📈' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
  ];

  useEffect(() => {
    loadStats();
    loadAchievements();
  }, [profile]);

  const loadStats = () => {
    if (!profile) return;

    const p = profile.stats;
    setStats({
      puzzlesCompleted: p.puzzlesSolved ?? 0,
      bestTimes: {},
      dailyScore: 0,
      weeklyScore: 0,
      accuracy: p.accuracy ?? 0,
      totalPlayTime: 0,
      currentStreak: p.currentStreak ?? 0,
      longestStreak: 0,
      averageTime: {},
      lastPlayed: p.lastPlayDate ?? formatDate(new Date()),
      totalPlayDays: p.totalPlayDays ?? 0,
      weekendPuzzles: p.weekendPuzzles ?? 0,
    });

    setLoading(false);
  };

  const loadAchievements = () => {
    if (!profile?.trophies) {
      setAchievements([]);
      return;
    }

    const mappedAchievements: Achievement[] = profile.trophies.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      icon: t.icon,
      unlocked: t.unlocked,
      unlockedDate: t.unlockDate ? formatDate(new Date(t.unlockDate)) : undefined,
      progress: 0,
      maxProgress: 1,
    }));

    setAchievements(mappedAchievements);
  };

  const handleRefresh = () => {
    setLoading(true);
    loadStats();
    loadAchievements();
  };

  const handleNewPuzzle = () => {
    navigation.navigate('Home');
  };

  if (loading || !stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading your stats...</Text>
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              {profile?.name ? `${profile.name}'s Stats` : 'Your Stats'}
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={[styles.refreshButtonText, { color: colors.text }]}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
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
                showPercentage
              />
              <ProgressBar
                label="Weekly Challenge Score"
                current={stats.weeklyScore}
                total={500}
                fillColor="#9C27B0"
                textColor={colors.text}
                showPercentage
              />
            </StatSection>

            <StatSection title="Activity Summary" textColor={colors.text}>
              <View style={[styles.summaryCard, { backgroundColor: colors.button }]}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{stats.totalPlayDays}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.text }]}>Days Played</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{stats.weekendPuzzles}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.text }]}>Weekend Puzzles</Text>
                  </View>
                </View>
                <TimeDisplay minutes={stats.totalPlayTime} label="Total Play Time" textColor={colors.text} compact />
                <Text style={[styles.lastPlayed, { color: colors.text }]}>Last played: {stats.lastPlayed}</Text>
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
          </>
        )}

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <StatSection title={`Achievements (${unlockedAchievements}/${totalAchievements})`} textColor={colors.text}>
            {achievements.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.button }]}>
                <Text style={[styles.emptyStateText, { color: colors.text }]}>
                  No achievements yet. Play more puzzles to earn achievements!
                </Text>
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
        )}

        <TouchableOpacity style={[styles.playNowButton, { backgroundColor: '#4CAF50' }]} onPress={handleNewPuzzle}>
          <Text style={styles.playNowText}>🎮 Play Now</Text>
        </TouchableOpacity>

        <AppFooter textColor={colors.text} version="1.0.0" />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorText: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, minWidth: 120, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#DDD' },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 24, fontWeight: 'bold' },
  headerCenter: { alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14, opacity: 0.8, marginTop: 2 },
  refreshButton: { padding: 8 },
  refreshButtonText: { fontSize: 20 },
  summaryCard: { borderRadius: 12, padding: 16, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  summaryLabel: { fontSize: 14, opacity: 0.8 },
  lastPlayed: { fontSize: 14, opacity: 0.8, marginTop: 12, textAlign: 'center', fontStyle: 'italic' },
  emptyState: { borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyStateText: { fontSize: 16, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  playNowButton: { marginHorizontal: 20, marginTop: 20, marginBottom: 30, paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  playNowText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default StatsScreen;



