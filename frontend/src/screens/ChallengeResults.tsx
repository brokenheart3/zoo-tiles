// src/screens/ChallengeResults.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { ThemeContext, themeStyles } from '../context/ThemeContext';
import { getUserChallengeResult } from '../services/userService';
import { auth } from '../services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';

type ChallengeResultsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChallengeResults'>;

interface ChallengeResult {
  completed?: boolean;
  bestTime?: number;
  moves?: number;
  correctMoves?: number;
  wrongMoves?: number;
  accuracy?: number;
  isPerfect?: boolean;
  completedAt?: string;
}

const ChallengeResults = () => {
  const navigation = useNavigation<ChallengeResultsScreenNavigationProp>();
  const route = useRoute<any>();
  const { theme } = React.useContext(ThemeContext);
  const colors = themeStyles[theme];

  const { challengeId, challengeType, time, isPerfect, moves, correctMoves, wrongMoves, accuracy, completed } = route.params || {};
  
  // Debug log to see what params are received
  console.log('📊 ChallengeResults - Received params:', route.params);

  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDaily = challengeType === 'daily';
  const challengeName = isDaily ? 'Daily Challenge' : 'Weekly Challenge';

  useEffect(() => {
    loadResult();
  }, [challengeId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      
      // If we have params from navigation, use them first
      if (time !== undefined && moves !== undefined) {
        // Calculate accuracy if not provided
        const calculatedAccuracy = accuracy !== undefined ? accuracy :
          (correctMoves !== undefined && moves !== undefined && moves > 0) 
            ? (correctMoves / moves) * 100 
            : 0;
        
        setResult({
          completed: completed || true,
          bestTime: time,
          moves: moves,
          correctMoves: correctMoves || 0,
          wrongMoves: wrongMoves || 0,
          accuracy: Math.min(calculatedAccuracy, 100),
          isPerfect: isPerfect || (wrongMoves === 0 && moves > 0) || false,
          completedAt: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      // Otherwise try to fetch from Firebase
      if (!user || !challengeId) {
        setError('No challenge data found');
        setLoading(false);
        return;
      }

      const challengeResult = await getUserChallengeResult(user.uid, challengeId);
      if (challengeResult) {
        setResult(challengeResult as ChallengeResult);
      } else {
        setError('No results found for this challenge');
      }
    } catch (err) {
      console.error('Error loading challenge result:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return colors.text;
    if (accuracy >= 95) return '#4CAF50'; // Green - Excellent
    if (accuracy >= 80) return '#2196F3'; // Blue - Good
    if (accuracy >= 60) return '#FF9800'; // Orange - Average
    return '#F44336'; // Red - Needs practice
  };

  const getAnimalEmoji = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = dayNames[new Date().getDay()];
    
    const DAILY_ANIMALS: Record<string, string> = {
      Monday: '🐒', Tuesday: '🐯', Wednesday: '🦒',
      Thursday: '🐘', Friday: '🦁', Saturday: '🐼', Sunday: '🦓'
    };
    
    const WEEKLY_ANIMALS = ['🦁', '🐘', '🦒', '🦓', '🐅', '🦍', '🐊', '🦏', '🐆', '🦛'];
    
    if (isDaily) {
      return DAILY_ANIMALS[today] || '🦓';
    } else {
      const weekNum = parseInt(getWeekNumber(new Date()));
      return WEEKLY_ANIMALS[(weekNum - 1) % WEEKLY_ANIMALS.length];
    }
  };

  function getWeekNumber(date: Date): string {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return String(Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7));
  }

  const handleBackToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'Main' },
        ],
      })
    );
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      handleBackToHome();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.button} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // In ChallengeResults.tsx, add a retry button in the error state
  if (error || !result) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.text} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error || 'No results found'}</Text>
          
          <View style={styles.errorButtons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.button, marginRight: 10 }]}
              onPress={loadResult}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Retry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.button }]}
              onPress={handleBackToHome}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Challenge Results</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Challenge Info Card */}
        <View style={[styles.challengeCard, { backgroundColor: colors.button }]}>
          <Text style={styles.challengeEmoji}>{getAnimalEmoji()}</Text>
          <Text style={[styles.challengeTitle, { color: colors.text }]}>{challengeName}</Text>
          <Text style={[styles.challengeDate, { color: colors.text }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          {result.completedAt && (
            <Text style={[styles.completedDate, { color: colors.text }]}>
              Completed: {new Date(result.completedAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Stats Grid - 4 cards: Time, Moves, Accuracy, Correct/Wrong */}
        <View style={styles.statsGrid}>
          {/* Time Card */}
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatTime(result.bestTime)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Best Time</Text>
          </View>

          {/* Moves Card */}
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {result.moves || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Total Moves</Text>
          </View>

          {/* Accuracy Card */}
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: getAccuracyColor(result.accuracy) }]}>
              {result.accuracy !== undefined && result.accuracy !== null 
                ? `${result.accuracy.toFixed(1)}%` 
                : '--'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Accuracy</Text>
          </View>

          {/* Correct/Wrong Card */}
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={styles.correctWrongRow}>
              <Text style={[styles.correctText, { color: '#4CAF50' }]}>
                ✓ {result.correctMoves || 0}
              </Text>
              <Text style={[styles.wrongText, { color: '#F44336' }]}>
                ✗ {result.wrongMoves || 0}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.text }]}>Correct/Wrong</Text>
          </View>
        </View>

        {/* Accuracy Breakdown Bar */}
        {result.accuracy !== undefined && result.accuracy !== null && (
          <View style={[styles.accuracyCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.accuracyTitle, { color: colors.text }]}>Accuracy Breakdown</Text>
            <View style={styles.accuracyBar}>
              <View 
                style={[
                  styles.accuracyFill, 
                  { 
                    width: `${result.accuracy}%`,
                    backgroundColor: getAccuracyColor(result.accuracy)
                  }
                ]} 
              />
            </View>
            <View style={styles.accuracyStats}>
              <Text style={[styles.accuracyStatText, { color: colors.text }]}>
                Correct: {result.correctMoves || 0}
              </Text>
              <Text style={[styles.accuracyStatText, { color: colors.text }]}>
                Wrong: {result.wrongMoves || 0}
              </Text>
              <Text style={[styles.accuracyStatText, { color: colors.text }]}>
                Total: {result.moves || 0}
              </Text>
            </View>
          </View>
        )}

        {/* Perfect Game Badge */}
        {result.isPerfect && (
          <View style={[styles.perfectCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.perfectText, { color: '#4CAF50' }]}>
              ✨ PERFECT GAME! ✨
            </Text>
            <Text style={[styles.perfectSubtext, { color: colors.text }]}>
              No wrong moves - Outstanding!
            </Text>
          </View>
        )}

        {/* Back to Home Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.homeButton, { backgroundColor: colors.button }]}
            onPress={handleBackToHome}
          >
            <Text style={[styles.homeButtonText, { color: colors.text }]}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social" size={20} color={colors.text} />
          <Text style={[styles.shareText, { color: colors.text }]}>Share Result</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
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
  errorButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  challengeCard: {
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  challengeEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  challengeDate: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  correctWrongRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  correctText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  wrongText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  accuracyCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  accuracyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  accuracyBar: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  accuracyFill: {
    height: '100%',
    borderRadius: 10,
  },
  accuracyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  accuracyStatText: {
    fontSize: 14,
    fontWeight: '600',
  },
  perfectCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  perfectText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  perfectSubtext: {
    fontSize: 14,
    opacity: 0.8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  homeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  shareText: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.7,
  },
});

export default ChallengeResults;