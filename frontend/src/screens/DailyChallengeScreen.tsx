// src/screens/DailyChallengeScreen.tsx
import React, { useContext, useState, useEffect, useRef, useMemo } from "react";
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
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
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeContext, themeStyles } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { useProfile } from "../context/ProfileContext";
import { getChallengePlayerCount } from "../services/simpleChallengeService";
import { getUserChallengeResult, getPlayerRank } from "../services/userService";
import { 
  getTimeRemaining, 
  getUTCDateString,
  isDailyChallengeActive,
  formatDate, 
  formatTime,
  getDayName as getDayNameFromUtils,
  getUTCDateStringForTimestamp,
  isChallengeCrossingMidnight,
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

// Helper to get previous day name in UTC
const getPreviousDayName = (daysAgo: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return getDayNameFromUtils(date);
};

// Helper to get UTC date string for days ago
const getPreviousUTCDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get rank display with ordinal suffix
const getRankDisplay = (rank: number | null): string => {
  if (!rank) return '—';
  if (rank === 1) return '🥇 1st';
  if (rank === 2) return '🥈 2nd';
  if (rank === 3) return '🥉 3rd';
  
  // Add ordinal suffix
  if (rank % 10 === 1 && rank % 100 !== 11) return `${rank}st`;
  if (rank % 10 === 2 && rank % 100 !== 12) return `${rank}nd`;
  if (rank % 10 === 3 && rank % 100 !== 13) return `${rank}rd`;
  return `${rank}th`;
};

// Helper to show timezone info
const showTimezoneInfo = () => {
  const now = new Date();
  Alert.alert(
    '🌍 How Daily Challenges Work',
    `• All players worldwide see the SAME daily challenge\n` +
    `• Challenge resets at UTC midnight (00:00 UTC)\n` +
    `• Your local time: ${now.toLocaleString()}\n` +
    `• UTC time: ${now.toUTCString()}\n` +
    `• Today's challenge ID: daily-${getUTCDateString()}\n\n` +
    `This ensures fair competition across all time zones!`
  );
};

const DailyChallengeScreen = () => {
  const navigation = useNavigation<DailyChallengeScreenNavigationProp>();
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
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use UTC date for challenge ID to ensure consistency across time zones
  const challengeId = `daily-${getUTCDateString()}`;
  const challengeActive = isDailyChallengeActive();

  // Get previous 3 days for history (using UTC dates)
  const [previousDays, setPreviousDays] = useState([
    { 
      date: getPreviousDayName(1), 
      id: `daily-${getPreviousUTCDateString(1)}`, 
      completed: false, 
      time: null as number | null 
    },
    { 
      date: getPreviousDayName(2), 
      id: `daily-${getPreviousUTCDateString(2)}`, 
      completed: false, 
      time: null as number | null 
    },
    { 
      date: getPreviousDayName(3), 
      id: `daily-${getPreviousUTCDateString(3)}`, 
      completed: false, 
      time: null as number | null 
    },
  ]);

  // Memoize time values to prevent blinking
  const timeInfo = useMemo(() => {
    const remaining = getTimeRemaining('daily');
    return {
      remaining,
      isExpired: remaining === 'Expired!' || remaining.includes('Expired'),
      isActive: isDailyChallengeActive(),
      isUrgent: remaining.includes('0h') || (remaining.includes('h') && !remaining.includes('d') && !remaining.includes('Expired'))
    };
  }, [forceUpdate]);

  const { remaining: timeRemaining, isExpired, isUrgent } = timeInfo;

  useEffect(() => {
    loadChallengeData();
    
    // Update timer every second using forceUpdate counter
    timeUpdateRef.current = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
  }, []);

  const loadChallengeData = async () => {
    try {
      setLoading(true);
      
      // Get real player count from Firebase
      const count = await getChallengePlayerCount('daily');
      setPlayerCount(count);
      
      // Check if current user has played
      const user = auth.currentUser;
      if (user) {
        console.log(`👤 Checking challenge for user: ${user.uid}`);
        console.log(`📅 Today's Challenge ID: ${challengeId}`);
        console.log(`⏰ Challenge active: ${challengeActive}`);
        
        // Get today's result
        const result = await getUserChallengeResult(user.uid, challengeId);
        
        // Check if challenge is expired
        const isExpired = !challengeActive;
        
        if (result && result.completed) {
          console.log('✅ User has completed today\'s challenge:', result);
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
          console.log('❌ User has not completed today\'s challenge');
          
          // If challenge is expired, check if they played yesterday
          if (isExpired) {
            console.log('📅 Challenge expired - checking yesterday\'s result...');
            
            // Get yesterday's date
            const yesterday = new Date();
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            const yesterdayId = `daily-${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}-${String(yesterday.getUTCDate()).padStart(2, '0')}`;
            
            console.log(`🔍 Checking yesterday: ${yesterdayId}`);
            const yesterdayResult = await getUserChallengeResult(user.uid, yesterdayId);
            
            if (yesterdayResult && yesterdayResult.completed) {
              console.log('✅ Found result from yesterday!');
              setHasPlayed(true);
              setChallengeResult(yesterdayResult);
              setAttempts(yesterdayResult.attempts || 1);
              // Don't set rank for expired challenge
              setUserRank(null);
            } else {
              console.log('❌ No result from yesterday');
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
        
        // Load previous days results (always show last 3 days regardless of expiration)
        console.log('📅 Loading previous days results...');
        const updatedPreviousDays = [...previousDays];
        for (let i = 0; i < updatedPreviousDays.length; i++) {
          const day = updatedPreviousDays[i];
          console.log(`🔍 Checking previous day: ${day.id}`);
          const prevResult = await getUserChallengeResult(user.uid, day.id);
          if (prevResult && prevResult.completed) {
            updatedPreviousDays[i].completed = true;
            updatedPreviousDays[i].time = prevResult.bestTime || prevResult.time;
            console.log(`✅ Previous day ${day.id} completed with time: ${updatedPreviousDays[i].time}s`);
          } else {
            console.log(`❌ Previous day ${day.id} not completed`);
          }
        }
        setPreviousDays(updatedPreviousDays);
      }
      
    } catch (error) {
      console.error('Error loading challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = () => {
    console.log('🎮 Starting challenge with ID:', challengeId);
    
    // Capture the start time and challenge ID
    const startTime = Date.now();
    const startChallengeId = challengeId; // This is the current UTC date when starting
    
    navigation.navigate('Play', {
      gridSize: settings.gridSize || '8x8',
      difficulty: 'Expert',
      challengeType: 'daily',
      challengeId: startChallengeId, // Use the ID from when they STARTED
      startTime: startTime, // Pass start time
      key: `daily-${startChallengeId}-${startTime}`,
    });
  };

  const handleViewResults = () => {
    // If the challenge is expired but the user has a result from yesterday
    if (isExpired && challengeResult) {
      navigation.navigate('ChallengeResults', {
        challengeId: challengeId, // This is yesterday's ID if expired
        challengeType: 'daily',
        time: challengeResult?.bestTime || challengeResult?.time,
        isPerfect: challengeResult?.isPerfect,
        moves: challengeResult?.moves,
        correctMoves: challengeResult?.correctMoves,
        wrongMoves: challengeResult?.wrongMoves,
        accuracy: challengeResult?.accuracy,
        completed: true,
        completedAt: challengeResult?.completedAt, // Pass when they completed
      });
    } else {
      navigation.navigate('ChallengeResults', {
        challengeId,
        challengeType: 'daily',
        time: challengeResult?.bestTime || challengeResult?.time,
        isPerfect: challengeResult?.isPerfect,
        moves: challengeResult?.moves,
        correctMoves: challengeResult?.correctMoves,
        wrongMoves: challengeResult?.wrongMoves,
        accuracy: challengeResult?.accuracy,
        completed: true,
      });
    }
  };

  const handleButtonPress = () => {
    console.log('👆 Button pressed - Active:', challengeActive, 'Has played:', hasPlayed);
    
    // If challenge is expired but user has played (they played yesterday)
    if (isExpired && hasPlayed) {
      console.log('➡️ Challenge expired but has result, viewing results');
      handleViewResults();
      return;
    }
    
    // If challenge is expired, always start a new game (for today)
    if (isExpired) {
      console.log('➡️ Challenge expired, starting new game for today');
      handleStartChallenge();
      return;
    }
    
    // If active and played, view results; otherwise play
    if (hasPlayed) {
      console.log('➡️ Challenge completed, viewing results');
      handleViewResults();
    } else {
      console.log('➡️ Challenge active, starting new game');
      handleStartChallenge();
    }
  };

  const getButtonText = () => {
    if (isExpired) {
      return 'NEW DAILY CHALLENGE AVAILABLE';
    }
    return hasPlayed ? 'VIEW RESULTS' : 'PLAY DAILY CHALLENGE';
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading daily challenge...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.button }]}>
          <Text style={[styles.title, { color: getContrastColor(colors.button) }]}>
            Daily Challenge
          </Text>
          <Text style={[styles.subtitle, { color: getContrastColor(colors.button) }]}>
            {formatDate(new Date())} (Local)
          </Text>
          <TouchableOpacity onPress={showTimezoneInfo}>
            <Text style={[styles.utcNote, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
              🌍 UTC Date: {getUTCDateString()} (tap for info)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Challenge Card */}
        <View style={[styles.challengeCard, { backgroundColor: colors.button }]}>
          <View style={[styles.badge, { backgroundColor: isExpired ? '#666' : '#2E7D32' }]}>
            <Text style={styles.badgeText}>
              {isExpired ? 'EXPIRED' : 'TODAY\'S CHALLENGE'}
            </Text>
          </View>
          
          <View style={styles.challengeHeader}>
            <Text style={[styles.challengeTitle, { color: getContrastColor(colors.button) }]}>
              Daily Jungle Adventure
            </Text>
            <Text style={[styles.gridSizeBadge, { 
              color: getContrastColor(colors.button),
              backgroundColor: 'rgba(255,255,255,0.2)' 
            }]}>
              {settings.gridSize || '8x8'}
            </Text>
          </View>
          
          <Text style={[styles.challengeDesc, { color: getContrastColor(colors.button) }]}>
            {isExpired 
              ? "This challenge has expired. A new one is ready at UTC midnight!" 
              : "All players worldwide see the SAME puzzle today!"}
          </Text>
          
          {/* Challenge Details */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                Difficulty
              </Text>
              <View style={[styles.difficultyBadge, { backgroundColor: '#9C27B0' }]}>
                <Text style={styles.difficultyText}>EXPERT</Text>
              </View>
            </View>
            
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                Your Best
              </Text>
              <Text style={[styles.detailValue, { color: getContrastColor(colors.button) }]}>
                ⏱️ {challengeResult?.bestTime && !isExpired ? formatTime(challengeResult.bestTime) : '--:--'}
              </Text>
            </View>
            
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                Time Left
              </Text>
              <Text style={[styles.timer, { color: isUrgent ? '#FF5722' : '#4CAF50' }]}>
                ⏰ {timeRemaining}
              </Text>
            </View>
            
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                Players
              </Text>
              <Text style={[styles.detailValue, { color: getContrastColor(colors.button) }]}>
                👥 {playerCount.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Your Progress - Only show if challenge is active and played */}
          {hasPlayed && !isExpired ? (
            <View style={[styles.completedContainer, { backgroundColor: '#4CAF5020' }]}>
              <Text style={[styles.completedText, { color: '#4CAF50' }]}>
                ✅ Daily Challenge Completed!
              </Text>
              {challengeResult?.bestTime && (
                <Text style={[styles.bestTime, { color: getContrastColor(colors.button) }]}>
                  Your Time: {formatTime(challengeResult.bestTime)}
                </Text>
              )}
              {challengeResult?.isPerfect && (
                <Text style={[styles.perfectBadge, { color: '#FFD700' }]}>
                  ✨ Perfect Game!
                </Text>
              )}
              <Text style={[styles.streakBonus, { color: getContrastColor(colors.button) }]}>
                🔥 Current Streak: {profile?.stats?.currentStreak || 0} days
              </Text>
            </View>
          ) : (
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: getContrastColor(colors.button) }]}>
                {isExpired 
                  ? "Today's challenge has expired. A new one is ready at UTC midnight!" 
                  : attempts > 0 
                    ? `Attempts today: ${attempts}` 
                    : 'Ready to start today\'s challenge!'}
              </Text>
            </View>
          )}

          {/* Start/View Results Button */}
          <TouchableOpacity 
            style={[
              styles.startButton, 
              { 
                backgroundColor: isExpired ? '#2E7D32' : (hasPlayed ? '#666' : '#2E7D32'),
              }
            ]}
            onPress={handleButtonPress}
            disabled={false} 
          >
            <Text style={styles.startButtonText}>
              {getButtonText()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Your Performance Section - Only show if played and challenge is active */}
        {hasPlayed && !isExpired && (
          <View style={[styles.performanceContainer, { backgroundColor: colors.button }]}>
            <Text style={[styles.performanceTitle, { color: getContrastColor(colors.button) }]}>
              📊 Your Performance
            </Text>
            
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                  Username
                </Text>
                <Text style={[styles.performanceValue, { color: getContrastColor(colors.button) }]}>
                  {profile?.username || profile?.name || 'Explorer'}
                </Text>
              </View>
              
              <View style={styles.performanceItem}>
                <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                  Best Time
                </Text>
                <Text style={[styles.performanceValue, { color: getContrastColor(colors.button) }]}>
                  {challengeResult?.bestTime ? formatTime(challengeResult.bestTime) : '--:--'}
                </Text>
              </View>
            </View>
            
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                  Accuracy
                </Text>
                <Text style={[styles.performanceValue, { color: getContrastColor(colors.button) }]}>
                  {challengeResult?.accuracy ? challengeResult.accuracy.toFixed(1) : '0'}%
                </Text>
              </View>
              
              <View style={styles.performanceItem}>
                <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                  Position
                </Text>
                <View style={styles.rankContainer}>
                  <Text style={[styles.performanceValue, { 
                    color: userRank === 1 ? '#FFD700' : 
                           userRank === 2 ? '#C0C0C0' : 
                           userRank === 3 ? '#CD7F32' : 
                           getContrastColor(colors.button),
                    fontWeight: userRank && userRank <= 3 ? 'bold' : 'normal',
                    marginRight: 4
                  }]}>
                    {getRankDisplay(userRank)}
                  </Text>
                  <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                    of {playerCount}
                  </Text>
                </View>
              </View>
            </View>
            
            {challengeResult?.moves && (
              <View style={styles.performanceRow}>
                <View style={styles.performanceItem}>
                  <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                    Total Moves
                  </Text>
                  <Text style={[styles.performanceValue, { color: getContrastColor(colors.button) }]}>
                    {challengeResult.moves}
                  </Text>
                </View>
                
                <View style={styles.performanceItem}>
                  <Text style={[styles.performanceLabel, { color: getContrastColor(colors.button), opacity: 0.7 }]}>
                    Perfect
                  </Text>
                  <Text style={[styles.performanceValue, { color: challengeResult?.isPerfect ? '#4CAF50' : getContrastColor(colors.button) }]}>
                    {challengeResult?.isPerfect ? '✨ Yes' : 'No'}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Show percentile for non-top positions */}
            {userRank && userRank > 3 && playerCount > 0 && (
              <View style={styles.percentileContainer}>
                <Text style={[styles.percentileText, { color: getContrastColor(colors.button), opacity: 0.8 }]}>
                  Top {Math.round((userRank / playerCount) * 100)}% of players
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ===== LEADERBOARD SECTION ===== */}
        {/* Only show leaderboard if challenge is active and user has played */}
        {hasPlayed && !isExpired && (
          <View style={[styles.leaderboardContainer, { backgroundColor: colors.button }]}>
            {/* Leaderboard Toggle Header */}
            <TouchableOpacity 
              style={styles.leaderboardHeader}
              onPress={() => setShowLeaderboard(!showLeaderboard)}
            >
              <Text style={[styles.leaderboardTitle, { color: getContrastColor(colors.button) }]}>
                🏆 Challenge Leaderboard
              </Text>
              <Text style={[styles.leaderboardToggle, { color: getContrastColor(colors.button) }]}>
                {showLeaderboard ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {/* Leaderboard Content (conditionally shown) */}
            {showLeaderboard && (
              <View style={styles.leaderboardContent}>
                <ChallengeLeaderboard challengeId={challengeId} />
              </View>
            )}
          </View>
        )}

        {/* Previous Days */}
        <View style={[styles.previousContainer, { backgroundColor: colors.button }]}>
          <Text style={[styles.previousTitle, { color: getContrastColor(colors.button) }]}>
            📅 Previous Daily Challenges
          </Text>
          {previousDays.map((puzzle, index) => (
            <View key={index} style={styles.previousPuzzle}>
              <Text style={[styles.previousDate, { color: getContrastColor(colors.button) }]}>
                {puzzle.date}
              </Text>
              <View style={styles.previousStatus}>
                <Text style={[styles.previousCompleted, { color: puzzle.completed ? '#4CAF50' : '#999' }]}>
                  {puzzle.completed ? '✓ Completed' : '— Not played'}
                </Text>
                {puzzle.time && (
                  <Text style={[styles.previousTime, { color: getContrastColor(colors.button), opacity: 0.8 }]}>
                    {formatTime(puzzle.time)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Daily Streak */}
        <View style={[styles.streakContainer, { backgroundColor: colors.button }]}>
          <Text style={[styles.streakTitle, { color: getContrastColor(colors.button) }]}>
            🔥 Daily Streak: {profile?.stats?.currentStreak || 0} days
          </Text>
          <Text style={[styles.streakText, { color: getContrastColor(colors.button), opacity: 0.9 }]}>
            {hasPlayed && !isExpired
              ? "Great job completing today's challenge! Come back tomorrow at UTC midnight for another one."
              : "Complete today's challenge to continue your streak!"}
          </Text>
          {profile?.stats?.longestStreak ? (
            <Text style={[styles.longestStreak, { color: getContrastColor(colors.button), opacity: 0.8 }]}>
              Longest streak: {profile.stats.longestStreak} days
            </Text>
          ) : null}
        </View>

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
  },
  utcNote: {
    fontSize: 12,
    marginTop: 5,
    textDecorationLine: 'underline',
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
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailBox: {
    width: '48%',
    marginBottom: 15,
  },
  detailLabel: {
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
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedContainer: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
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
  streakBonus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  progressContainer: {
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
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
  performanceContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentileContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  percentileText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  leaderboardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
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
  previousContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
  },
  previousTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  previousPuzzle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  previousDate: {
    fontSize: 16,
  },
  previousStatus: {
    alignItems: 'flex-end',
  },
  previousCompleted: {
    fontSize: 14,
    fontWeight: '500',
  },
  previousTime: {
    fontSize: 12,
    marginTop: 2,
  },
  streakContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  streakText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  longestStreak: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default DailyChallengeScreen;