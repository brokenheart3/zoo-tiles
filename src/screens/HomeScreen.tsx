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

// Import homescreen components using barrel export
import {
  GreetingHeader,
  ChallengeCard,
  QuickPlayCard,
  FactCard,
  AchievementsList,
  StatsSummary,
  SettingsLink,
} from '../components/homescreen';

// Import common footer component
import { AppFooter } from '../components/common';

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

// Animal facts
const ANIMAL_FACTS = [
  '🐘 Elephants have the longest pregnancy—nearly 22 months!',
  '🦒 Giraffes only need 5-30 minutes of sleep per day!',
  '🦁 A lion\'s roar can be heard from 5 miles away.',
  '🐯 Tiger stripes are unique like fingerprints.',
  '🐼 Pandas spend 14 hours a day eating bamboo.',
  '🐬 Dolphins have names for each other.',
  '🦓 A zebra\'s stripes are as unique as fingerprints.',
  '🦍 Gorillas can catch human colds.',
  '🐧 Penguins propose with pebbles.',
  '🦉 Owls can rotate necks 270 degrees.',
  '🦥 Sloths come down from trees once a week.',
  '🦘 Kangaroos can\'t walk backwards.',
  '🦊 Foxes use Earth\'s magnetic field to hunt.',
  '🐝 Honey bees communicate by dancing.',
  '🦋 Butterflies taste with their feet.',
];

// Get today's animal fact
const getFactOfTheDay = (): string => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return ANIMAL_FACTS[dayOfYear % ANIMAL_FACTS.length];
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { settings } = useSettings();
  const { profile } = useProfile();
  
  const colors = themeStyles[theme];
  
  // Check if user has customized settings
  const [hasCustomSettings, setHasCustomSettings] = useState(false);
  
  // Use settings or defaults
  const currentGridSize = settings.gridSize || DEFAULT_SETTINGS.gridSize;
  const currentDifficulty = settings.difficulty || DEFAULT_SETTINGS.difficulty;
  
  // Get current grid size properties
  const gridProperties = GRID_SIZE_PROPERTIES[currentGridSize];
  
  // State for animal fact
  const [animalFact, setAnimalFact] = useState<string>('');
  
  // State for challenge timers
  const [dailyTimer] = useState('14:22:05');
  const [weeklyTimer] = useState('4 days, 6:45:12');

  // Check settings on mount
  useEffect(() => {
    checkUserSettings();
    loadAnimalFact();
  }, []);

  const checkUserSettings = async () => {
    try {
      const hasChangedSettings = await AsyncStorage.getItem('hasChangedSettings');
      setHasCustomSettings(hasChangedSettings === 'true');
    } catch (error) {
      console.error('Error checking settings:', error);
    }
  };

  const loadAnimalFact = async () => {
    try {
      const today = new Date().toDateString();
      const storedDate = await AsyncStorage.getItem('lastFactDate');
      const storedFact = await AsyncStorage.getItem('dailyFact');
      
      if (storedDate === today && storedFact) {
        setAnimalFact(storedFact);
      } else {
        const newFact = getFactOfTheDay();
        setAnimalFact(newFact);
        
        await AsyncStorage.setItem('lastFactDate', today);
        await AsyncStorage.setItem('dailyFact', newFact);
      }
    } catch (error) {
      console.error('Error loading animal fact:', error);
      setAnimalFact(getFactOfTheDay());
    }
  };

  // Smart greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';
    
    // Check if user has set up profile
    if (!profile?.name) {
      return {
        greeting: `${timeGreeting}, Adventurer! 👋`,
        subtitle: 'Welcome to Zoo-Tiles!',
        showSettingsPrompt: !hasCustomSettings,
        showProfilePrompt: true,
        settingsPromptText: 'Configure your game settings first',
        profilePromptText: 'Create a profile to save your progress',
      };
    }
    
    const firstName = profile.name.split(' ')[0];
    
    // Check if it's a generic/default name
    const defaultNames = ['player', 'user', 'guest', 'new user'];
    if (defaultNames.includes(firstName.toLowerCase())) {
      return {
        greeting: `${timeGreeting}, Explorer! 👋`,
        subtitle: 'Ready for today\'s animal puzzles?',
        showSettingsPrompt: !hasCustomSettings,
        showProfilePrompt: true,
        settingsPromptText: 'Customize your game experience',
        profilePromptText: 'Personalize your profile',
      };
    }
    
    // Personalized greeting for returning users
    const puzzlesSolved = profile?.stats?.puzzlesSolved || 0;
    const currentStreak = profile?.stats?.currentStreak || 0;
    
    let subtitle = 'Ready for today\'s challenge?';
    if (puzzlesSolved > 0) {
      subtitle = `You've solved ${puzzlesSolved} puzzle${puzzlesSolved !== 1 ? 's' : ''}`;
      if (currentStreak > 0) {
        subtitle += ` • ${currentStreak} day streak`;
      }
    }
    
    return {
      greeting: `${timeGreeting}, ${firstName}! 👋`,
      subtitle,
      showSettingsPrompt: !hasCustomSettings,
      showProfilePrompt: false,
      settingsPromptText: 'Customize your settings',
      profilePromptText: '',
    };
  };

  const greetingData = getGreeting();
  
  // Challenge data
  const dailyChallenge = {
    title: 'Daily Jungle Adventure',
    description: `Complete today's special ${currentGridSize} puzzle with jungle animals`,
    remainingTime: dailyTimer,
    players: '2,456',
    emoji: '🐅',
    progress: undefined,
  };
  
  const weeklyChallenge = {
    title: 'Weekly Safari Expedition',
    description: `A special ${currentGridSize} puzzle available all week`,
    remainingTime: weeklyTimer,
    players: '8,921',
    emoji: '🦓',
    progress: '3/10',
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
    navigation.navigate('Play', {
      gridSize: currentGridSize,
      difficulty: 'Expert',
      challengeType: 'daily',
      challengeId: `daily-${new Date().toISOString().split('T')[0]}`,
    });
  };

  const handlePlayWeeklyChallenge = () => {
    navigation.navigate('Play', {
      gridSize: currentGridSize,
      difficulty: 'Expert',
      challengeType: 'weekly',
      challengeId: `weekly-${getWeekNumber(new Date())}`,
    });
  };

  const getWeekNumber = (date: Date): string => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7).toString();
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
          players={dailyChallenge.players}
          emoji={dailyChallenge.emoji}
          themeColors={colors}
          onPress={handleDailyChallengePress}
          onPlayPress={handlePlayDailyChallenge}
          challengeColors={CHALLENGE_COLORS}
        />

        {/* Weekly Challenge */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Challenge</Text>
        <ChallengeCard
          type="weekly"
          title={weeklyChallenge.title}
          description={weeklyChallenge.description}
          remainingTime={weeklyChallenge.remainingTime}
          players={weeklyChallenge.players}
          emoji={weeklyChallenge.emoji}
          progress={weeklyChallenge.progress}
          themeColors={colors}
          onPress={handleWeeklyChallengePress}
          onPlayPress={handlePlayWeeklyChallenge}
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
          onPress={handleQuickPlayPress}
        />

        {/* Settings Link */}
        <SettingsLink
          hasCustomSettings={hasCustomSettings}
          themeColors={colors}
          onPress={() => navigation.navigate('Settings')}
        />

        {/* Animal Fact */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Animal Fact of the Day</Text>
        <FactCard
          fact={animalFact || getFactOfTheDay()}
          themeColors={colors}
        />

        {/* Recent Achievements */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Achievements</Text>
        <AchievementsList
          trophies={profile?.trophies || []}
          themeColors={colors}
        />

        {/* Stats Summary */}
        <StatsSummary
          stats={profile?.stats || { puzzlesSolved: 0, accuracy: 0, currentStreak: 0 }}
          unlockedTrophiesCount={profile?.trophies?.filter(t => t.unlocked).length || 0}
          themeColors={colors}
        />

        {/* Footer - Using the new AppFooter component */}
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
  }
});

export default HomeScreen;