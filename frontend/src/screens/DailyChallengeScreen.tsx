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
    challengeType: 'daily';
    challengeId?: string;
  };
  Home: undefined;
};

type DailyChallengeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Play'>;

const DailyChallengeScreen = () => {
  const navigation = useNavigation<DailyChallengeScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { settings } = useSettings();
  const { profile } = useProfile();
  
  const colors = themeStyles[theme];
  
  const [loading, setLoading] = useState(true);
  const [challengeData, setChallengeData] = useState({
    id: 'daily-' + new Date().toISOString().split('T')[0],
    title: 'Daily Jungle Adventure',
    description: 'Complete today\'s expert-level animal puzzle',
    gridSize: settings.gridSize || '8x8',
    difficulty: 'Expert' as const,
    reward: 150,
    participants: 2456,
    timeRemaining: calculateTimeRemaining(),
    completed: false,
    bestTime: null as number | null,
    attempts: 0,
    previousPuzzles: [
      { date: 'Yesterday', completed: true, time: 245 },
      { date: '2 days ago', completed: true, time: 312 },
      { date: '3 days ago', completed: true, time: 198 },
    ],
  });

  function calculateTimeRemaining() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  useEffect(() => {
    loadChallengeProgress();
    const interval = setInterval(() => {
      setChallengeData(prev => ({
        ...prev,
        timeRemaining: calculateTimeRemaining(),
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadChallengeProgress = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = await AsyncStorage.getItem(`dailyChallenge-${today}-${settings.gridSize}`);
      
      if (stored) {
        const progress = JSON.parse(stored);
        setChallengeData(prev => ({
          ...prev,
          completed: progress.completed || false,
          bestTime: progress.bestTime || null,
          attempts: progress.attempts || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading challenge progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = () => {
    navigation.navigate('Play', {
      gridSize: challengeData.gridSize,
      difficulty: 'Expert',
      challengeType: 'daily',
      challengeId: challengeData.id,
    });
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
          <Text style={[styles.title, { color: colors.text }]}>Daily Challenge</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Today's Challenge Card */}
        <View style={[styles.challengeCard, { backgroundColor: colors.button }]}>
          <View style={[styles.badge, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.badgeText}>TODAY'S CHALLENGE</Text>
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
          
          {/* Challenge Details */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Difficulty</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: '#9C27B0' }]}>
                <Text style={styles.difficultyText}>EXPERT</Text>
              </View>
            </View>
            
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Reward</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                🏆 {challengeData.reward} pts
              </Text>
            </View>
            
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Time Left</Text>
              <Text style={[styles.timer, { color: '#FF5722' }]}>
                ⏰ {challengeData.timeRemaining}
              </Text>
            </View>
            
            <View style={styles.detailBox}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Players</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                👥 {challengeData.participants.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Your Progress */}
          {challengeData.completed ? (
            <View style={[styles.completedContainer, { backgroundColor: '#4CAF5020' }]}>
              <Text style={[styles.completedText, { color: '#4CAF50' }]}>
                ✅ Daily Challenge Completed!
              </Text>
              {challengeData.bestTime && (
                <Text style={[styles.bestTime, { color: colors.text }]}>
                  Your Time: {formatTime(challengeData.bestTime)}
                </Text>
              )}
              <Text style={[styles.rewardEarned, { color: colors.text }]}>
                +{challengeData.reward} points earned
              </Text>
            </View>
          ) : (
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: colors.text }]}>
                {challengeData.attempts > 0 
                  ? `Attempts today: ${challengeData.attempts}` 
                  : 'Ready to start today\'s challenge!'}
              </Text>
            </View>
          )}

          {/* Start Button */}
          <TouchableOpacity 
            style={[
              styles.startButton, 
              { 
                backgroundColor: challengeData.completed ? '#666' : '#4CAF50',
                opacity: challengeData.completed ? 0.7 : 1,
              }
            ]}
            onPress={handleStartChallenge}
            disabled={challengeData.completed}
          >
            <Text style={styles.startButtonText}>
              {challengeData.completed ? 'COMPLETED TODAY' : 'START DAILY CHALLENGE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Previous Days */}
        <View style={[styles.previousContainer, { backgroundColor: colors.button }]}>
          <Text style={[styles.previousTitle, { color: colors.text }]}>
            📅 Previous Daily Challenges
          </Text>
          {challengeData.previousPuzzles.map((puzzle, index) => (
            <View key={index} style={styles.previousPuzzle}>
              <Text style={[styles.previousDate, { color: colors.text }]}>
                {puzzle.date}
              </Text>
              <View style={styles.previousStatus}>
                <Text style={[styles.previousCompleted, { color: '#4CAF50' }]}>
                  {puzzle.completed ? '✓ Completed' : '–'}
                </Text>
                {puzzle.time && (
                  <Text style={[styles.previousTime, { color: colors.text }]}>
                    {formatTime(puzzle.time)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Daily Streak */}
        <View style={[styles.streakContainer, { backgroundColor: colors.button }]}>
          <Text style={[styles.streakTitle, { color: colors.text }]}>
            🔥 Daily Streak: {profile?.stats?.currentStreak || 0} days
          </Text>
          <Text style={[styles.streakText, { color: colors.text }]}>
            Complete today's challenge to continue your streak!
          </Text>
        </View>

        {/* Add Footer */}
        <AppFooter />  {/* <-- Added footer here */}
      </ScrollView>
    </SafeAreaView>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
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
  rewardEarned: {
    fontSize: 14,
    opacity: 0.9,
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
    opacity: 0.8,
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
    opacity: 0.9,
  },
});

export default DailyChallengeScreen;