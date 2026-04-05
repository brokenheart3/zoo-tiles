// src/screens/DailyChallengeScreen.tsx
import React, { useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeContext, themeStyles } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { useProfile } from "../context/ProfileContext";
import { useGameMode } from "../context/GameModeContext";
import { getChallengePlayerCount } from "../services/simpleChallengeService";
import { getUserChallengeResult, getPlayerRank } from "../services/userService";
import { challengeService } from "../services/challengeService";
import { 
  getTimeRemaining, 
  getUTCDateString,
  isDailyChallengeActive,
  formatTime,
  getDayName as getDayNameFromUtils,
} from "../utils/timeUtils";
import { auth } from "../services/firebase";
import AppFooter from "../components/common/AppFooter";
import ChallengeLeaderboard from "../components/challenges/ChallengeLeaderboard";

type RootStackParamList = {
  Play: {
    gridSize: string;
    difficulty: 'Expert';
    challengeType: 'daily';
    challengeId?: string;
    startTime?: number;
    key?: string;
  };
  Home: undefined;
  ChallengeResults: {
    challengeId: string;
    challengeType: 'daily';
    time?: number;
    isPerfect?: boolean;
    moves?: number;
    correctMoves?: number;
    wrongMoves?: number;
    accuracy?: number;
    completed?: boolean;
    completedAt?: string;
  };
};

type DailyChallengeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Play'>;

const getPreviousDayName = (daysAgo: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return getDayNameFromUtils(date);
};

const getPreviousUTCDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRankDisplay = (rank: number | null): string => {
  if (!rank) return '—';
  if (rank === 1) return '🥇 1st';
  if (rank === 2) return '🥈 2nd';
  if (rank === 3) return '🥉 3rd';
  if (rank % 10 === 1 && rank % 100 !== 11) return `${rank}st`;
  if (rank % 10 === 2 && rank % 100 !== 12) return `${rank}nd`;
  if (rank % 10 === 3 && rank % 100 !== 13) return `${rank}rd`;
  return `${rank}th`;
};

const formatUTCDateTime = (): string => {
  const now = new Date();
  return now.toUTCString();
};

const formatLocalDateTime = (): string => {
  const now = new Date();
  return now.toLocaleString();
};

const DailyChallengeScreen = () => {
  const navigation = useNavigation<DailyChallengeScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { settings } = useSettings();
  const { profile } = useProfile();
  const { dailyCompletion, refreshChallengeStatus } = useGameMode();
  
  const colors = themeStyles[theme];
  
  const [loading, setLoading] = useState(true);
  const [playerCount, setPlayerCount] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentUTCTime, setCurrentUTCTime] = useState(formatUTCDateTime());
  const [currentLocalTime, setCurrentLocalTime] = useState(formatLocalDateTime());
  
  // State for challenge name
  const [challengeName, setChallengeName] = useState('');
  
  const timeUpdateRef = useRef<number | null>(null);
  
  const selectedCategory = (settings as any).category || 'animals';
  const challengeId = `daily-${getUTCDateString()}-${selectedCategory}`;
  const challengeActive = isDailyChallengeActive();
  const currentGridSize = settings.gridSize || '8x8';

  // Use context for completion status
  const hasPlayed = dailyCompletion.completed;
  const challengeResult = dailyCompletion.result;

  const [previousDays, setPreviousDays] = useState([
    { date: getPreviousDayName(1), id: `daily-${getPreviousUTCDateString(1)}-${selectedCategory}`, completed: false, time: null as number | null },
    { date: getPreviousDayName(2), id: `daily-${getPreviousUTCDateString(2)}-${selectedCategory}`, completed: false, time: null as number | null },
    { date: getPreviousDayName(3), id: `daily-${getPreviousUTCDateString(3)}-${selectedCategory}`, completed: false, time: null as number | null },
  ]);

  // Load challenge name from service
  const loadChallengeName = async () => {
    try {
      const name = await challengeService.getCurrentChallengeName('daily', currentGridSize);
      setChallengeName(name);
      console.log('📛 Daily challenge name loaded:', name);
    } catch (error) {
      console.error('Error loading challenge name:', error);
      setChallengeName('Daily Challenge');
    }
  };

  const timeRemaining = getTimeRemaining('daily');
  const isExpired = !challengeActive;
  const isUrgent = !isExpired && timeRemaining.includes('h') && parseInt(timeRemaining) < 2;

  // Update time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentUTCTime(formatUTCDateTime());
      setCurrentLocalTime(formatLocalDateTime());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Load challenge data function
  const loadChallengeData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading daily challenge data for ID:', challengeId);
      
      // Load challenge name first
      await loadChallengeName();
      
      // Refresh status from context
      await refreshChallengeStatus(selectedCategory);
      
      const count = await getChallengePlayerCount('daily', selectedCategory);
      setPlayerCount(count);
      
      const user = auth.currentUser;
      if (user && hasPlayed && challengeActive) {
        const rank = await getPlayerRank(challengeId, user.uid);
        setUserRank(rank);
        console.log('🏆 User rank:', rank);
      }
      
      // Load previous days results
      const updatedPreviousDays = [...previousDays];
      for (let i = 0; i < updatedPreviousDays.length; i++) {
        const day = updatedPreviousDays[i];
        const prevResult = user?.uid ? await getUserChallengeResult(user.uid, day.id) : null;
        if (prevResult && prevResult.completed === true) {
          updatedPreviousDays[i].completed = true;
          updatedPreviousDays[i].time = prevResult.bestTime || prevResult.time;
        }
      }
      setPreviousDays(updatedPreviousDays);
      
    } catch (error) {
      console.error('Error loading challenge data:', error);
    } finally {
      setLoading(false);
    }
  }, [challengeId, challengeActive, currentGridSize, selectedCategory, refreshChallengeStatus, hasPlayed]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      console.log('📱 DailyChallengeScreen focused - refreshing data...');
      loadChallengeData();
      return () => {};
    }, [loadChallengeData])
  );

  // Initial load and timer
  useEffect(() => {
    loadChallengeData();
    
    timeUpdateRef.current = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
  }, []);

  const handleStartChallenge = () => {
    console.log('🎮 Starting daily challenge - ID:', challengeId);
    navigation.navigate('Play', {
      gridSize: settings.gridSize || '8x8',
      difficulty: 'Expert',
      challengeType: 'daily',
      challengeId: challengeId,
      startTime: Date.now(),
      key: `daily-${challengeId}-${Date.now()}`,
    });
  };

  const handleViewResults = () => {
    console.log('📊 Viewing daily challenge results');
    navigation.navigate('ChallengeResults', {
      challengeId: challengeId,
      challengeType: 'daily',
      time: challengeResult?.bestTime || challengeResult?.time,
      isPerfect: challengeResult?.isPerfect,
      moves: challengeResult?.moves,
      correctMoves: challengeResult?.correctMoves,
      wrongMoves: challengeResult?.wrongMoves,
      accuracy: challengeResult?.accuracy,
      completed: true,
      completedAt: challengeResult?.completedAt,
    });
  };

  const handleButtonPress = () => {
    if (hasPlayed) {
      handleViewResults();
    } else {
      handleStartChallenge();
    }
  };

  const getButtonText = () => {
    if (hasPlayed) return 'VIEW RESULTS';
    if (isExpired) return 'NEW DAILY CHALLENGE AVAILABLE';
    return 'PLAY DAILY CHALLENGE';
  };

  const getButtonColor = () => {
    if (hasPlayed) return '#9C27B0';
    if (isExpired) return '#2E7D32';
    return '#2E7D32';
  };

  const getBadgeColor = () => {
    if (hasPlayed) return '#9C27B0';
    if (isExpired) return '#666';
    return '#2E7D32';
  };

  const getBadgeText = () => {
    if (hasPlayed) return 'COMPLETED ✓';
    if (isExpired) return 'EXPIRED';
    return 'TODAY\'S CHALLENGE';
  };

  const getContrastColor = (bgColor: string): string => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.button} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading daily challenge...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.button }]}>
          <Text style={[styles.title, { color: getContrastColor(colors.button) }]}>Daily Challenge</Text>
          
          {/* Challenge Name Display */}
          <View style={styles.challengeNameContainer}>
            <Text style={[styles.challengeNameText, { color: getContrastColor(colors.button) }]}>
              {challengeName || 'Loading...'}
            </Text>
          </View>
          
          {/* Local Date/Time */}
          <View style={styles.timeContainer}>
            <Text style={[styles.timeLabel, { color: getContrastColor(colors.button), opacity: 0.8 }]}>📍 Local Time</Text>
            <Text style={[styles.timeValue, { color: getContrastColor(colors.button) }]}>{currentLocalTime}</Text>
          </View>
          
          {/* UTC Date/Time */}
          <View style={styles.timeContainer}>
            <Text style={[styles.timeLabel, { color: getContrastColor(colors.button), opacity: 0.8 }]}>🌍 UTC Time</Text>
            <Text style={[styles.timeValue, { color: getContrastColor(colors.button) }]}>{currentUTCTime}</Text>
          </View>
        </View>

        <View style={[styles.challengeCard, { backgroundColor: colors.button }]}>
          <View style={[styles.badge, { backgroundColor: getBadgeColor() }]}>
            <Text style={styles.badgeText}>{getBadgeText()}</Text>
          </View>
          
          <View style={styles.challengeHeader}>
            <Text style={[styles.challengeTitle, { color: getContrastColor(colors.button) }]}>
              {challengeName || 'Daily Challenge'}
            </Text>
            <Text style={[styles.gridSizeBadge, { color: getContrastColor(colors.button), backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              {settings.gridSize || '8x8'}
            </Text>
          </View>
          
          <Text style={[styles.challengeDesc, { color: getContrastColor(colors.button) }]}>
            {hasPlayed ? "You've completed today's challenge! View your results below." :
             isExpired ? "This challenge has expired. A new one is ready at UTC midnight!" : 
             `All players worldwide see the SAME ${challengeName || 'puzzle'} today!`}
          </Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Difficulty</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: '#9C27B0' }]}><Text style={styles.difficultyText}>EXPERT</Text></View>
            </View>
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Your Best</Text>
              <Text style={[styles.detailValue, { color: getContrastColor(colors.button) }]}>
                ⏱️ {challengeResult?.bestTime ? formatTime(challengeResult.bestTime) : '--:--'}
              </Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Time Left</Text>
              <Text style={[styles.timer, { color: isUrgent ? '#FF5722' : '#4CAF50' }]}>⏰ {timeRemaining}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Players</Text>
              <Text style={[styles.detailValue, { color: getContrastColor(colors.button) }]}>👥 {playerCount.toLocaleString()}</Text>
            </View>
          </View>

          {hasPlayed && (
            <View style={[styles.completedContainer, { backgroundColor: '#4CAF5020' }]}>
              <Text style={[styles.completedText, { color: '#4CAF50' }]}>✅ Daily Challenge Completed!</Text>
              {challengeResult?.bestTime && (
                <Text style={[styles.bestTime, { color: getContrastColor(colors.button) }]}>Your Time: {formatTime(challengeResult.bestTime)}</Text>
              )}
              {challengeResult?.isPerfect && <Text style={[styles.perfectBadge, { color: '#FFD700' }]}>✨ Perfect Game!</Text>}
              <Text style={[styles.streakBonus, { color: getContrastColor(colors.button) }]}>🔥 Current Streak: {profile?.stats?.currentStreak || 0} days</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: getButtonColor() }]}
            onPress={handleButtonPress}
          >
            <Text style={styles.startButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>

        {hasPlayed && (
          <View style={[styles.performanceContainer, { backgroundColor: colors.button }]}>
            <Text style={[styles.performanceTitle, { color: getContrastColor(colors.button) }]}>📊 Your Performance</Text>
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Username</Text>
                <Text style={[styles.performanceValue, { color: getContrastColor(colors.button) }]}>{profile?.username || profile?.name || 'Explorer'}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Best Time</Text>
                <Text style={[styles.performanceValue, { color: getContrastColor(colors.button) }]}>{challengeResult?.bestTime ? formatTime(challengeResult.bestTime) : '--:--'}</Text>
              </View>
            </View>
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Accuracy</Text>
                <Text style={[styles.performanceValue, { color: getContrastColor(colors.button) }]}>{challengeResult?.accuracy ? challengeResult.accuracy.toFixed(1) : '0'}%</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Position</Text>
                <View style={styles.rankContainer}>
                  <Text style={[styles.performanceValue, { color: getContrastColor(colors.button), marginRight: 4 }]}>{getRankDisplay(userRank)}</Text>
                  <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>of {playerCount}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {hasPlayed && (
          <View style={[styles.leaderboardContainer, { backgroundColor: colors.button }]}>
            <TouchableOpacity style={styles.leaderboardHeader} onPress={() => setShowLeaderboard(!showLeaderboard)}>
              <Text style={[styles.leaderboardTitle, { color: getContrastColor(colors.button) }]}>🏆 Challenge Leaderboard</Text>
              <Text style={[styles.leaderboardToggle, { color: getContrastColor(colors.button) }]}>{showLeaderboard ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            {showLeaderboard && (
              <View style={styles.leaderboardContent}>
                <ChallengeLeaderboard challengeId={challengeId} />
              </View>
            )}
          </View>
        )}

        <View style={[styles.previousContainer, { backgroundColor: colors.button }]}>
          <Text style={[styles.previousTitle, { color: getContrastColor(colors.button) }]}>📅 Previous Daily Challenges</Text>
          {previousDays.map((puzzle, index) => (
            <View key={index} style={styles.previousPuzzle}>
              <Text style={[styles.previousDate, { color: getContrastColor(colors.button) }]}>{puzzle.date}</Text>
              <View style={styles.previousStatus}>
                <Text style={[styles.previousCompleted, { color: puzzle.completed ? '#4CAF50' : '#999' }]}>
                  {puzzle.completed ? '✓ Completed' : '— Not played'}
                </Text>
                {puzzle.time && <Text style={[styles.previousTime, { color: getContrastColor(colors.button), opacity: 0.8 }]}>{formatTime(puzzle.time)}</Text>}
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.streakContainer, { backgroundColor: colors.button }]}>
          <Text style={[styles.streakTitle, { color: getContrastColor(colors.button) }]}>🔥 Daily Streak: {profile?.stats?.currentStreak || 0} days</Text>
          <Text style={[styles.streakText, { color: getContrastColor(colors.button), opacity: 0.9 }]}>
            {hasPlayed ? "Great job completing today's challenge! Come back tomorrow at UTC midnight for another one." : "Complete today's challenge to continue your streak!"}
          </Text>
        </View>

        <AppFooter textColor={colors.text} version="1.0.0" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16 },
  container: { flex: 1 },
  header: { padding: 25, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  challengeNameContainer: { alignItems: 'center', marginBottom: 15, paddingHorizontal: 10 },
  challengeNameText: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  timeContainer: { alignItems: 'center', marginBottom: 8, width: '100%' },
  timeLabel: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  timeValue: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  challengeCard: { margin: 20, padding: 25, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 15 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  challengeTitle: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  gridSizeBadge: { fontSize: 14, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  challengeDesc: { fontSize: 16, opacity: 0.9, marginBottom: 20, lineHeight: 22 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  detailBox: { width: '48%', marginBottom: 15 },
  detailLabel: { fontSize: 12, marginBottom: 5 },
  difficultyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  difficultyText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  detailValue: { fontSize: 16, fontWeight: '600' },
  timer: { fontSize: 16, fontWeight: 'bold' },
  completedContainer: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  completedText: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  bestTime: { fontSize: 16, fontWeight: '500', marginBottom: 5 },
  perfectBadge: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  streakBonus: { fontSize: 14, fontWeight: '600', marginTop: 5 },
  startButton: { paddingVertical: 16, borderRadius: 15, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  performanceContainer: { marginHorizontal: 20, marginBottom: 20, padding: 20, borderRadius: 15 },
  performanceTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  performanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  performanceItem: { flex: 1, alignItems: 'center' },
  performanceLabel: { fontSize: 12, marginBottom: 4 },
  performanceValue: { fontSize: 16, fontWeight: '600' },
  rankContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  leaderboardContainer: { marginHorizontal: 20, marginBottom: 20, borderRadius: 15, overflow: 'hidden' },
  leaderboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(0,0,0,0.05)' },
  leaderboardTitle: { fontSize: 18, fontWeight: 'bold' },
  leaderboardToggle: { fontSize: 18, fontWeight: 'bold' },
  leaderboardContent: { padding: 10, minHeight: 200 },
  previousContainer: { marginHorizontal: 20, marginBottom: 20, padding: 20, borderRadius: 15 },
  previousTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  previousPuzzle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  previousDate: { fontSize: 16 },
  previousStatus: { alignItems: 'flex-end' },
  previousCompleted: { fontSize: 14, fontWeight: '500' },
  previousTime: { fontSize: 12, marginTop: 2 },
  streakContainer: { marginHorizontal: 20, marginBottom: 30, padding: 20, borderRadius: 15, alignItems: 'center' },
  streakTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  streakText: { fontSize: 14, textAlign: 'center', marginBottom: 8 },
});

export default DailyChallengeScreen;