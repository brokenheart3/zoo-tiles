// src/screens/HomeScreen.tsx
import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
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
import { getTimeRemaining, getWeekNumber, getUTCDateString } from '../utils/timeUtils';
import { fetchDailyAnimalFact } from '../services/api';
import { getHomePageData, getStatisticsData, getUserChallengeResult } from '../services/userService';
import { auth } from '../services/firebase';

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
    challengeId?: string;
    viewResults?: boolean;
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

// Default settings
const DEFAULT_SETTINGS = {
  gridSize: '8x8' as const,
  difficulty: 'Medium' as const,
};

// Daily challenge animals (different for each day)
const DAILY_ANIMALS = {
  Monday: { emoji: '🐒', name: 'Monkey' },
  Tuesday: { emoji: '🐯', name: 'Tiger' },
  Wednesday: { emoji: '🦒', name: 'Giraffe' },
  Thursday: { emoji: '🐘', name: 'Elephant' },
  Friday: { emoji: '🦁', name: 'Lion' },
  Saturday: { emoji: '🐼', name: 'Panda' },
  Sunday: { emoji: '🦓', name: 'Zebra' },
};

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

// Helper to get today's animal
const getTodayAnimal = () => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[new Date().getDay()];
  return DAILY_ANIMALS[today as keyof typeof DAILY_ANIMALS] || { emoji: '🦓', name: 'Zebra' };
};

// Helper to get this week's animal
const getWeekAnimal = () => {
  const weekNum = parseInt(getWeekNumber(new Date()));
  const index = (weekNum - 1) % WEEKLY_ANIMALS.length;
  return WEEKLY_ANIMALS[index];
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
    return true;
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

// Helper for pluralization
const pluralize = (count: number, singular: string, plural: string) => {
  return count === 1 ? singular : plural;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { settings } = useSettings();
  const { profile } = useProfile();
  
  const colors = themeStyles[theme];
  
  // Get today's and this week's animals
  const todayAnimal = getTodayAnimal();
  const weekAnimal = getWeekAnimal();
  
  // State for user settings
  const [hasCustomSettings, setHasCustomSettings] = useState(false);
  
  // State for local storage data
  const [homeStats, setHomeStats] = useState({
    puzzlesSolved: 0,
    accuracy: 0,
    currentStreak: 0,
    trophies: 0,
    recentChallenges: [] as Array<{date: string, solved: boolean, time?: number, reward?: number}>
  });
  
  const [achievements, setAchievements] = useState<Array<{
    id: number;
    name: string;
    description: string;
    unlocked: boolean;
    progress: number;
    icon: string;
    unlockDate?: string;
  }>>([]);
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
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

  // State for tracking if user played challenges
  const [dailyPlayed, setDailyPlayed] = useState(false);
  const [weeklyPlayed, setWeeklyPlayed] = useState(false);
  const [dailyResult, setDailyResult] = useState<any>(null);
  const [weeklyResult, setWeeklyResult] = useState<any>(null);

  // State for expiration
  const [isDailyExpired, setIsDailyExpired] = useState(false);
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Current settings
  const currentGridSize = settings.gridSize || DEFAULT_SETTINGS.gridSize;
  const currentDifficulty = settings.difficulty || DEFAULT_SETTINGS.difficulty;
  const gridProperties = GRID_SIZE_PROPERTIES[currentGridSize as keyof typeof GRID_SIZE_PROPERTIES];

  // ======================
  // Load stats from profile context
  // ======================
  const loadStatsFromProfile = () => {
    if (profile) {
      console.log('📊 Loading stats from profile context:', {
        puzzlesSolved: profile.stats.puzzlesSolved,
        dailyChallengesCompleted: profile.stats.dailyChallengesCompleted,
        weeklyChallengesCompleted: profile.stats.weeklyChallengesCompleted,
        accuracy: profile.stats.accuracy,
        currentStreak: profile.stats.currentStreak,
        trophies: profile.trophies.filter(t => t.unlocked).length
      });
      
      setHomeStats({
        puzzlesSolved: profile.stats.puzzlesSolved || 0,
        accuracy: profile.stats.accuracy || 0,
        currentStreak: profile.stats.currentStreak || 0,
        trophies: profile.trophies.filter(t => t.unlocked).length || 0,
        recentChallenges: []
      });
    }
  };

  // Load achievements from profile trophies
  const loadAchievementsFromProfile = () => {
    if (profile && profile.trophies) {
      console.log('🏆 Loading achievements from profile trophies:', profile.trophies.length);
      
      const achievementsArray = profile.trophies.map((trophy, index) => ({
        id: index + 1,
        name: trophy.name,
        description: trophy.description,
        unlocked: trophy.unlocked,
        progress: trophy.unlocked ? 1 : 0,
        icon: trophy.icon,
        unlockDate: trophy.unlockDate
      }));
      
      setAchievements(achievementsArray);
    }
  };

  // Load local stats (for achievements and fallback)
  const loadLocalStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Load from profile context
      loadStatsFromProfile();
      
      // Load achievements from profile trophies
      loadAchievementsFromProfile();
      
      // Also try to get from Firebase for additional data
      const user = auth.currentUser;
      const statsData = await getStatisticsData(user?.uid || null);
      
      if (statsData?.achievements) {
        console.log('🏆 Firebase achievements data:', statsData.achievements);
      }
    } catch (error) {
      console.error('Error loading local stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load challenge played status
  const loadChallengeStatus = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('👤 No user logged in');
        return;
      }

      // Use UTC date for daily challenge ID to match DailyChallengeScreen
      const todayId = `daily-${getUTCDateString()}`;
      console.log('🔍 Checking daily challenge with UTC ID:', todayId);
      const dailyResult = await getUserChallengeResult(user.uid, todayId);
      console.log('📊 Daily result:', dailyResult);
      
      if (dailyResult && dailyResult.completed) {
        console.log('✅ Daily challenge completed!');
        setDailyPlayed(true);
        setDailyResult(dailyResult);
      } else {
        console.log('❌ Daily challenge not completed');
        setDailyPlayed(false);
        setDailyResult(null);
      }

      // Check weekly challenge
      const weekId = `weekly-${getWeekNumber(new Date())}`;
      console.log('🔍 Checking weekly challenge:', weekId);
      const weeklyResult = await getUserChallengeResult(user.uid, weekId);
      console.log('📊 Weekly result:', weeklyResult);
      
      if (weeklyResult && weeklyResult.completed) {
        console.log('✅ Weekly challenge completed!');
        setWeeklyPlayed(true);
        setWeeklyResult(weeklyResult);
      } else {
        console.log('❌ Weekly challenge not completed');
        setWeeklyPlayed(false);
        setWeeklyResult(null);
      }
    } catch (error) {
      console.error('Error loading challenge status:', error);
    }
  };

  // Load animal fact from API
  const loadAnimalFact = async (forceRefresh: boolean = false) => {
    setFactData(prev => ({ ...prev, loading: true }));

    try {
      const today = new Date().toDateString();
      const storedDate = await AsyncStorage.getItem('lastFactDate');
      const storedFactData = await AsyncStorage.getItem('dailyFactData');

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

      const factString = await fetchDailyAnimalFact();
      if (!factString) throw new Error('No fact returned');

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

  // Load challenge data (player counts and timers)
  const loadChallengeData = async () => {
    try {
      console.log('📊 Loading challenge player counts...');
      
      const dailyPlayerCount = await getChallengePlayerCount('daily');
      const dailyTimeRemaining = getTimeRemaining('daily');
      console.log('⏰ DAILY TIME REMAINING:', dailyTimeRemaining);
      const dailyExpired = dailyTimeRemaining.includes('Expired');
      
      console.log('📊 Daily player count:', dailyPlayerCount);
      console.log('📊 Daily expired:', dailyExpired);
      
      setDailyChallengeData({
        remainingTime: dailyTimeRemaining,
        playerCount: dailyPlayerCount,
        loading: false
      });
      setIsDailyExpired(dailyExpired);

      const weeklyPlayerCount = await getChallengePlayerCount('weekly');
      const weeklyTimeRemaining = getTimeRemaining('weekly');
      
      console.log('📊 Weekly player count:', weeklyPlayerCount);
      
      setWeeklyChallengeData({
        remainingTime: weeklyTimeRemaining,
        playerCount: weeklyPlayerCount,
        loading: false
      });
    } catch (error) {
      console.error('Error loading challenge data:', error);
      setDailyChallengeData({
        remainingTime: 'Error loading',
        playerCount: 0,
        loading: false
      });
      setWeeklyChallengeData({
        remainingTime: 'Error loading',
        playerCount: 0,
        loading: false
      });
    }
  };

  // Refresh all data function
  const refreshAllData = async () => {
    console.log('🔄 Refreshing all home screen data...');
    loadStatsFromProfile();
    loadAchievementsFromProfile();
    await Promise.all([
      loadLocalStats(),
      loadChallengeStatus(),
      loadChallengeData()
    ]);
    console.log('✅ Home screen data refreshed');
  };

  // Update timers every second using forceUpdate counter
  useEffect(() => {
    loadChallengeData();
    loadAnimalFact();
    loadLocalStats();
    loadChallengeStatus();
    
    timeUpdateRef.current = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 1000);

    const dataRefreshInterval = setInterval(() => {
      refreshAllData();
    }, 30000);

    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
      clearInterval(dataRefreshInterval);
    };
  }, []);

  // Memoize time values to prevent blinking
  const timeInfo = useMemo(() => {
    const dailyRemaining = getTimeRemaining('daily');
    const weeklyRemaining = getTimeRemaining('weekly');
    const dailyExpired = dailyRemaining.includes('Expired');
    const weeklyExpired = weeklyRemaining.includes('Expired');
    
    return {
      dailyRemaining,
      weeklyRemaining,
      dailyExpired,
      weeklyExpired,
      dailyUrgent: isDailyChallengeUrgent(dailyRemaining),
      weeklyUrgent: isWeeklyChallengeUrgent(weeklyRemaining)
    };
  }, [forceUpdate]);

  // Update dailyChallengeData and isDailyExpired when memoized values change
  useEffect(() => {
    setDailyChallengeData(prev => ({
      ...prev,
      remainingTime: timeInfo.dailyRemaining
    }));
    setIsDailyExpired(timeInfo.dailyExpired);
    
    setWeeklyChallengeData(prev => ({
      ...prev,
      remainingTime: timeInfo.weeklyRemaining
    }));
  }, [timeInfo]);

  // Reload stats when profile changes
  useEffect(() => {
    console.log('📊 Profile updated - reloading stats');
    loadStatsFromProfile();
    loadAchievementsFromProfile();
    loadLocalStats();
    loadChallengeStatus();
  }, [profile]);

  // Add focus listener to refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🏠 Home screen focused - refreshing all data');
      refreshAllData();
    });

    return unsubscribe;
  }, [navigation, profile]);

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

  // Helper to get contrasting text color
  const getContrastColor = (bgColor: string): string => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Smart greeting logic with pluralization
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';

    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    const firstName = profile?.name?.split(' ')[0] || 'Explorer';
    const puzzlesSolved = homeStats.puzzlesSolved || 0;
    const currentStreak = homeStats.currentStreak || 0;

    let subtitle = 'Ready for today\'s challenge?';

    if (puzzlesSolved > 0) {
      const gameText = pluralize(puzzlesSolved, 'game', 'games');
      const streakText = pluralize(currentStreak, 'day', 'days');
      
      subtitle = `Played ${puzzlesSolved} ${gameText}`;
      if (currentStreak > 0) {
        subtitle += `, ${currentStreak} ${streakText}`;
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
  
  // Button text and color functions
  const getDailyButtonText = () => {
    // If expired, always show PLAY
    if (timeInfo.dailyExpired) {
      return 'PLAY DAILY CHALLENGE';
    }
    // If not expired and played, show SEE RESULTS
    if (dailyPlayed) {
      return 'SEE DAILY CHALLENGE RESULTS';
    }
    // Default
    return 'PLAY DAILY CHALLENGE';
  };

  const getDailyButtonColor = () => {
    // If expired or not played, use green
    if (timeInfo.dailyExpired || !dailyPlayed) {
      return '#2E7D32'; // Green for play
    }
    // If played and not expired, use purple
    return '#9C27B0'; // Purple for results
  };

  // Navigation handlers
  const handleDailyChallengePress = () => {
    console.log('📅 Daily challenge pressed - expired:', timeInfo.dailyExpired, 'played:', dailyPlayed);
    
    // If expired OR not played, go to play
    if (timeInfo.dailyExpired || !dailyPlayed) {
      console.log('➡️ Navigating to Play');
      goToPlay(navigation, 'daily', {
        gridSize: currentGridSize,
        difficulty: currentDifficulty
      });
    } else {
      // Only show results if played AND not expired
      console.log('➡️ Navigating to Results');
      navigation.navigate('ChallengeResults', {
        challengeId: `daily-${getUTCDateString()}`,
        challengeType: 'daily',
        time: dailyResult?.bestTime,
        isPerfect: dailyResult?.isPerfect,
        moves: dailyResult?.moves,
        correctMoves: dailyResult?.correctMoves,
        wrongMoves: dailyResult?.wrongMoves,
        accuracy: dailyResult?.accuracy,
        completed: true,
      } as any);
    }
  };

  const handleWeeklyChallengePress = () => {
    if (weeklyPlayed) {
      navigation.navigate('ChallengeResults', {
        challengeId: `weekly-${getWeekNumber(new Date())}`,
        challengeType: 'weekly',
        time: weeklyResult?.bestTime,
        isPerfect: weeklyResult?.isPerfect,
        moves: weeklyResult?.moves,
        correctMoves: weeklyResult?.correctMoves,
        wrongMoves: weeklyResult?.wrongMoves,
        accuracy: weeklyResult?.accuracy,
        completed: true,
      } as any);
    } else {
      goToPlay(navigation, 'weekly', {
        gridSize: currentGridSize,
        difficulty: currentDifficulty
      });
    }
  };

  const handleQuickPlayPress = () => {
    goToPlay(navigation, 'sequential', {
      gridSize: currentGridSize,
      difficulty: currentDifficulty
    });
  };

  // Get weekly button text
  const getWeeklyButtonText = () => {
    if (weeklyPlayed) return 'SEE WEEKLY CHALLENGE RESULTS';
    return 'PLAY WEEKLY CHALLENGE';
  };

  // Refresh fact manually
  const handleRefreshFact = async () => {
    await loadAnimalFact(true);
  };

  // Helper to safely render text
  const renderSafeText = (text: string | number | undefined | null, fallback: string = '') => {
    const safeText = text ?? fallback;
    return String(safeText);
  };

  // Challenge data
  const dailyChallenge = {
    title: `Daily ${todayAnimal.name} Adventure`,
    description: `Complete today's special ${currentGridSize} puzzle with ${todayAnimal.name.toLowerCase()} animals`,
    remainingTime: timeInfo.dailyRemaining,
    players: dailyChallengeData.playerCount.toLocaleString(),
    emoji: todayAnimal.emoji,
    animalName: todayAnimal.name,
    loading: dailyChallengeData.loading,
    isUrgent: timeInfo.dailyUrgent,
    played: dailyPlayed && !timeInfo.dailyExpired,
    result: dailyResult,
    isExpired: timeInfo.dailyExpired,
  };
  
  const weeklyChallenge = {
    title: `Weekly ${weekAnimal.name} Expedition`,
    description: `A special ${currentGridSize} ${weekAnimal.name.toLowerCase()} puzzle available all week`,
    remainingTime: timeInfo.weeklyRemaining,
    players: weeklyChallengeData.playerCount.toLocaleString(),
    emoji: weekAnimal.emoji,
    animalName: weekAnimal.name,
    loading: weeklyChallengeData.loading || isLoadingStats,
    isUrgent: timeInfo.weeklyUrgent,
    played: weeklyPlayed,
    result: weeklyResult,
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {renderSafeText('Daily Challenge')}
        </Text>
        <ChallengeCard
          type="daily"
          title={renderSafeText(dailyChallenge.title)}
          description={renderSafeText(dailyChallenge.description)}
          remainingTime={renderSafeText(dailyChallenge.remainingTime)}
          players={dailyChallenge.loading ? 'Loading...' : renderSafeText(dailyChallenge.players)}
          emoji={renderSafeText(dailyChallenge.emoji)}
          themeColors={colors}
          isUrgent={dailyChallenge.isUrgent}
          isLoading={dailyChallenge.loading}
          onPress={handleDailyChallengePress}
          onPlayPress={handleDailyChallengePress}
          played={dailyPlayed && !timeInfo.dailyExpired}
          result={dailyResult}
          buttonText={getDailyButtonText()}
          buttonColor={getDailyButtonColor()}
        />

        {/* Weekly Challenge */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {renderSafeText('Weekly Challenge')}
        </Text>
        <ChallengeCard
          type="weekly"
          title={renderSafeText(weeklyChallenge.title)}
          description={renderSafeText(weeklyChallenge.description)}
          remainingTime={renderSafeText(weeklyChallenge.remainingTime)}
          players={weeklyChallenge.loading ? 'Loading...' : renderSafeText(weeklyChallenge.players)}
          emoji={renderSafeText(weeklyChallenge.emoji)}
          themeColors={colors}
          isUrgent={weeklyChallenge.isUrgent}
          isLoading={weeklyChallenge.loading}
          onPress={handleWeeklyChallengePress}
          onPlayPress={handleWeeklyChallengePress}
          played={weeklyPlayed}
          result={weeklyResult}
          buttonText={getWeeklyButtonText()}
        />

        {/* Quick Play */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {renderSafeText('Quick Play')}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
          {renderSafeText(hasCustomSettings 
            ? `Your preferred settings: ${currentGridSize} • ${currentDifficulty}`
            : `Default settings: ${currentGridSize} • ${currentDifficulty}`
          )}
        </Text>
        
        <QuickPlayCard
          gridSize={renderSafeText(currentGridSize)}
          difficulty={renderSafeText(currentDifficulty)}
          emoji={renderSafeText(gridProperties?.emoji || '🎮')}
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

        {/* Daily Animal Fact Section */}
        <View style={styles.factSectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            {renderSafeText('🐘 Daily Animal Fact')}
          </Text>
          {factData.animalName && !factData.loading && (
            <Text style={[styles.animalNameBadge, { 
              color: getContrastColor(colors.button), 
              backgroundColor: colors.button 
            }]}>
              {renderSafeText(factData.animalName)}
            </Text>
          )}
        </View>
        
        <FactCard
          fact={renderSafeText(factData.displayFact)}
          themeColors={colors}
          isLoading={factData.loading}
          onRefresh={handleRefreshFact}
        />

        {/* Achievements */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {renderSafeText('Achievements')}
        </Text>
        <AchievementsList
          trophies={achievements}
          themeColors={colors}
        />

        {/* Stats Summary */}
        <StatsSummary
          stats={{
            puzzlesSolved: homeStats.puzzlesSolved || 0,
            accuracy: homeStats.accuracy || 0,
            currentStreak: homeStats.currentStreak || 0,
          }}
          unlockedTrophiesCount={homeStats.trophies || 0}
          themeColors={colors}
        />

        {/* Challenge Status Summary */}
        <View style={[styles.statusSummary, { backgroundColor: `${colors.button}20` }]}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            {renderSafeText('📊 Live Challenge Status')}
          </Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                {renderSafeText('Daily Players')}
              </Text>
              <View>
                <Text style={[styles.statusValue, { color: colors.text }]}>
                  {dailyChallenge.loading ? '...' : renderSafeText(dailyChallenge.players)}
                </Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                {renderSafeText('Weekly Players')}
              </Text>
              <View>
                <Text style={[styles.statusValue, { color: colors.text }]}>
                  {weeklyChallenge.loading ? '...' : renderSafeText(weeklyChallenge.players)}
                </Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                {renderSafeText('Daily Ends In')}
              </Text>
              <View>
                <Text style={[
                  styles.timerValue, 
                  { 
                    color: dailyChallenge.isUrgent ? '#FF5722' : colors.text,
                    fontWeight: dailyChallenge.isUrgent ? 'bold' : 'normal'
                  }
                ]}>
                  {renderSafeText(dailyChallenge.remainingTime)}
                </Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                {renderSafeText('Weekly Ends In')}
              </Text>
              <View>
                <Text style={[
                  styles.timerValue, 
                  { 
                    color: weeklyChallenge.isUrgent ? '#FF5722' : colors.text,
                    fontWeight: weeklyChallenge.isUrgent ? 'bold' : 'normal'
                  }
                ]}>
                  {renderSafeText(weeklyChallenge.remainingTime)}
                </Text>
              </View>
            </View>
          </View>
          <View>
            <Text style={[styles.statusNote, { color: colors.text, opacity: 0.7 }]}>
              {renderSafeText('Updates every second • UTC-based timing')}
            </Text>
          </View>
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