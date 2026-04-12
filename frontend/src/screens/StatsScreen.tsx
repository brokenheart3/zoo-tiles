// src/screens/StatsScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  ScrollView,
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
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
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
  const { profile, registerStatsRefresh, refreshProfile } = useProfile();
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

  // Direct Firebase fetch to ensure we have the latest data
  const fetchStatsDirectlyFromFirebase = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const statsData = data.stats || {};
        
        console.log('🔥 Direct Firebase fetch - Position Stats:', {
          firstPlaceWins: statsData.firstPlaceWins,
          secondPlaceWins: statsData.secondPlaceWins,
          thirdPlaceWins: statsData.thirdPlaceWins,
          dailyFirstPlace: statsData.dailyFirstPlace,
          dailySecondPlace: statsData.dailySecondPlace,
          dailyThirdPlace: statsData.dailyThirdPlace,
          weeklyFirstPlace: statsData.weeklyFirstPlace,
          weeklySecondPlace: statsData.weeklySecondPlace,
          weeklyThirdPlace: statsData.weeklyThirdPlace,
        });
        
        return statsData;
      }
    } catch (error) {
      console.error('Error fetching from Firebase directly:', error);
    }
    return null;
  };

  const loadStats = async () => {
    // First try to get direct Firebase data for position stats
    const firebaseStats = await fetchStatsDirectlyFromFirebase();
    
    if (!profile && !firebaseStats) {
      console.log('❌ StatsScreen - No profile or Firebase data found');
      return;
    }

    // Use profile stats as base, but override with direct Firebase data for position stats
    const p = profile?.stats as any || {};
    const fb = firebaseStats || {};
    
    console.log('📊 StatsScreen - Loading stats from:', {
      fromProfile: {
        firstPlaceWins: p.firstPlaceWins,
        dailyFirstPlace: p.dailyFirstPlace,
        weeklyFirstPlace: p.weeklyFirstPlace,
      },
      fromFirebase: {
        firstPlaceWins: fb.firstPlaceWins,
        dailyFirstPlace: fb.dailyFirstPlace,
        weeklyFirstPlace: fb.weeklyFirstPlace,
      }
    });
    
    // Use Firebase data for position stats (more reliable), fallback to profile
    const firstPlaceWins = fb.firstPlaceWins ?? p.firstPlaceWins ?? 0;
    const secondPlaceWins = fb.secondPlaceWins ?? p.secondPlaceWins ?? 0;
    const thirdPlaceWins = fb.thirdPlaceWins ?? p.thirdPlaceWins ?? 0;
    const dailyFirstPlace = fb.dailyFirstPlace ?? p.dailyFirstPlace ?? 0;
    const dailySecondPlace = fb.dailySecondPlace ?? p.dailySecondPlace ?? 0;
    const dailyThirdPlace = fb.dailyThirdPlace ?? p.dailyThirdPlace ?? 0;
    const weeklyFirstPlace = fb.weeklyFirstPlace ?? p.weeklyFirstPlace ?? 0;
    const weeklySecondPlace = fb.weeklySecondPlace ?? p.weeklySecondPlace ?? 0;
    const weeklyThirdPlace = fb.weeklyThirdPlace ?? p.weeklyThirdPlace ?? 0;
    
    console.log('📊 Final position stats being set:', {
      firstPlaceWins,
      secondPlaceWins,
      thirdPlaceWins,
      dailyFirstPlace,
      weeklyFirstPlace,
    });
    
    const dailyScore = Math.min((p.dailyChallengesCompleted || 0) * 10, 100);
    const weeklyScore = Math.min((p.weeklyChallengesCompleted || 0) * 50, 500);
    const longestStreak = p.longestStreak || p.currentStreak || 0;
    const totalPlayTime = p.totalPlayTime || 0;
    
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
      
      // Position stats from Firebase
      firstPlaceWins,
      secondPlaceWins,
      thirdPlaceWins,
      dailyFirstPlace,
      dailySecondPlace,
      dailyThirdPlace,
      weeklyFirstPlace,
      weeklySecondPlace,
      weeklyThirdPlace,
    });

    setLoading(false);
  };

  const loadAchievements = () => {
    if (!profile?.trophies) {
      setAchievements([]);
      return;
    }

    const statsData = stats || profile.stats as any;

    const mappedAchievements: Achievement[] = profile.trophies.map(t => {
      let progress = 0;
      let maxProgress = t.requirement.value;
      
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
        const reqType = t.requirement.type as string;
        
        if (reqType === 'puzzles_completed') {
          progress = statsData.puzzlesCompleted || statsData.puzzlesSolved || 0;
        } else if (reqType === 'daily_challenges') {
          progress = statsData.dailyChallengesCompleted || 0;
        } else if (reqType === 'weekly_challenges') {
          progress = statsData.weeklyChallengesCompleted || 0;
        } else if (reqType === 'accuracy') {
          progress = statsData.accuracy || 0;
        } else if (reqType === 'streak' || reqType === 'current_streak') {
          progress = statsData.currentStreak || 0;
        } else if (reqType === 'longest_streak') {
          progress = statsData.longestStreak || statsData.currentStreak || 0;
        } else if (reqType === 'perfect_games') {
          progress = statsData.perfectGames || 0;
        } else if (reqType === 'daily_play') {
          progress = statsData.totalPlayDays || 0;
        } else if (reqType === 'weekend_play') {
          progress = statsData.weekendPuzzles || 0;
        } else if (reqType === 'total_play_time') {
          progress = statsData.totalPlayTime || 0;
        } else if (reqType === 'total_moves') {
          progress = statsData.totalMoves || 0;
        } else if (reqType === 'first_place') {
          progress = statsData.firstPlaceWins || 0;
        } else if (reqType === 'second_place') {
          progress = statsData.secondPlaceWins || 0;
        } else if (reqType === 'third_place') {
          progress = statsData.thirdPlaceWins || 0;
        } else if (reqType === 'daily_first_place') {
          progress = statsData.dailyFirstPlace || 0;
        } else if (reqType === 'weekly_first_place') {
          progress = statsData.weeklyFirstPlace || 0;
        } else if (reqType === 'speed_demon' || reqType === 'speed_legend') {
          progress = statsData.bestTime <= t.requirement.value ? 1 : 0;
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

  const handleRefresh = async () => {
    setLoading(true);
    await refreshProfile();
    await loadStats();
    loadAchievements();
    setRefreshKey(prev => prev + 1);
  };

  const handleNewPuzzle = () => {
    navigation.navigate('Home');
  };

  // Debug function to check Firebase data directly
  const checkFirebaseData = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Debug', 'No user logged in');
      return;
    }
    
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const statsData = data.stats || {};
        
        Alert.alert(
          'Firebase Stats Data',
          `🏆 Overall Podium:\n` +
          `🥇 1st: ${statsData.firstPlaceWins || 0}\n` +
          `🥈 2nd: ${statsData.secondPlaceWins || 0}\n` +
          `🥉 3rd: ${statsData.thirdPlaceWins || 0}\n\n` +
          `📅 Daily Challenge:\n` +
          `🥇 1st: ${statsData.dailyFirstPlace || 0}\n` +
          `🥈 2nd: ${statsData.dailySecondPlace || 0}\n` +
          `🥉 3rd: ${statsData.dailyThirdPlace || 0}\n\n` +
          `📆 Weekly Challenge:\n` +
          `🥇 1st: ${statsData.weeklyFirstPlace || 0}\n` +
          `🥈 2nd: ${statsData.weeklySecondPlace || 0}\n` +
          `🥉 3rd: ${statsData.weeklyThirdPlace || 0}\n\n` +
          `📈 Other Stats:\n` +
          `Puzzles Solved: ${statsData.puzzlesSolved || 0}\n` +
          `Daily Completed: ${statsData.dailyChallengesCompleted || 0}\n` +
          `Weekly Completed: ${statsData.weeklyChallengesCompleted || 0}`
        );
      } else {
        Alert.alert('Debug', 'No user document found');
      }
    } catch (error) {
      console.error('Error checking Firebase:', error);
      Alert.alert('Error', 'Failed to read from Firebase');
    }
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

  // Calculate podium percentages for bar heights
  const totalWins = stats.firstPlaceWins + stats.secondPlaceWins + stats.thirdPlaceWins;
  const firstPlacePercent = totalWins > 0 ? (stats.firstPlaceWins / totalWins) * 100 : 0;
  const secondPlacePercent = totalWins > 0 ? (stats.secondPlaceWins / totalWins) * 100 : 0;
  const thirdPlacePercent = totalWins > 0 ? (stats.thirdPlaceWins / totalWins) * 100 : 0;
  
  // Determine if user has any podium finishes
  const hasPodiumFinishes = totalWins > 0;

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
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.firebaseButton} onPress={checkFirebaseData}>
              <Text style={{ color: colors.text, fontSize: 14 }}>🔥</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={[styles.refreshButtonText, { color: colors.text }]}>🔄</Text>
            </TouchableOpacity>
          </View>
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
                {!hasPodiumFinishes ? (
                  // Empty state when no podium finishes yet
                  <View style={styles.emptyPodiumContainer}>
                    <Text style={[styles.emptyPodiumEmoji, { color: colors.text }]}>🏆</Text>
                    <Text style={[styles.emptyPodiumTitle, { color: colors.text }]}>No Podium Finishes Yet</Text>
                    <Text style={[styles.emptyPodiumText, { color: colors.text, opacity: 0.7 }]}>
                      Complete daily or weekly challenges and rank in the top 3 to see your achievements here!
                    </Text>
                    <TouchableOpacity 
                      style={[styles.playNowSmallButton, { backgroundColor: '#4CAF50' }]}
                      onPress={handleNewPuzzle}
                    >
                      <Text style={styles.playNowSmallText}>Play Now</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {/* Main Podium Display */}
                    <View style={styles.podiumContainer}>
                      <View style={styles.podiumRow}>
                        {/* 2nd Place */}
                        <View style={[styles.podiumItem, styles.podiumSecond]}>
                          <Text style={styles.podiumEmoji}>🥈</Text>
                          <Text style={[styles.podiumNumber, { color: colors.text }]}>{stats.secondPlaceWins}</Text>
                          <Text style={[styles.podiumLabel, { color: colors.text }]}>2nd Place</Text>
                          <View style={[styles.podiumBar, { height: Math.min(80, secondPlacePercent / 2), backgroundColor: '#C0C0C0' }]} />
                        </View>
                        
                        {/* 1st Place (Highlighted) */}
                        <View style={[styles.podiumItem, styles.podiumFirst]}>
                          <Text style={styles.podiumEmoji}>🥇</Text>
                          <Text style={[styles.podiumNumber, { color: colors.text, fontSize: 32, fontWeight: 'bold' }]}>{stats.firstPlaceWins}</Text>
                          <Text style={[styles.podiumLabel, { color: colors.text, fontWeight: 'bold' }]}>1st Place</Text>
                          <View style={[styles.podiumBar, { height: Math.min(120, firstPlacePercent), backgroundColor: '#FFD700' }]} />
                        </View>
                        
                        {/* 3rd Place */}
                        <View style={[styles.podiumItem, styles.podiumThird]}>
                          <Text style={styles.podiumEmoji}>🥉</Text>
                          <Text style={[styles.podiumNumber, { color: colors.text }]}>{stats.thirdPlaceWins}</Text>
                          <Text style={[styles.podiumLabel, { color: colors.text }]}>3rd Place</Text>
                          <View style={[styles.podiumBar, { height: Math.min(60, thirdPlacePercent / 2), backgroundColor: '#CD7F32' }]} />
                        </View>
                      </View>
                    </View>

                    {/* Total Wins Badge */}
                    <View style={styles.totalWinsBadge}>
                      <Text style={styles.totalWinsEmoji}>🏆</Text>
                      <Text style={[styles.totalWinsText, { color: colors.text }]}>
                        Total Podium Finishes: {totalWins}
                      </Text>
                    </View>

                    {/* Separator */}
                    <View style={styles.positionDivider} />

                    {/* Detailed Breakdown by Challenge Type */}
                    <Text style={[styles.breakdownTitle, { color: colors.text }]}>Breakdown by Challenge</Text>
                    
                    <View style={styles.challengeBreakdown}>
                      {/* Daily Challenge Positions */}
                      <View style={styles.breakdownColumn}>
                        <Text style={[styles.breakdownHeader, { color: colors.text }]}>📅 Daily</Text>
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownEmoji}>🥇</Text>
                          <Text style={[styles.breakdownValue, { color: colors.text }]}>{stats.dailyFirstPlace}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownEmoji}>🥈</Text>
                          <Text style={[styles.breakdownValue, { color: colors.text }]}>{stats.dailySecondPlace}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownEmoji}>🥉</Text>
                          <Text style={[styles.breakdownValue, { color: colors.text }]}>{stats.dailyThirdPlace}</Text>
                        </View>
                      </View>

                      {/* Weekly Challenge Positions */}
                      <View style={styles.breakdownColumn}>
                        <Text style={[styles.breakdownHeader, { color: colors.text }]}>📆 Weekly</Text>
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownEmoji}>🥇</Text>
                          <Text style={[styles.breakdownValue, { color: colors.text }]}>{stats.weeklyFirstPlace}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownEmoji}>🥈</Text>
                          <Text style={[styles.breakdownValue, { color: colors.text }]}>{stats.weeklySecondPlace}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownEmoji}>🥉</Text>
                          <Text style={[styles.breakdownValue, { color: colors.text }]}>{stats.weeklyThirdPlace}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Achievement Progress Tips */}
                    {stats.firstPlaceWins < 5 && stats.firstPlaceWins > 0 && (
                      <View style={styles.tipContainer}>
                        <Text style={[styles.tipText, { color: colors.text, opacity: 0.7 }]}>
                          💡 Tip: Complete {5 - stats.firstPlaceWins} more 1st place finishes to unlock the "Rising Champion" achievement!
                        </Text>
                      </View>
                    )}
                  </>
                )}
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  firebaseButton: {
    padding: 8,
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
  emptyPodiumContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyPodiumEmoji: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyPodiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyPodiumText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  playNowSmallButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  playNowSmallText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  podiumContainer: {
    marginBottom: 16,
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 16,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumFirst: {
    transform: [{ scale: 1.05 }],
  },
  podiumSecond: {
    opacity: 0.9,
  },
  podiumThird: {
    opacity: 0.85,
  },
  podiumEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  podiumNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  podiumLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
  podiumBar: {
    width: 40,
    borderRadius: 8,
    marginTop: 4,
  },
  totalWinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  totalWinsEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  totalWinsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  positionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  challengeBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  breakdownColumn: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    opacity: 0.9,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  breakdownEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tipText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
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