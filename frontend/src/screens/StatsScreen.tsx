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
  StreakDisplay,
  AchievementCard,
  StatSection,
  StatTabs,
  StatsGrid,
} from '../components/stats';
import {
  getAccuracyColor,
  getStreakColor,
  formatDate,
  formatTime,
} from '../utils/formatters';

type RootStackParamList = { Stats: undefined; Home: undefined; Profile: undefined };
type StatsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ExtendedStats {
  puzzlesCompleted: number;
  dailyChallengesCompleted: number;
  weeklyChallengesCompleted: number;
  dailyScore: number;
  weeklyScore: number;
  accuracy: number;
  totalPlayTime: number;
  currentStreak: number;
  longestStreak: number;
  averageTime: number;
  bestTime: number;
  lastPlayed: string;
  totalPlayDays: number;
  weekendPuzzles: number;
  perfectGames: number;
  totalMoves: number;
  totalCorrectMoves: number;
  totalWrongMoves: number;
  
  // Position tracking stats
  firstPlaceWins: number;
  secondPlaceWins: number;
  thirdPlaceWins: number;
  dailyFirstPlace: number;
  dailySecondPlace: number;
  dailyThirdPlace: number;
  weeklyFirstPlace: number;
  weeklySecondPlace: number;
  weeklyThirdPlace: number;
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
  category?: 'common' | 'rare' | 'epic' | 'legendary' | 'position';
}

const StatsScreen = () => {
  const navigation = useNavigation<StatsScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { profile, registerStatsRefresh } = useProfile();
  const colors = themeStyles[theme];

  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedAchievementTab, setSelectedAchievementTab] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'detailed', label: 'Detailed', icon: '📈' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
  ];

  const achievementTabs = [
    { id: 'all', label: 'All', icon: '🏆' },
    { id: 'position', label: 'Top Finishes', icon: '🥇' },
    { id: 'common', label: 'Common', icon: '🔰' },
    { id: 'rare', label: 'Rare', icon: '🔵' },
    { id: 'epic', label: 'Epic', icon: '🟣' },
    { id: 'legendary', label: 'Legendary', icon: '👑' },
  ];

  useEffect(() => {
    console.log('📊 StatsScreen mounted, registering for refresh');
    registerStatsRefresh(() => {
      console.log('📊 StatsScreen refresh callback triggered');
      loadStats();
      loadAchievements();
    });
  }, []);

  useEffect(() => {
    console.log('📊 StatsScreen - profile or refreshKey changed');
    loadStats();
    loadAchievements();
  }, [profile, refreshKey]);

  const formatPlayTime = (totalMinutes: number): string => {
    if (!totalMinutes || totalMinutes === 0) return '0 min';
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    if (hours === 0) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const loadStats = () => {
    if (!profile) {
      console.log('❌ StatsScreen - No profile found');
      return;
    }

    // Cast profile.stats to any to access new fields
    const p = profile.stats as any;
    
    console.log('📊 StatsScreen - Loading stats:', p);
    
    const dailyScore = Math.min((p.dailyChallengesCompleted || 0) * 10, 100);
    const weeklyScore = Math.min((p.weeklyChallengesCompleted || 0) * 50, 500);
    const longestStreak = p.longestStreak || p.currentStreak || 0;
    const totalPlayTime = p.totalPlayTime || 0;
    const bestTimeFormatted = p.bestTime === Infinity ? '--:--' : formatTime(p.bestTime || 0);
    
    setStats({
      puzzlesCompleted: p.puzzlesSolved ?? 0,
      dailyChallengesCompleted: p.dailyChallengesCompleted ?? 0,
      weeklyChallengesCompleted: p.weeklyChallengesCompleted ?? 0,
      dailyScore,
      weeklyScore,
      accuracy: p.accuracy ?? 0,
      totalPlayTime,
      currentStreak: p.currentStreak ?? 0,
      longestStreak,
      averageTime: p.averageTime || 0,
      bestTime: p.bestTime || 0,
      lastPlayed: p.lastPlayDate ? formatDate(new Date(p.lastPlayDate)) : formatDate(new Date()),
      totalPlayDays: p.totalPlayDays ?? 0,
      weekendPuzzles: p.weekendPuzzles ?? 0,
      perfectGames: p.perfectGames ?? 0,
      totalMoves: p.totalMoves ?? 0,
      totalCorrectMoves: p.totalCorrectMoves ?? 0,
      totalWrongMoves: p.totalWrongMoves ?? 0,
      
      // Position stats - accessed via 'as any'
      firstPlaceWins: p.firstPlaceWins ?? 0,
      secondPlaceWins: p.secondPlaceWins ?? 0,
      thirdPlaceWins: p.thirdPlaceWins ?? 0,
      dailyFirstPlace: p.dailyFirstPlace ?? 0,
      dailySecondPlace: p.dailySecondPlace ?? 0,
      dailyThirdPlace: p.dailyThirdPlace ?? 0,
      weeklyFirstPlace: p.weeklyFirstPlace ?? 0,
      weeklySecondPlace: p.weeklySecondPlace ?? 0,
      weeklyThirdPlace: p.weeklyThirdPlace ?? 0,
    });

    setLoading(false);
  };

  const loadAchievements = () => {
    if (!profile?.trophies) {
      setAchievements([]);
      return;
    }

    const stats = profile.stats as any;

    const mappedAchievements: Achievement[] = profile.trophies.map(t => {
      let progress = 0;
      let maxProgress = t.requirement.value;
      
      // Determine category based on trophy ID
      let category: 'common' | 'rare' | 'epic' | 'legendary' | 'position' = 'common';
      
      if (t.id.includes('first_place') || 
          t.id.includes('second_place') || 
          t.id.includes('third_place') ||
          t.id.includes('daily_first') ||
          t.id.includes('weekly_first')) {
        category = 'position';
      }

      if (t.unlocked) {
        progress = maxProgress;
      } else {
        // Get the requirement type as string
        const reqType = t.requirement.type as string;
        
        // Handle each requirement type
        if (reqType === 'puzzles_completed') {
          progress = stats.puzzlesSolved || 0;
        } else if (reqType === 'daily_challenges') {
          progress = stats.dailyChallengesCompleted || 0;
        } else if (reqType === 'weekly_challenges') {
          progress = stats.weeklyChallengesCompleted || 0;
        } else if (reqType === 'accuracy') {
          progress = stats.accuracy || 0;
        } else if (reqType === 'streak' || reqType === 'current_streak') {
          progress = stats.currentStreak || 0;
        } else if (reqType === 'longest_streak') {
          progress = stats.longestStreak || stats.currentStreak || 0;
        } else if (reqType === 'perfect_games') {
          progress = stats.perfectGames || 0;
        } else if (reqType === 'daily_play') {
          progress = stats.totalPlayDays || 0;
        } else if (reqType === 'weekend_play') {
          progress = stats.weekendPuzzles || 0;
        } else if (reqType === 'total_play_time') {
          progress = stats.totalPlayTime || 0;
        } else if (reqType === 'total_moves') {
          progress = stats.totalMoves || 0;
        } else if (reqType === 'first_place') {
          progress = stats.firstPlaceWins || 0;
        } else if (reqType === 'second_place') {
          progress = stats.secondPlaceWins || 0;
        } else if (reqType === 'third_place') {
          progress = stats.thirdPlaceWins || 0;
        } else if (reqType === 'daily_first_place') {
          progress = stats.dailyFirstPlace || 0;
        } else if (reqType === 'weekly_first_place') {
          progress = stats.weeklyFirstPlace || 0;
        } else if (reqType === 'speed_demon' || reqType === 'speed_legend') {
          progress = stats.bestTime <= t.requirement.value ? 1 : 0;
        }
      }

      return {
        id: t.id,
        name: t.name,
        description: t.description,
        icon: t.icon,
        unlocked: t.unlocked,
        unlockedDate: t.unlockDate ? formatDate(new Date(t.unlockDate)) : undefined,
        progress: Math.min(progress, maxProgress),
        maxProgress,
        category,
      };
    });

    mappedAchievements.sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return (b.progress || 0) - (a.progress || 0);
    });

    setAchievements(mappedAchievements);
  };

  const filterAchievements = () => {
    if (selectedAchievementTab === 'all') {
      return achievements;
    }
    return achievements.filter(a => a.category === selectedAchievementTab);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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
  const filteredAchievements = filterAchievements();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
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
        <View style={styles.tabContainer}>
          <StatTabs
            tabs={tabs}
            activeTab={selectedTab}
            onTabChange={setSelectedTab}
            backgroundColor={colors.button + '30'}
            activeBackgroundColor={colors.button}
            textColor={colors.text + 'CC'}
            activeTextColor={colors.text}
          />
        </View>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <View style={styles.contentContainer}>
            <StatSection title="Quick Stats" textColor={colors.text}>
              <StatsGrid columns={2}>
                <QuickStatCard
                  value={stats.puzzlesCompleted}
                  label="Puzzles Solved"
                  icon="🧩"
                  backgroundColor={colors.button}
                  textColor={colors.text}
                />
                <QuickStatCard
                  value={`${stats.accuracy.toFixed(1)}%`}
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
                  value={stats.perfectGames}
                  label="Perfect Games"
                  icon="✨"
                  backgroundColor={colors.button}
                  textColor={colors.text}
                />
                <QuickStatCard
                  value={stats.dailyChallengesCompleted}
                  label="Daily Challenges"
                  icon="📅"
                  backgroundColor={colors.button}
                  textColor={colors.text}
                />
                <QuickStatCard
                  value={stats.weeklyChallengesCompleted}
                  label="Weekly Challenges"
                  icon="📆"
                  backgroundColor={colors.button}
                  textColor={colors.text}
                />
                <QuickStatCard
                  value={stats.weekendPuzzles}
                  label="Weekend Puzzles"
                  icon="🌅"
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

            {/* Top Finishes Section */}
            <StatSection title="🥇 Top Finishes" textColor={colors.text}>
              <View style={[styles.positionContainer, { backgroundColor: colors.button }]}>
                <View style={styles.positionRow}>
                  <View style={styles.positionItem}>
                    <Text style={styles.positionEmoji}>🥇</Text>
                    <Text style={[styles.positionNumber, { color: colors.text }]}>{stats.firstPlaceWins}</Text>
                    <Text style={[styles.positionLabel, { color: colors.text }]}>1st Place</Text>
                  </View>
                  <View style={styles.positionItem}>
                    <Text style={styles.positionEmoji}>🥈</Text>
                    <Text style={[styles.positionNumber, { color: colors.text }]}>{stats.secondPlaceWins}</Text>
                    <Text style={[styles.positionLabel, { color: colors.text }]}>2nd Place</Text>
                  </View>
                  <View style={styles.positionItem}>
                    <Text style={styles.positionEmoji}>🥉</Text>
                    <Text style={[styles.positionNumber, { color: colors.text }]}>{stats.thirdPlaceWins}</Text>
                    <Text style={[styles.positionLabel, { color: colors.text }]}>3rd Place</Text>
                  </View>
                </View>
                <View style={styles.positionDivider} />
                <View style={styles.challengePositionRow}>
                  <View style={styles.challengePositionItem}>
                    <Text style={[styles.challengePositionLabel, { color: colors.text }]}>Daily 1st:</Text>
                    <Text style={[styles.challengePositionValue, { color: colors.text }]}>{stats.dailyFirstPlace}</Text>
                  </View>
                  <View style={styles.challengePositionItem}>
                    <Text style={[styles.challengePositionLabel, { color: colors.text }]}>Weekly 1st:</Text>
                    <Text style={[styles.challengePositionValue, { color: colors.text }]}>{stats.weeklyFirstPlace}</Text>
                  </View>
                </View>
              </View>
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

            {/* Activity Summary */}
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

                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{stats.totalMoves}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.text }]}>Total Moves</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {stats.totalMoves > 0 
                        ? ((stats.totalCorrectMoves / stats.totalMoves) * 100).toFixed(1) 
                        : 0}%
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.text }]}>Success Rate</Text>
                  </View>
                </View>
                
                <View style={styles.timeDisplayContainer}>
                  <Text style={[styles.timeLabel, { color: colors.text }]}>Total Play Time:</Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>
                    {formatPlayTime(stats.totalPlayTime)}
                  </Text>
                </View>
                
                <Text style={[styles.lastPlayed, { color: colors.text }]}>Last played: {stats.lastPlayed}</Text>
              </View>
            </StatSection>
          </View>
        )}

        {/* Detailed Tab */}
        {selectedTab === 'detailed' && (
          <View style={styles.contentContainer}>
            <StatSection title="Time Statistics" textColor={colors.text}>
              <View style={[styles.detailedCard, { backgroundColor: colors.button }]}>
                <View style={styles.detailedRow}>
                  <Text style={[styles.detailedLabel, { color: colors.text }]}>Best Time:</Text>
                  <Text style={[styles.detailedValue, { color: colors.text }]}>
                    {stats.bestTime === Infinity ? '--:--' : formatTime(stats.bestTime)}
                  </Text>
                </View>
                <View style={styles.detailedRow}>
                  <Text style={[styles.detailedLabel, { color: colors.text }]}>Average Time:</Text>
                  <Text style={[styles.detailedValue, { color: colors.text }]}>
                    {formatTime(stats.averageTime)}
                  </Text>
                </View>
              </View>
            </StatSection>

            <StatSection title="Move Statistics" textColor={colors.text}>
              <View style={[styles.detailedCard, { backgroundColor: colors.button }]}>
                <View style={styles.detailedRow}>
                  <Text style={[styles.detailedLabel, { color: colors.text }]}>Total Moves:</Text>
                  <Text style={[styles.detailedValue, { color: colors.text }]}>{stats.totalMoves}</Text>
                </View>
                <View style={styles.detailedRow}>
                  <Text style={[styles.detailedLabel, { color: colors.text }]}>Correct Moves:</Text>
                  <Text style={[styles.detailedValue, { color: '#4CAF50' }]}>{stats.totalCorrectMoves}</Text>
                </View>
                <View style={styles.detailedRow}>
                  <Text style={[styles.detailedLabel, { color: colors.text }]}>Wrong Moves:</Text>
                  <Text style={[styles.detailedValue, { color: '#f44336' }]}>{stats.totalWrongMoves}</Text>
                </View>
              </View>
            </StatSection>

            <StatSection title="Streak Performance" textColor={colors.text}>
              <StreakDisplay
                currentStreak={stats.currentStreak}
                longestStreak={stats.longestStreak}
                backgroundColor={colors.button}
                textColor={colors.text}
              />
            </StatSection>

            {/* Position Stats in Detailed Tab */}
            <StatSection title="🏆 Position Statistics" textColor={colors.text}>
              <View style={[styles.detailedCard, { backgroundColor: colors.button }]}>
                <View style={styles.detailedRow}>
                  <Text style={[styles.detailedLabel, { color: colors.text }]}>First Place Wins:</Text>
                  <Text style={[styles.detailedValue, { color: '#FFD700' }]}>{stats.firstPlaceWins}</Text>
                </View>
                <View style={styles.detailedRow}>
                  <Text style={[styles.detailedLabel, { color: colors.text }]}>Second Place Wins:</Text>
                  <Text style={[styles.detailedValue, { color: '#C0C0C0' }]}>{stats.secondPlaceWins}</Text>
                </View>
                <View style={styles.detailedRow}>
                  <Text style={[styles.detailedLabel, { color: colors.text }]}>Third Place Wins:</Text>
                  <Text style={[styles.detailedValue, { color: '#CD7F32' }]}>{stats.thirdPlaceWins}</Text>
                </View>
                <View style={styles.detailedRow}>
                  <Text style={[styles.detailedLabel, { color: colors.text }]}>Daily Challenge 1st:</Text>
                  <Text style={[styles.detailedValue, { color: '#FFD700' }]}>{stats.dailyFirstPlace}</Text>
                </View>
                <View style={styles.detailedRow}>
                  <Text style={[styles.detailedLabel, { color: colors.text }]}>Weekly Challenge 1st:</Text>
                  <Text style={[styles.detailedValue, { color: '#FFD700' }]}>{stats.weeklyFirstPlace}</Text>
                </View>
              </View>
            </StatSection>
          </View>
        )}

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <View style={styles.contentContainer}>
            <StatSection title={`Achievements (${unlockedAchievements}/${totalAchievements})`} textColor={colors.text}>
              
              {/* Achievement Category Tabs */}
              <View style={styles.achievementTabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {achievementTabs.map((tab) => (
                    <TouchableOpacity
                      key={tab.id}
                      style={[
                        styles.achievementTab,
                        { backgroundColor: colors.button + '30' },
                        selectedAchievementTab === tab.id && { backgroundColor: colors.button }
                      ]}
                      onPress={() => setSelectedAchievementTab(tab.id)}
                    >
                      <Text style={[
                        styles.achievementTabText,
                        { color: colors.text },
                        selectedAchievementTab === tab.id && { fontWeight: 'bold' }
                      ]}>
                        {tab.icon} {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Achievements List */}
              {filteredAchievements.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: colors.button }]}>
                  <Text style={[styles.emptyStateText, { color: colors.text }]}>
                    No achievements in this category yet.
                  </Text>
                </View>
              ) : (
                filteredAchievements.map((achievement) => (
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
          </View>
        )}

        <View style={styles.playNowContainer}>
          <TouchableOpacity style={[styles.playNowButton, { backgroundColor: '#4CAF50' }]} onPress={handleNewPuzzle}>
            <Text style={styles.playNowText}>🎮 Play Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <AppFooter textColor={colors.text} version="1.0.0" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
  },
  backButton: { 
    padding: 8 
  },
  backButtonText: { 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  headerCenter: { 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  subtitle: { 
    fontSize: 14, 
    opacity: 0.8, 
    marginTop: 2 
  },
  refreshButton: { 
    padding: 8 
  },
  refreshButtonText: { 
    fontSize: 20 
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  // Position styles
  positionContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  positionItem: {
    alignItems: 'center',
  },
  positionEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  positionNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  positionLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  positionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12,
  },
  challengePositionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  challengePositionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengePositionLabel: {
    fontSize: 14,
    marginRight: 6,
    opacity: 0.8,
  },
  challengePositionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Achievement tab styles
  achievementTabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  achievementTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  achievementTabText: {
    fontSize: 14,
  },
  timeDisplayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  timeLabel: {
    fontSize: 16,
    opacity: 0.8,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryCard: { 
    borderRadius: 12, 
    padding: 16, 
    marginTop: 8 
  },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 16 
  },
  summaryItem: { 
    alignItems: 'center' 
  },
  summaryValue: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  summaryLabel: { 
    fontSize: 14, 
    opacity: 0.8 
  },
  lastPlayed: { 
    fontSize: 14, 
    opacity: 0.8, 
    marginTop: 12, 
    textAlign: 'center', 
    fontStyle: 'italic' 
  },
  emptyState: { 
    borderRadius: 12, 
    padding: 24, 
    alignItems: 'center' 
  },
  emptyStateText: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 20, 
    lineHeight: 22 
  },
  playNowContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  playNowButton: { 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 8 
  },
  playNowText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  footerContainer: {
    paddingHorizontal: 20,
  },
  detailedCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  detailedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  detailedLabel: {
    fontSize: 16,
    opacity: 0.8,
  },
  detailedValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StatsScreen;