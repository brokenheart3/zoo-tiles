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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext, themeStyles } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { useProfile } from "../context/ProfileContext";
import AppFooter from "../components/common/AppFooter"; // <-- Added import

type RootStackParamList = {
  Play: {
    gridSize: string;
    difficulty: 'Expert';
    challengeType: 'weekly';
    challengeId?: string;
    key?: string;
  };
  Home: undefined;
};

type WeeklyChallengeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Play'>;

// Get week number for ID
const getWeekNumber = (date: Date): string => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7).toString();
};

const WeeklyChallengeScreen = () => {
  const navigation = useNavigation<WeeklyChallengeScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { settings } = useSettings();
  const { profile } = useProfile();
  
  const colors = themeStyles[theme];
  
  const [loading, setLoading] = useState(true);
  const [challengeData, setChallengeData] = useState({
    id: 'weekly-' + getWeekNumber(new Date()),
    title: 'Weekly Safari Expedition',
    description: 'A special expert-level puzzle available all week',
    // Weekly challenge uses user's grid size but ALWAYS Expert difficulty
    gridSize: settings.gridSize || '8x8',
    difficulty: 'Expert' as const,
    reward: 500,
    participants: 8921,
    // Time until next Monday
    timeRemaining: calculateTimeUntilMonday(),
    completed: false,
    bestTime: null as number | null,
    attempts: 0,
    // Weekly ranking
    userRank: 0,
    totalPlayers: 8921,
  });

  // Calculate time until next Monday 00:00
  function calculateTimeUntilMonday() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Days until next Monday (if today is Monday, show time until next week's Monday)
    let daysUntilMonday = day === 1 ? 7 : (8 - day) % 7;
    
    // Create date for next Monday
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    
    const diff = nextMonday.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  }

  useEffect(() => {
    loadChallengeProgress();
    // Update timer every minute
    const interval = setInterval(() => {
      setChallengeData(prev => ({
        ...prev,
        timeRemaining: calculateTimeUntilMonday(),
      }));
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadChallengeProgress = async () => {
    try {
      const weekNum = getWeekNumber(new Date());
      const stored = await AsyncStorage.getItem(`weeklyChallenge-${weekNum}-${settings.gridSize}`);
      
      if (stored) {
        const progress = JSON.parse(stored);
        setChallengeData(prev => ({
          ...prev,
          completed: progress.completed || false,
          bestTime: progress.bestTime || null,
          attempts: progress.attempts || 0,
          userRank: progress.userRank || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading weekly challenge progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = () => {
    navigation.navigate('Play', {
      gridSize: challengeData.gridSize,
      difficulty: 'Expert', // Always Expert for challenges
      challengeType: 'weekly',
      challengeId: challengeData.id,
      key: `weekly-${challengeData.id}-${Date.now()}`,
    });
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.button }]}>
          <Text style={[styles.title, { color: colors.text }]}>Weekly Challenge</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Week {getWeekNumber(new Date())} • Resets every Monday
          </Text>
        </View>

        {/* Weekly Challenge Card */}
        <View style={[styles.challengeCard, { backgroundColor: colors.button }]}>
          <View style={[styles.badge, { backgroundColor: '#2196F3' }]}>
            <Text style={styles.badgeText}>WEEKLY SPECIAL</Text>
          </View>
          
          <View style={styles.challengeHeader}>
            <Text style={[styles.challengeTitle, { color: colors.text }]}>
              {challengeData.title}
            </Text>
            <Text style={[styles.gridSizeBadge, { color: colors.text }]}>
              {challengeData.gridSize}
            </Text>
          </View>
          
          <Text style={[styles.challengeDesc, { color: colors.text }]}>
            {challengeData.description}
          </Text>

          {/* Challenge Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.text }]}>Difficulty</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: '#9C27B0' }]}>
                <Text style={styles.difficultyText}>EXPERT</Text>
              </View>
            </View>
            
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.text }]}>Reward</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                🏆 {challengeData.reward} pts
              </Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.text }]}>Time Left</Text>
              <Text style={[styles.timer, { color: '#2196F3' }]}>
                ⏰ {challengeData.timeRemaining}
              </Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.text }]}>Participants</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                👥 {challengeData.participants.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Your Performance */}
          <View style={[styles.performanceContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.performanceTitle, { color: colors.text }]}>Your Performance</Text>
            
            {challengeData.completed ? (
              <View style={styles.completedStats}>
                <Text style={[styles.completedText, { color: '#4CAF50' }]}>
                  ✅ Weekly Challenge Completed
                </Text>
                {challengeData.bestTime && (
                  <Text style={[styles.bestTime, { color: colors.text }]}>
                    Best Time: {formatTime(challengeData.bestTime)}
                  </Text>
                )}
                <Text style={[styles.rankText, { color: colors.text }]}>
                  Your Rank: #{challengeData.userRank || '--'}/{challengeData.totalPlayers.toLocaleString()}
                </Text>
                <Text style={[styles.rewardText, { color: colors.text }]}>
                  +{challengeData.reward} points earned
                </Text>
              </View>
            ) : (
              <View style={styles.incompleteStats}>
                <Text style={[styles.incompleteText, { color: colors.text }]}>
                  {challengeData.attempts > 0 
                    ? `Attempts this week: ${challengeData.attempts}` 
                    : 'Not attempted yet'}
                </Text>
                {challengeData.attempts > 0 && (
                  <Text style={[styles.attemptHint, { color: colors.text }]}>
                    Keep trying to improve your time!
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Start Button */}
          <TouchableOpacity 
            style={[
              styles.startButton, 
              { 
                backgroundColor: challengeData.completed ? '#666' : '#2196F3',
                opacity: challengeData.completed ? 0.7 : 1,
              }
            ]}
            onPress={handleStartChallenge}
            disabled={challengeData.completed}
          >
            <Text style={styles.startButtonText}>
              {challengeData.completed ? 'WEEKLY COMPLETED' : 'START WEEKLY CHALLENGE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard Preview */}
        <View style={[styles.leaderboardContainer, { backgroundColor: colors.button }]}>
          <Text style={[styles.leaderboardTitle, { color: colors.text }]}>
            🏆 Weekly Leaderboard
          </Text>
          <Text style={[styles.leaderboardText, { color: colors.text }]}>
            Complete the challenge to see your ranking!
          </Text>
          
          <View style={styles.leaderboardStats}>
            <View style={styles.leaderboardStat}>
              <Text style={[styles.leaderboardNumber, { color: colors.text }]}>
                {challengeData.totalPlayers.toLocaleString()}
              </Text>
              <Text style={[styles.leaderboardLabel, { color: colors.text }]}>Total Players</Text>
            </View>
            
            <View style={styles.leaderboardStat}>
              <Text style={[styles.leaderboardNumber, { color: colors.text }]}>
                {Math.floor(challengeData.totalPlayers * 0.35).toLocaleString()}
              </Text>
              <Text style={[styles.leaderboardLabel, { color: colors.text }]}>Completed</Text>
            </View>
            
            <View style={styles.leaderboardStat}>
              <Text style={[styles.leaderboardNumber, { color: colors.text }]}>
                02:45
              </Text>
              <Text style={[styles.leaderboardLabel, { color: colors.text }]}>Best Time</Text>
            </View>
          </View>
        </View>

        {/* Weekly Rewards Info */}
        <View style={[styles.rewardsContainer, { backgroundColor: colors.button }]}>
          <Text style={[styles.rewardsTitle, { color: colors.text }]}>Weekly Rewards</Text>
          <Text style={[styles.rewardsText, { color: colors.text }]}>
            • Complete for {challengeData.reward} base points{"\n"}
            • Extra 100 points for finishing in top 50%{"\n"}
            • Extra 200 points for finishing in top 25%{"\n"}
            • Extra 500 points for finishing in top 10%{"\n"}
            • Weekly badge for completion
          </Text>
        </View>
        <AppFooter />  {/* <-- Added footer here */}
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    opacity: 0.7,
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
  rankText: {
    fontSize: 15,
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 14,
    opacity: 0.9,
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
    opacity: 0.8,
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
  leaderboardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  leaderboardText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
  },
  leaderboardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  leaderboardStat: {
    alignItems: 'center',
  },
  leaderboardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  leaderboardLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  rewardsContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rewardsText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.9,
  },
});

export default WeeklyChallengeScreen;
