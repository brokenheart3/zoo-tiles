// src/screens/WeeklyChallengeScreen.tsx
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeContext, themeStyles } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { useProfile } from "../context/ProfileContext";
import { getChallengePlayerCount } from "../services/simpleChallengeService";
import { getUserChallengeResult, getPlayerRank } from "../services/userService";
import { 
  getTimeRemaining, 
  getWeekNumber, 
  formatDate, 
  formatTime,
  getUTCDateString,
  isWeeklyChallengeActive,
  getWeekNumber as getWeekNumberUTC
} from "../utils/timeUtils";
import { auth } from "../services/firebase";
import AppFooter from "../components/common/AppFooter";
import ChallengeLeaderboard from "../components/challenges/ChallengeLeaderboard"; // Import leaderboard

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

// Weekly challenge animals (rotates each week)
const WEEKLY_ANIMALS = [
  { emoji: '🦁', name: 'Lion' },
  { emoji: '🐘', name: 'Elephant' },
  { emoji: '🦒', name: 'Giraffe' },
  { emoji: '🦓', name: 'Zebra' },
  { emoji: '🐅', name: 'Tiger' },
  { emoji: '🦍', name: 'Gorilla' },
  { emoji: '🐊', name: 'Crocodile' },
  { emoji: '🦏', name: 'Rhino' },
  { emoji: '🐆', name: 'Leopard' },
  { emoji: '🦛', name: 'Hippo' },
];

// Helper to get this week's animal
const getWeekAnimal = () => {
  const weekNum = parseInt(getWeekNumberUTC(new Date()));
  const index = (weekNum - 1) % WEEKLY_ANIMALS.length;
  return WEEKLY_ANIMALS[index];
};

// Helper to get rank display with ordinal suffix
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

const WeeklyChallengeScreen = () => {
  const navigation = useNavigation<WeeklyChallengeScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { settings } = useSettings();
  const { profile } = useProfile();
  
  const colors = themeStyles[theme];
  
  const [loading, setLoading] = useState(true);
  const [playerCount, setPlayerCount] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [challengeResult, setChallengeResult] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false); // State for leaderboard toggle
  
  const weekAnimal = getWeekAnimal();
  const weekNumber = getWeekNumberUTC(new Date());
  const challengeId = `weekly-${weekNumber}`;
  const challengeActive = isWeeklyChallengeActive();

  useEffect(() => {
    loadChallengeData();
    const interval = setInterval(() => {
      // Force re-render to update timer
      setLoading(prev => prev);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const loadChallengeData = async () => {
    try {
      setLoading(true);
      
      // Get real player count from Firebase
      const count = await getChallengePlayerCount('weekly');
      setPlayerCount(count);
      
      // Check if current user has played
      const user = auth.currentUser;
      if (user) {
        console.log(`👤 Checking weekly challenge for user: ${user.uid}`);
        console.log(`📅 This Week's Challenge ID: ${challengeId}`);
        console.log(`⏰ Challenge active: ${challengeActive}`);
        
        // Get this week's result
        const result = await getUserChallengeResult(user.uid, challengeId);
        
        // Check if challenge is expired
        const isExpired = !challengeActive;
        
        if (result && result.completed) {
          console.log('✅ User has completed this week\'s challenge:', result);
          setHasPlayed(true);
          setChallengeResult(result);
          setAttempts(result.attempts || 1);
          
          // Only get rank if challenge is still active
          if (challengeActive) {
            console.log('🎯 Getting rank for challenge:', challengeId);
            console.log('🎯 User time:', result.bestTime || result.time);
            
            const rank = await getPlayerRank(challengeId, user.uid);
            
            console.log('🎯 Raw rank returned:', rank);
            setUserRank(rank);
            
            console.log(`🏆 User rank: ${rank} out of ${count}`);
          } else {
            setUserRank(null);
          }
        } else {
          console.log('❌ User has not completed this week\'s challenge');
          
          // If challenge is expired, check if they played last week
          if (isExpired) {
            console.log('📅 Challenge expired - checking last week\'s result...');
            
            // Get last week's week number
            const lastWeekNumber = (parseInt(weekNumber) - 1).toString();
            const lastWeekId = `weekly-${lastWeekNumber}`;
            
            console.log(`🔍 Checking last week: ${lastWeekId}`);
            const lastWeekResult = await getUserChallengeResult(user.uid, lastWeekId);
            
            if (lastWeekResult && lastWeekResult.completed) {
              console.log('✅ Found result from last week!');
              setHasPlayed(true);
              setChallengeResult(lastWeekResult);
              setAttempts(lastWeekResult.attempts || 1);
              // Don't set rank for expired challenge
              setUserRank(null);
            } else {
              console.log('❌ No result from last week');
              setHasPlayed(false);
              setChallengeResult(null);
              setUserRank(null);
            }
          } else {
            setHasPlayed(false);
            setChallengeResult(null);
            setUserRank(null);
          }
        }
      }
      
    } catch (error) {
      console.error('Error loading challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = () => {
    const startTime = Date.now();
    const startChallengeId = challengeId; // Current week number
    
    navigation.navigate('Play', {
      gridSize: settings.gridSize || '8x8',
      difficulty: 'Expert',
      challengeType: 'weekly',
      challengeId: startChallengeId,
      startTime: startTime,
      key: `weekly-${startChallengeId}-${startTime}`,
    });
  };

  const handleViewResults = () => {
    navigation.navigate('ChallengeResults', {
      challengeId,
      challengeType: 'weekly',
      time: challengeResult?.bestTime || challengeResult?.time,
      isPerfect: challengeResult?.isPerfect,
      moves: challengeResult?.moves,
      correctMoves: challengeResult?.correctMoves,
      wrongMoves: challengeResult?.wrongMoves,
      accuracy: challengeResult?.accuracy,
      completed: true,
    });
  };

  const handleButtonPress = () => {
    if (!challengeActive) {
      handleStartChallenge();
      return;
    }
    
    if (hasPlayed) {
      handleViewResults();
    } else {
      handleStartChallenge();
    }
  };

  const getButtonText = () => {
    if (!challengeActive) {
      return 'NEW WEEKLY CHALLENGE AVAILABLE';
    }
    return hasPlayed ? 'VIEW RESULTS' : 'PLAY WEEKLY CHALLENGE';
  };

  // Helper to get contrasting text color
  const getContrastColor = (bgColor: string): string => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Format time helper
  const formatTimeDisplay = (seconds: number): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading weekly challenge...
        </Text>
      </SafeAreaView>
    );
  }

  const timeRemaining = getTimeRemaining('weekly');
  const isExpired = timeRemaining.includes('Expired');
  const isUrgent = timeRemaining.includes('0d') || timeRemaining.includes('1d') && !timeRemaining.includes('Expired');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.button }]}>
          <Text style={[styles.title, { color: getContrastColor(colors.button) }]}>
            Weekly Challenge
          </Text>
          <Text style={[styles.subtitle, { color: getContrastColor(colors.button) }]}>
            Week {weekNumber} • {weekAnimal.emoji} {weekAnimal.name}
          </Text>
          <Text style={[styles.utcNote, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
            Resets Monday at UTC Midnight
          </Text>
        </View>

        {/* Weekly Challenge Card */}
        <View style={[styles.challengeCard, { backgroundColor: colors.button }]}>
          <View style={[styles.badge, { backgroundColor: isExpired ? '#666' : '#1565C0' }]}>
            <Text style={styles.badgeText}>
              {isExpired ? 'EXPIRED' : 'WEEKLY SPECIAL'}
            </Text>
          </View>
          
          <View style={styles.challengeHeader}>
            <Text style={[styles.challengeTitle, { color: getContrastColor(colors.button) }]}>
              Weekly {weekAnimal.name} Expedition
            </Text>
            <Text style={[styles.gridSizeBadge, { 
              color: getContrastColor(colors.button),
              backgroundColor: 'rgba(255,255,255,0.2)' 
            }]}>
              {settings.gridSize || '8x8'}
            </Text>
          </View>
          
          <Text style={[styles.challengeDesc, { color: getContrastColor(colors.button) }]}>
            A special {settings.gridSize || '8x8'} {weekAnimal.name.toLowerCase()} puzzle available all week
          </Text>

          {/* Challenge Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                Difficulty
              </Text>
              <View style={[styles.difficultyBadge, { backgroundColor: '#9C27B0' }]}>
                <Text style={styles.difficultyText}>EXPERT</Text>
              </View>
            </View>
            
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                Your Best
              </Text>
              <Text style={[styles.statValue, { color: getContrastColor(colors.button) }]}>
                ⏱️ {challengeResult?.bestTime && challengeActive ? formatTimeDisplay(challengeResult.bestTime) : '--:--'}
              </Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                Time Left
              </Text>
              <Text style={[styles.timer, { color: isUrgent ? '#FF5722' : '#1565C0' }]}>
                ⏰ {timeRemaining}
              </Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                Players
              </Text>
              <Text style={[styles.statValue, { color: getContrastColor(colors.button) }]}>
                👥 {playerCount.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Your Performance */}
          <View style={[styles.performanceContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.performanceTitle, { color: getContrastColor(colors.button) }]}>
              Your Performance
            </Text>
            
            {hasPlayed && challengeActive ? (
              <View style={styles.completedStats}>
                <Text style={[styles.completedText, { color: '#4CAF50' }]}>
                  ✅ Weekly Challenge Completed
                </Text>
                {challengeResult?.bestTime && (
                  <Text style={[styles.bestTime, { color: getContrastColor(colors.button) }]}>
                    Best Time: {formatTimeDisplay(challengeResult.bestTime)}
                  </Text>
                )}
                {challengeResult?.isPerfect && (
                  <Text style={[styles.perfectBadge, { color: '#FFD700' }]}>
                    ✨ Perfect Game!
                  </Text>
                )}
                <Text style={[styles.rankText, { color: getContrastColor(colors.button) }]}>
                  Your Rank: {getRankDisplay(userRank)} of {playerCount}
                </Text>
              </View>
            ) : (
              <View style={styles.incompleteStats}>
                <Text style={[styles.incompleteText, { color: getContrastColor(colors.button) }]}>
                  {attempts > 0 
                    ? `Attempts this week: ${attempts}` 
                    : 'Not attempted yet'}
                </Text>
                {attempts > 0 && !hasPlayed && (
                  <Text style={[styles.attemptHint, { color: getContrastColor(colors.button), opacity: 0.8 }]}>
                    Keep trying to complete the challenge!
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Start/View Results Button */}
          <TouchableOpacity 
            style={[
              styles.startButton, 
              { 
                backgroundColor: !challengeActive ? '#1565C0' : (hasPlayed ? '#666' : '#1565C0'),
              }
            ]}
            onPress={handleButtonPress}
          >
            <Text style={styles.startButtonText}>
              {getButtonText()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ===== LEADERBOARD SECTION ===== */}
        {/* Only show if user has played and challenge is active */}
        {hasPlayed && challengeActive && (
          <View style={[styles.leaderboardSection, { backgroundColor: colors.button }]}>
            {/* Leaderboard Toggle Header */}
            <TouchableOpacity 
              style={styles.leaderboardHeader}
              onPress={() => setShowLeaderboard(!showLeaderboard)}
            >
              <Text style={[styles.leaderboardTitle, { color: getContrastColor(colors.button) }]}>
                🏆 Weekly Leaderboard
              </Text>
              <Text style={[styles.leaderboardToggle, { color: getContrastColor(colors.button) }]}>
                {showLeaderboard ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {/* Leaderboard Content */}
            {showLeaderboard && (
              <View style={styles.leaderboardContent}>
                <ChallengeLeaderboard challengeId={challengeId} />
              </View>
            )}

            {/* Stats Preview when collapsed */}
            {!showLeaderboard && (
              <View style={styles.leaderboardPreview}>
                <Text style={[styles.leaderboardPreviewText, { color: getContrastColor(colors.button), opacity: 0.9 }]}>
                  {playerCount} players • You are ranked {getRankDisplay(userRank)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <AppFooter textColor={colors.text} version="1.0.0" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
    textAlign: 'center',
  },
  utcNote: {
    fontSize: 12,
    marginTop: 5,
  },
  challengeCard: {
    margin: 20,
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 15,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  gridSizeBadge: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  challengeDesc: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  performanceContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  completedStats: {
    alignItems: 'center',
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  bestTime: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  perfectBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rankText: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  incompleteStats: {
    alignItems: 'center',
  },
  incompleteText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  attemptHint: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Leaderboard styles
  leaderboardSection: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaderboardToggle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaderboardContent: {
    padding: 10,
    minHeight: 200,
  },
  leaderboardPreview: {
    padding: 15,
    alignItems: 'center',
  },
  leaderboardPreviewText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default WeeklyChallengeScreen;