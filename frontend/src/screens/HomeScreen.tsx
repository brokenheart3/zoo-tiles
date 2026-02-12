import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext, themeStyles } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useProfile } from '../context/ProfileContext';
import { goToPlay } from '../navigation/goToPlay';

// Import homescreen components
import {
  GreetingHeader,
  ChallengeCard,
  QuickPlayCard,
  FactCard,
  AchievementsList,
  StatsSummary,
  SettingsLink,
} from '../components/homescreen';
import { AppFooter } from '../components/common';

// Import services
import { getChallengePlayerCount } from '../services/simpleChallengeService';
import { getTimeRemaining, getWeekNumber } from '../utils/timeUtils';
import { fetchDailyAnimalFact } from '../services/api';


// Navigation types
type RootStackParamList = {
  Home: undefined;
  Play: {
    gridSize: string;
    difficulty: string;
    challengeType?: 'daily' | 'weekly';
    challengeId?: string;
  };
  Challenge: {
    screen: 'Daily' | 'Weekly';
  };
  Settings: undefined;
  Profile: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Grid size properties
const GRID_SIZE_PROPERTIES = {
  '6x6': { emoji: '🐘', difficulty: 'Easy', label: '6x6' },
  '8x8': { emoji: '🦒', difficulty: 'Medium', label: '8x8' },
  '10x10': { emoji: '🦁', difficulty: 'Hard', label: '10x10' },
  '12x12': { emoji: '🐯', difficulty: 'Expert', label: '12x12' },
};

// Difficulty colors
const DIFFICULTY_COLORS = {
  Easy: { bg: '#4CAF50', text: '#ffffff' },
  Medium: { bg: '#FF9800', text: '#ffffff' },
  Hard: { bg: '#F44336', text: '#ffffff' },
  Expert: { bg: '#9C27B0', text: '#ffffff' },
};

// Challenge type colors
const CHALLENGE_COLORS = {
  daily: { bg: '#4CAF50', text: '#ffffff' },
  weekly: { bg: '#2196F3', text: '#ffffff' },
};

// Default settings
const DEFAULT_SETTINGS = {
  gridSize: '8x8' as const,
  difficulty: 'Medium' as const,
};

// Helper to check if daily challenge is urgent
const isDailyChallengeUrgent = (timeString: string): boolean => {
  if (!timeString || timeString.includes('Loading')) return false;
  if (timeString.includes('Expired')) return true;
  
  const hasHours = timeString.includes('h');
  const hasDays = timeString.includes('d');
  
  if (hasDays) {
    const daysMatch = timeString.match(/(\d+)d/);
    if (daysMatch && parseInt(daysMatch[1]) === 0) return true;
  } else if (hasHours) {
    const hoursMatch = timeString.match(/(\d+)h/);
    if (hoursMatch && parseInt(hoursMatch[1]) === 0) return true;
  } else {
    return true; // Only minutes and seconds remaining
  }
  
  return false;
};

// Helper to check if weekly challenge is urgent
const isWeeklyChallengeUrgent = (timeString: string): boolean => {
  if (!timeString || timeString.includes('Loading')) return false;
  if (timeString.includes('Expired')) return true;
  
  const daysMatch = timeString.match(/(\d+)d/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    if (days === 0) return true;
    if (days === 1) {
      const hoursMatch = timeString.match(/(\d+)h/);
      if (hoursMatch && parseInt(hoursMatch[1]) < 12) return true;
    }
  }
  
  return false;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { settings } = useSettings();
  const { profile } = useProfile();
  
  const colors = themeStyles[theme];
  
  // State for user settings
  const [hasCustomSettings, setHasCustomSettings] = useState(false);
  
  // State for animal fact
  const [factData, setFactData] = useState<{
    displayFact: string;
    animalName: string;
    progress: string;
    loading: boolean;
    error?: string;
  }>({
    displayFact: 'Loading animal fact...',
    animalName: '',
    progress: '',
    loading: true,
  });
  
  // State for challenge data
  const [dailyChallengeData, setDailyChallengeData] = useState({
    remainingTime: 'Loading...',
    playerCount: 0,
    loading: true
  });
  
  const [weeklyChallengeData, setWeeklyChallengeData] = useState({
    remainingTime: 'Loading...',
    playerCount: 0,
    loading: true
  });

  // Current settings
  const currentGridSize = settings.gridSize || DEFAULT_SETTINGS.gridSize;
  const currentDifficulty = settings.difficulty || DEFAULT_SETTINGS.difficulty;
  const gridProperties = GRID_SIZE_PROPERTIES[currentGridSize];

  // Load animal fact from API
  // Load animal fact from API
  const loadAnimalFact = async (forceRefresh: boolean = false) => {
    setFactData(prev => ({ ...prev, loading: true }));

    try {
      const today = new Date().toDateString();
      const storedDate = await AsyncStorage.getItem('lastFactDate');
      const storedFactData = await AsyncStorage.getItem('dailyFactData');

      // Use cached fact if still valid
      if (!forceRefresh && storedDate === today && storedFactData) {
        const parsedData = JSON.parse(storedFactData);
        setFactData({
          displayFact: parsedData.displayFact,
          animalName: parsedData.animalName,
          progress: parsedData.progress || '',
          loading: false,
        });
        return;
      }

      // Fetch the new daily animal fact
      const factString = await fetchDailyAnimalFact();
      if (!factString) throw new Error('No fact returned');

      // Split into name and fact
      const [name, ...factParts] = factString.split(': ');
      const displayFact = factParts.join(': ');

      const progress = 'Daily animal fact';

      await AsyncStorage.setItem('lastFactDate', today);
      await AsyncStorage.setItem(
        'dailyFactData',
        JSON.stringify({
          displayFact,
          animalName: name,
          progress,
          fetchedAt: new Date().toISOString(),
        })
      );

      setFactData({
        displayFact,
        animalName: name,
        progress,
        loading: false,
      });
    } catch (error: any) {
      console.error('Error loading animal fact:', error.message);

      try {
        const storedFactData = await AsyncStorage.getItem('dailyFactData');
        if (storedFactData) {
          const parsedData = JSON.parse(storedFactData);
          setFactData({
            displayFact: parsedData.displayFact,
            animalName: parsedData.animalName,
            progress: 'Using cached fact',
            loading: false,
          });
          return;
        }
      } catch {}

      setFactData({
        displayFact: 'Failed to load animal fact. Please try again.',
        animalName: '',
        progress: 'Error',
        loading: false,
        error: error.message,
      });
    }
  };

  // Clear stored facts manually
  const clearStoredFacts = async () => {
    try {
      await AsyncStorage.removeItem('lastFactDate');
      await AsyncStorage.removeItem('dailyFactData');
      console.log('Stored facts cleared');
      // Reload fact
      await loadAnimalFact(true);
    } catch (error) {
      console.error('Error clearing stored facts:', error);
    }
  };

  // Load challenge data (player counts and timers)
  const loadChallengeData = async () => {
    try {
      // Load daily challenge data
      const dailyPlayerCount = await getChallengePlayerCount('daily');
      const dailyTimeRemaining = getTimeRemaining('daily');
      
      setDailyChallengeData({
        remainingTime: dailyTimeRemaining,
        playerCount: dailyPlayerCount,
        loading: false
      });

      // Load weekly challenge data
      const weeklyPlayerCount = await getChallengePlayerCount('weekly');
      const weeklyTimeRemaining = getTimeRemaining('weekly');
      
      setWeeklyChallengeData({
        remainingTime: weeklyTimeRemaining,
        playerCount: weeklyPlayerCount,
        loading: false
      });
    } catch (error) {
      console.error('Error loading challenge data:', error);
      // Fallback to placeholder data
      setDailyChallengeData({
        remainingTime: 'Error loading',
        playerCount: 2456,
        loading: false
      });
      setWeeklyChallengeData({
        remainingTime: 'Error loading',
        playerCount: 8921,
        loading: false
      });
    }
  };

  // Update timers every second and refresh data periodically
  useEffect(() => {
    loadChallengeData();
    loadAnimalFact();
    
    // Update timers every second
    const timerInterval = setInterval(() => {
      setDailyChallengeData(prev => ({
        ...prev,
        remainingTime: getTimeRemaining('daily')
      }));
      
      setWeeklyChallengeData(prev => ({
        ...prev,
        remainingTime: getTimeRemaining('weekly')
      }));
    }, 1000);

    // Refresh player counts every 30 seconds
    const dataRefreshInterval = setInterval(() => {
      loadChallengeData();
    }, 30000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(dataRefreshInterval);
    };
  }, []);

  // Check user settings on mount
  useEffect(() => {
    const checkUserSettings = async () => {
      try {
        const hasChangedSettings = await AsyncStorage.getItem('hasChangedSettings');
        setHasCustomSettings(hasChangedSettings === 'true');
      } catch (error) {
        console.error('Error checking settings:', error);
      }
    };
    
    checkUserSettings();
  }, []);

  // Smart greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';

    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    const firstName = profile?.name?.split(' ')[0] || 'Explorer';
    const puzzlesSolved = profile?.stats?.puzzlesSolved || 0;
    const currentStreak = profile?.stats?.currentStreak || 0;

    let subtitle = 'Ready for today\'s challenge?';

    // Only show puzzles solved & streak if user has played at least one puzzle
    if (puzzlesSolved > 0) {
      subtitle = `You've solved ${puzzlesSolved} puzzle${puzzlesSolved !== 1 ? 's' : ''}`;
      if (currentStreak > 0) {
        subtitle += ` • ${currentStreak} day streak`;
      }
    }

    const showSettingsPrompt = !hasCustomSettings;
    const showProfilePrompt = !profile?.name;

    const settingsPromptText = 'Customize your settings';
    const profilePromptText = 'Create a profile to save your progress';

    return {
      greeting: `${timeGreeting}, ${firstName}! 👋`,
      subtitle,
      showSettingsPrompt,
      showProfilePrompt,
      settingsPromptText,
      profilePromptText,
    };
  };

  const greetingData = getGreeting();
  
  // Challenge data with real values
  const dailyChallenge = {
    title: 'Daily Jungle Adventure',
    description: `Complete today's special ${currentGridSize} puzzle with jungle animals`,
    remainingTime: dailyChallengeData.remainingTime,
    players: dailyChallengeData.playerCount.toLocaleString(),
    emoji: '🐅',
    loading: dailyChallengeData.loading,
    isUrgent: isDailyChallengeUrgent(dailyChallengeData.remainingTime),
  };
  
  const weeklyChallenge = {
    title: 'Weekly Safari Expedition',
    description: `A special ${currentGridSize} puzzle available all week`,
    remainingTime: weeklyChallengeData.remainingTime,
    players: weeklyChallengeData.playerCount.toLocaleString(),
    emoji: '🦓',
    progress: '0/10',
    loading: weeklyChallengeData.loading,
    isUrgent: isWeeklyChallengeUrgent(weeklyChallengeData.remainingTime),
  };

  // Navigation handlers
  const handleDailyChallengePress = () => {
    navigation.navigate('Challenge', { screen: 'Daily' });
  };

  const handleWeeklyChallengePress = () => {
    navigation.navigate('Challenge', { screen: 'Weekly' });
  };

  const handleQuickPlayPress = () => {
    navigation.navigate('Play', {
      gridSize: currentGridSize,
      difficulty: currentDifficulty,
    });
  };

  const handlePlayDailyChallenge = () => {
    if (!dailyChallenge.remainingTime.includes('Expired')) {
      navigation.navigate('Play', {
        gridSize: currentGridSize,
        difficulty: 'Expert',
        challengeType: 'daily',
        challengeId: `daily-${new Date().toISOString().split('T')[0]}`,
      });
    }
  };

  const handlePlayWeeklyChallenge = () => {
    if (!weeklyChallenge.remainingTime.includes('Expired')) {
      navigation.navigate('Play', {
        gridSize: currentGridSize,
        difficulty: 'Expert',
        challengeType: 'weekly',
        challengeId: `weekly-${getWeekNumber(new Date())}`,
      });
    }
  };

  // Refresh fact manually
  const handleRefreshFact = async () => {
    await loadAnimalFact(true);
  };

  // Get fresh stats for new users (all zeros)
  const getFreshStats = () => {
    return {
      puzzlesSolved: 0,
      accuracy: 0,
      currentStreak: 0,
      totalPlayTime: 0,
      bestTime: 0,
      averageTime: 0,
      challengesCompleted: 0,
      perfectGames: 0
    };
  };

  // Get achievements for new users (all locked)
  const getFreshTrophies = () => {
    return [
      { id: 1, name: 'First Puzzle', description: 'Complete your first puzzle', unlocked: false, icon: '🏆' },
      { id: 2, name: 'Quick Solver', description: 'Solve a puzzle in under 5 minutes', unlocked: false, icon: '⚡'},
      { id: 3, name: 'Accuracy Master', description: 'Achieve 100% accuracy on any puzzle', unlocked: false, icon: '🎯' },
      { id: 4, name: 'Daily Streak', description: 'Complete 3 daily challenges in a row', unlocked: false, icon: '🔥' },
      { id: 5, name: 'Weekly Warrior', description: 'Complete a weekly challenge', unlocked: false, icon: '🛡️' },
    ];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <GreetingHeader
          greeting={greetingData.greeting}
          subtitle={greetingData.subtitle}
          showSettingsPrompt={greetingData.showSettingsPrompt}
          showProfilePrompt={greetingData.showProfilePrompt}
          settingsPromptText={greetingData.settingsPromptText}
          profilePromptText={greetingData.profilePromptText}
          themeColors={colors}
          onSettingsPress={() => navigation.navigate('Settings')}
          onProfilePress={() => navigation.navigate('Profile')}
        />

        {/* Daily Challenge */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Challenge</Text>
        <ChallengeCard
          type="daily"
          title={dailyChallenge.title}
          description={dailyChallenge.description}
          remainingTime={dailyChallenge.remainingTime}
          players={dailyChallenge.loading ? 'Loading...' : dailyChallenge.players}
          emoji={dailyChallenge.emoji}
          themeColors={colors}
          isUrgent={dailyChallenge.isUrgent}
          isLoading={dailyChallenge.loading}
          onPress={handleDailyChallengePress}   // view details
          onPlayPress={() => goToPlay(navigation, 'daily')} // play button
          challengeColors={CHALLENGE_COLORS}
        />

        {/* Weekly Challenge */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Challenge</Text>
        <ChallengeCard
          type="weekly"
          title={weeklyChallenge.title}
          description={weeklyChallenge.description}
          remainingTime={weeklyChallenge.remainingTime}
          players={weeklyChallenge.loading ? 'Loading...' : weeklyChallenge.players}
          emoji={weeklyChallenge.emoji}
          progress={weeklyChallenge.progress}
          themeColors={colors}
          isUrgent={weeklyChallenge.isUrgent}
          isLoading={weeklyChallenge.loading}
          onPress={handleWeeklyChallengePress} // view details
          onPlayPress={() => goToPlay(navigation, 'weekly')} // play button
          challengeColors={CHALLENGE_COLORS}
        />

        {/* Quick Play */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Play</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
          {hasCustomSettings 
            ? `Your preferred settings: ${currentGridSize} • ${currentDifficulty}`
            : `Default settings: ${currentGridSize} • ${currentDifficulty}`
          }
        </Text>
        
        <QuickPlayCard
          gridSize={currentGridSize}
          difficulty={currentDifficulty}
          emoji={gridProperties.emoji}
          hasCustomSettings={hasCustomSettings}
          themeColors={colors}
          difficultyColors={DIFFICULTY_COLORS}
          onPress={() => goToPlay(navigation, 'sequential')}
        />

        {/* Settings Link */}
        <SettingsLink
          hasCustomSettings={hasCustomSettings}
          themeColors={colors}
          onPress={() => navigation.navigate('Settings')}
        />

        {/* ✅ SINGLE Daily Animal Fact Section - NO DUPLICATE TITLE */}
        <View style={styles.factSectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            🐘 Daily Animal Fact
          </Text>
          {factData.animalName && !factData.loading && (
            <Text style={[styles.animalNameBadge, { 
              color: colors.text, 
              backgroundColor: colors.button 
            }]}>
              {factData.animalName}
            </Text>
          )}
        </View>
        
        <FactCard
          fact={factData.displayFact}
          themeColors={colors}
          isLoading={factData.loading}
          onRefresh={handleRefreshFact}
        />

        {/* Recent Achievements */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Achievements</Text>
        <AchievementsList
          trophies={getFreshTrophies()}
          themeColors={colors}
        />

        {/* Stats Summary */}
        <StatsSummary
          stats={getFreshStats()}
          unlockedTrophiesCount={0}
          themeColors={colors}
        />

        {/* Challenge Status Summary */}
        <View style={[styles.statusSummary, { backgroundColor: colors.button }]}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            📊 Live Challenge Status
          </Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>Daily Players</Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {dailyChallenge.loading ? '...' : dailyChallenge.players}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>Weekly Players</Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {weeklyChallenge.loading ? '...' : weeklyChallenge.players}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>Daily Ends In</Text>
              <Text style={[
                styles.timerValue, 
                { 
                  color: dailyChallenge.isUrgent ? '#FF5722' : colors.text,
                  fontWeight: dailyChallenge.isUrgent ? 'bold' : 'normal'
                }
              ]}>
                {dailyChallenge.remainingTime}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>Weekly Ends In</Text>
              <Text style={[
                styles.timerValue, 
                { 
                  color: weeklyChallenge.isUrgent ? '#FF5722' : colors.text,
                  fontWeight: weeklyChallenge.isUrgent ? 'bold' : 'normal'
                }
              ]}>
                {weeklyChallenge.remainingTime}
              </Text>
            </View>
          </View>
          <Text style={[styles.statusNote, { color: colors.text, opacity: 0.7 }]}>
            Updates every 30 seconds • Times shown in your local timezone
          </Text>
        </View>

        {/* Footer */}
        <AppFooter textColor={colors.text} version="1.0.0" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginHorizontal: 20,
    marginBottom: 15,
    opacity: 0.8,
  },
  factSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
  },
  animalNameBadge: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusSummary: {
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    borderRadius: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerValue: {
    fontSize: 18,
  },
  statusNote: {
    fontSize: 10,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default HomeScreen;