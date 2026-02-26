// src/screens/GameResultsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, themeStyles } from '../context/ThemeContext';

// Define the navigation param list
type RootStackParamList = {
  Main: undefined;  // This is the tab navigator
  Home: undefined;
  Play: {
    gridSize: string;
    difficulty: string;
    mode?: string;
  };
  GameResults: {
    time: number;
    isPerfect: boolean;
    mode: string;
    difficulty: string;
    gridSize: string;
    moves?: number;
    correctMoves?: number;
    wrongMoves?: number;
    accuracy?: number;
  };
  ChallengeResults: {
    challengeId: string;
    challengeType: 'daily' | 'weekly';
    time?: number;
    isPerfect?: boolean;
    moves?: number;
    correctMoves?: number;
    wrongMoves?: number;
    accuracy?: number;
    completed?: boolean;
  };
};

type GameResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameResults'>;

interface GameResultsParams {
  time: number;
  isPerfect: boolean;
  mode: string;
  difficulty: string;
  gridSize: string;
  moves?: number;
  correctMoves?: number;
  wrongMoves?: number;
  accuracy?: number;
}

const GameResultsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<GameResultsScreenNavigationProp>();
  const { theme } = React.useContext(ThemeContext);
  const colors = themeStyles[theme];
  
  const params = route.params as GameResultsParams;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return colors.text;
    if (accuracy >= 95) return '#4CAF50';
    if (accuracy >= 80) return '#2196F3';
    if (accuracy >= 60) return '#FF9800';
    return '#F44336';
  };

  const getAccuracyMessage = (accuracy?: number) => {
    if (!accuracy) return 'Keep playing to see your accuracy!';
    if (accuracy >= 95) return '🌟 Excellent! Nearly perfect!';
    if (accuracy >= 80) return '📊 Good accuracy! Keep it up!';
    if (accuracy >= 60) return '👍 You\'re getting better!';
    return '💪 Keep practicing!';
  };

  const handleBackToHome = () => {
    // Navigate to the Main tab which contains Home
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'Main' }, // This goes to BottomTabs which has Home as first screen
        ],
      })
    );
  };

  const handlePlayAgain = () => {
    // Navigate to Play screen with same settings
    navigation.navigate('Play', {
      gridSize: params?.gridSize || '8x8',
      difficulty: params?.difficulty || 'Medium',
      mode: 'sequential',
    });
  };

  // Arrow now uses the same function as Back to Home button
  const handleArrowPress = () => {
    handleBackToHome(); // Directly go to Home instead of trying to go back
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleArrowPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Game Results</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Game Info Card */}
        <View style={[styles.gameCard, { backgroundColor: colors.button }]}>
          <Text style={styles.gameEmoji}>🎮</Text>
          <Text style={[styles.gameTitle, { color: colors.text }]}>
            {params?.mode === 'daily' ? 'Daily Challenge' : 
             params?.mode === 'weekly' ? 'Weekly Challenge' : 'Quick Play'}
          </Text>
          <Text style={[styles.gameSubtitle, { color: colors.text }]}>
            {params?.gridSize} • {params?.difficulty}
          </Text>
          {params?.isPerfect && (
            <View style={styles.perfectBadge}>
              <Text style={styles.perfectBadgeText}>✨ PERFECT GAME ✨</Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Time Card */}
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {params ? formatTime(params.time) : '0:00'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Time</Text>
          </View>

          {/* Moves Card (if available) */}
          {params?.moves !== undefined && (
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {params.moves}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Total Moves</Text>
            </View>
          )}

          {/* Accuracy Card (if available) */}
          {params?.accuracy !== undefined && (
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statValue, { color: getAccuracyColor(params.accuracy) }]}>
                {params.accuracy.toFixed(1)}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Accuracy</Text>
            </View>
          )}

          {/* Correct/Wrong Card (if available) */}
          {params?.correctMoves !== undefined && params?.wrongMoves !== undefined && (
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={styles.correctWrongRow}>
                <Text style={[styles.correctText, { color: '#4CAF50' }]}>
                  ✓ {params.correctMoves}
                </Text>
                <Text style={[styles.wrongText, { color: '#F44336' }]}>
                  ✗ {params.wrongMoves}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.text }]}>Correct/Wrong</Text>
            </View>
          )}
        </View>

        {/* Accuracy Breakdown (if available) */}
        {params?.accuracy !== undefined && params?.moves !== undefined && (
          <View style={[styles.accuracyCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.accuracyTitle, { color: colors.text }]}>
              Accuracy Breakdown
            </Text>
            <View style={styles.accuracyBar}>
              <View 
                style={[
                  styles.accuracyFill, 
                  { 
                    width: `${params.accuracy}%`,
                    backgroundColor: getAccuracyColor(params.accuracy)
                  }
                ]} 
              />
            </View>
            <View style={styles.accuracyStats}>
              <Text style={[styles.accuracyStatText, { color: colors.text }]}>
                Correct: {params.correctMoves || 0}
              </Text>
              <Text style={[styles.accuracyStatText, { color: colors.text }]}>
                Wrong: {params.wrongMoves || 0}
              </Text>
              <Text style={[styles.accuracyStatText, { color: colors.text }]}>
                Total: {params.moves}
              </Text>
            </View>
            <Text style={[styles.accuracyMessage, { color: colors.text }]}>
              {getAccuracyMessage(params.accuracy)}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.button }]}
            onPress={handlePlayAgain}
          >
            <Text style={[styles.primaryButtonText, { color: colors.text }]}>
              Play Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.button }]}
            onPress={handleBackToHome}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Back to Home
            </Text>
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
  gameCard: {
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
  gameEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gameSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  perfectBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 5,
  },
  perfectBadgeText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
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
    fontSize: 24,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  wrongText: {
    fontSize: 18,
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
    marginBottom: 12,
  },
  accuracyStatText: {
    fontSize: 14,
    fontWeight: '600',
  },
  accuracyMessage: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
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

export default GameResultsScreen;