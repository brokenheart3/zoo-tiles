// src/screens/WeeklyChallengeScreen.tsx
import React, { useContext, useState, useEffect, useCallback } from "react";
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
  isWeeklyChallengeActive,
  getWeekNumber as getWeekNumberUTC,
  formatTime,
} from "../utils/timeUtils";
import { auth } from "../services/firebase";
import AppFooter from "../components/common/AppFooter";
import ChallengeLeaderboard from "../components/challenges/ChallengeLeaderboard";
import { ChallengeCategory } from "../types/challenge";

type RootStackParamList = {
  Play: {
    gridSize: string;
    difficulty: 'Expert';
    challengeType: 'weekly';
    challengeId?: string;
    startTime?: number; 
    key?: string;
  };
  Home: undefined;
  ChallengeResults: {
    challengeId: string;
    challengeType: 'weekly';
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

type WeeklyChallengeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Play'>;

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

const WeeklyChallengeScreen = () => {
  const navigation = useNavigation<WeeklyChallengeScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { settings } = useSettings();
  const { profile } = useProfile();
  const { weeklyCompletion, refreshChallengeStatus } = useGameMode();
  
  const colors = themeStyles[theme];
  
  const [loading, setLoading] = useState(true);
  const [playerCount, setPlayerCount] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentUTCTime, setCurrentUTCTime] = useState(formatUTCDateTime());
  const [currentLocalTime, setCurrentLocalTime] = useState(formatLocalDateTime());
  
  // State for challenge name and emoji
  const [challengeName, setChallengeName] = useState('');
  const [challengeEmoji, setChallengeEmoji] = useState('');
  
  const timeUpdateRef = React.useRef<number | null>(null);
  
  const selectedCategory = (settings as any).category || 'animals';
  const category = selectedCategory as ChallengeCategory;
  const currentGridSize = settings.gridSize || '8x8';
  const weekNumber = getWeekNumberUTC(new Date());
  // Fix: Remove gridSize from challenge ID to match what's saved in PlayScreen
  const challengeId = `weekly-${weekNumber}-${selectedCategory}`;
  const challengeActive = isWeeklyChallengeActive();

  // Use context for completion status
  const hasPlayed = weeklyCompletion.completed;
  const challengeResult = weeklyCompletion.result;

  const timeRemaining = getTimeRemaining('weekly');
  const isExpired = !challengeActive;
  const isUrgent = !isExpired && (timeRemaining.includes('0d') || (timeRemaining.includes('1d') && !timeRemaining.includes('Expired')));

  // Load challenge name and emoji from service
  const loadChallengeName = async () => {
    try {
      // Get full metadata with emoji
      const metadata = await challengeService.getChallengeMetadata('weekly', currentGridSize, category);
      setChallengeName(metadata.name);
      setChallengeEmoji(metadata.challengeEmoji);
      console.log('📛 Weekly challenge loaded:', { 
        name: metadata.name, 
        emoji: metadata.challengeEmoji,
        challengeId 
      });
    } catch (error) {
      console.error('Error loading challenge name:', error);
      setChallengeName('Weekly Challenge');
      setChallengeEmoji('📆');
    }
  };

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
      console.log('🔄 Loading weekly challenge data for ID:', challengeId);
      
      // Load challenge name first
      await loadChallengeName();
      
      // Refresh status from context
      await refreshChallengeStatus(selectedCategory);
      
      const count = await getChallengePlayerCount('weekly', selectedCategory);
      setPlayerCount(count);
      
      const user = auth.currentUser;
      if (user && hasPlayed && challengeActive) {
        const rank = await getPlayerRank(challengeId, user.uid);
        setUserRank(rank);
        console.log('🏆 User weekly rank:', rank);
      }
      
      console.log('📊 Weekly challenge status:', {
        challengeId,
        hasPlayed,
        completed: weeklyCompletion.completed,
        result: challengeResult
      });
    } catch (error) {
      console.error('Error loading weekly challenge data:', error);
    } finally {
      setLoading(false);
    }
  }, [challengeId, challengeActive, currentGridSize, selectedCategory, refreshChallengeStatus, hasPlayed, weeklyCompletion.completed]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      console.log('📱 WeeklyChallengeScreen focused - refreshing data...');
      loadChallengeData();
      return () => {};
    }, [loadChallengeData])
  );

  // Timer for force update
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
    console.log('🎮 Starting weekly challenge - ID:', challengeId);
    navigation.navigate('Play', {
      gridSize: settings.gridSize || '8x8',
      difficulty: 'Expert',
      challengeType: 'weekly',
      challengeId: challengeId,
      startTime: Date.now(),
      key: `weekly-${challengeId}-${Date.now()}`,
    });
  };

  const handleViewResults = () => {
    console.log('📊 Viewing weekly challenge results');
    navigation.navigate('ChallengeResults', {
      challengeId: challengeId,
      challengeType: 'weekly',
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
    if (isExpired) return 'NEW WEEKLY CHALLENGE AVAILABLE';
    return 'PLAY WEEKLY CHALLENGE';
  };

  const getButtonColor = () => {
    if (hasPlayed) return '#9C27B0';
    if (isExpired) return '#1565C0';
    return '#1565C0';
  };

  const getBadgeColor = () => {
    if (hasPlayed) return '#9C27B0';
    if (isExpired) return '#666';
    return '#1565C0';
  };

  const getBadgeText = () => {
    if (hasPlayed) return 'COMPLETED ✓';
    if (isExpired) return 'EXPIRED';
    return 'WEEKLY SPECIAL';
  };

  const formatTimeDisplay = (seconds: number): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading weekly challenge...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.button }]}>
          <Text style={[styles.title, { color: getContrastColor(colors.button) }]}>Weekly Challenge</Text>
          
          {/* Challenge Name Display with Emoji */}
          <View style={styles.challengeNameContainer}>
            <Text style={[styles.challengeNameText, { color: getContrastColor(colors.button) }]}>
              {challengeEmoji} {challengeName || 'Loading...'}
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
              {challengeEmoji} {challengeName || 'Weekly Challenge'}
            </Text>
            <Text style={[styles.gridSizeBadge, { color: getContrastColor(colors.button), backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              {settings.gridSize || '8x8'}
            </Text>
          </View>
          
          <Text style={[styles.challengeDesc, { color: getContrastColor(colors.button) }]}>
            {hasPlayed ? "You've completed this week's challenge! View your results below." :
             isExpired ? "This week's challenge has expired. A new one starts Monday at UTC midnight!" :
             `All players worldwide see the SAME ${challengeName || 'weekly challenge'} this week!`}
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Difficulty</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: '#9C27B0' }]}><Text style={styles.difficultyText}>EXPERT</Text></View>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Your Best</Text>
              <Text style={[styles.statValue, { color: getContrastColor(colors.button) }]}>
                ⏱️ {challengeResult?.bestTime ? formatTimeDisplay(challengeResult.bestTime) : '--:--'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Time Left</Text>
              <Text style={[styles.timer, { color: isUrgent ? '#FF5722' : '#4CAF50' }]}>⏰ {timeRemaining}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>Players</Text>
              <Text style={[styles.statValue, { color: getContrastColor(colors.button) }]}>👥 {playerCount.toLocaleString()}</Text>
            </View>
          </View>

          {hasPlayed && (
            <View style={[styles.completedContainer, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
              <Text style={[styles.completedText, { color: '#4CAF50' }]}>✅ Weekly Challenge Completed!</Text>
              {challengeResult?.bestTime && (
                <Text style={[styles.bestTime, { color: getContrastColor(colors.button) }]}>Best Time: {formatTimeDisplay(challengeResult.bestTime)}</Text>
              )}
              {challengeResult?.isPerfect && <Text style={[styles.perfectBadge, { color: '#FFD700' }]}>✨ Perfect Game!</Text>}
              <Text style={[styles.rankText, { color: getContrastColor(colors.button) }]}>Your Rank: {getRankDisplay(userRank)} of {playerCount}</Text>
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
          <View style={[styles.leaderboardSection, { backgroundColor: colors.button }]}>
            <TouchableOpacity style={styles.leaderboardHeader} onPress={() => setShowLeaderboard(!showLeaderboard)}>
              <Text style={[styles.leaderboardTitle, { color: getContrastColor(colors.button) }]}>🏆 Weekly Leaderboard</Text>
              <Text style={[styles.leaderboardToggle, { color: getContrastColor(colors.button) }]}>{showLeaderboard ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            {showLeaderboard && (
              <View style={styles.leaderboardContent}>
                <ChallengeLeaderboard challengeId={challengeId} />
              </View>
            )}
            {!showLeaderboard && (
              <View style={styles.leaderboardPreview}>
                <Text style={[styles.leaderboardPreviewText, { color: getContrastColor(colors.button), opacity: 0.9 }]}>
                  {playerCount} players • You are ranked {getRankDisplay(userRank)}
                </Text>
              </View>
            )}
          </View>
        )}

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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { width: '48%', marginBottom: 15 },
  statLabel: { fontSize: 12, marginBottom: 5 },
  difficultyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  difficultyText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  statValue: { fontSize: 16, fontWeight: '600' },
  timer: { fontSize: 16, fontWeight: 'bold' },
  completedContainer: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  completedText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  bestTime: { fontSize: 16, fontWeight: '500', marginBottom: 5 },
  perfectBadge: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  rankText: { fontSize: 16, marginBottom: 8, fontWeight: '600' },
  startButton: { paddingVertical: 16, borderRadius: 15, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  leaderboardSection: { marginHorizontal: 20, marginBottom: 30, borderRadius: 15, overflow: 'hidden' },
  leaderboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(0,0,0,0.05)' },
  leaderboardTitle: { fontSize: 18, fontWeight: 'bold' },
  leaderboardToggle: { fontSize: 18, fontWeight: 'bold' },
  leaderboardContent: { padding: 10, minHeight: 200 },
  leaderboardPreview: { padding: 15, alignItems: 'center' },
  leaderboardPreviewText: { fontSize: 14, textAlign: 'center' },
});

export default WeeklyChallengeScreen;