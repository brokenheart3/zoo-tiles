// src/screens/HomeScreen.tsx
import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Share,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext, themeStyles } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useProfile } from '../context/ProfileContext';
import { goToPlay } from '../navigation/goToPlay';

// Import category helpers
import {
  getTodayCategoryItem,
  getWeekCategoryItem,
  getCategoryDisplayName,
  getCategoryEmoji,
  getDailyItemsForCategory,
  getWeeklyItemsForCategory,
  getDailyPreview,
  getWeeklyPreview,
} from '../utils/categoryHelpers';
import { Category } from '../services/api';

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
import { fetchDailyCategoryFact } from '../services/api';
import { getStatisticsData, getUserChallengeResult } from '../services/userService';
import { auth } from '../services/firebase';

// Navigation types
type RootStackParamList = {
  Home: undefined;
  Play: {
    gridSize: string;
    difficulty: string;
    challengeType?: 'daily' | 'weekly';
    challengeId?: string;
    category?: string;
  };
  Challenge: {
    screen: 'Daily' | 'Weekly';
    challengeId?: string;
    viewResults?: boolean;
    category?: string;
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
    category?: string;
  };
  Settings: undefined;
  Profile: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Grid size properties for all 9 grid sizes
const GRID_SIZE_PROPERTIES = {
  '5x5': { emoji: '🐭', difficulty: 'Easy', label: '5x5' },
  '6x6': { emoji: '🐘', difficulty: 'Easy', label: '6x6' },
  '7x7': { emoji: '🦊', difficulty: 'Easy', label: '7x7' },
  '8x8': { emoji: '🦒', difficulty: 'Medium', label: '8x8' },
  '9x9': { emoji: '🐨', difficulty: 'Medium', label: '9x9' },
  '10x10': { emoji: '🦁', difficulty: 'Hard', label: '10x10' },
  '11x11': { emoji: '🐺', difficulty: 'Hard', label: '11x11' },
  '12x12': { emoji: '🐯', difficulty: 'Expert', label: '12x12' },
  '16x16': { emoji: '🐉', difficulty: 'Expert', label: '16x16' },
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
  category: 'animals' as Category,
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

// Helper to extract fact name and emoji from fact string
// Fact format: "emoji FactName: The actual fact..."
const extractFactInfo = (factString: string): { factName: string; factEmoji: string; factText: string } => {
  if (!factString) {
    return { factName: '', factEmoji: '', factText: '' };
  }
  
  // Pattern: starts with emoji (any emoji), then space, then a name, then colon
  const emojiPattern = /^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+)/u;
  const emojiMatch = factString.match(emojiPattern);
  const factEmoji = emojiMatch ? emojiMatch[1] : '';
  
  if (emojiMatch) {
    const afterEmoji = factString.substring(emojiMatch[0].length).trim();
    const colonIndex = afterEmoji.indexOf(':');
    if (colonIndex > 0) {
      const factName = afterEmoji.substring(0, colonIndex).trim();
      const factText = afterEmoji.substring(colonIndex + 1).trim();
      return { factName, factEmoji, factText };
    }
  }
  
  return { factName: '', factEmoji, factText: factString };
};

// Share options
const SHARE_OPTIONS = [
  { id: 'native', name: 'Share via...', icon: '📱', color: '#4CAF50', action: 'native' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366', action: 'whatsapp' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', color: '#26A5E4', action: 'telegram' },
  { id: 'messenger', name: 'Messenger', icon: '💙', color: '#0084FF', action: 'messenger' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1DA1F2', action: 'twitter' },
  { id: 'copy', name: 'Copy Link', icon: '📋', color: '#FF9800', action: 'copy' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { settings } = useSettings();
  const { profile } = useProfile();
  
  const colors = themeStyles[theme];
  
  // Get selected category from settings (default to animals)
  const selectedCategory = (settings as any).category || DEFAULT_SETTINGS.category;
  
  // Get today's and this week's items based on selected category
  const todayItem = getTodayCategoryItem(selectedCategory);
  const weekItem = getWeekCategoryItem(selectedCategory);
  
  // Get category emoji for Quick Play
  const categoryEmoji = getCategoryEmoji(selectedCategory);
  
  // Get all items for preview
  const dailyItems = getDailyItemsForCategory(selectedCategory);
  const weeklyItems = getWeeklyItemsForCategory(selectedCategory);
  const dailyPreview = getDailyPreview(selectedCategory);
  const weeklyPreview = getWeeklyPreview(selectedCategory);
  
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
  
  // State for category fact
  const [factData, setFactData] = useState<{
    displayFact: string;
    factName: string;
    factEmoji: string;
    factText: string;
    progress: string;
    loading: boolean;
    error?: string;
  }>({
    displayFact: `Loading ${getCategoryDisplayName(selectedCategory)} fact...`,
    factName: '',
    factEmoji: '',
    factText: '',
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
  
  const timeUpdateRef = useRef<number | null>(null);

  // Current settings
  const currentGridSize = settings.gridSize || DEFAULT_SETTINGS.gridSize;
  const currentDifficulty = settings.difficulty || DEFAULT_SETTINGS.difficulty;
  const gridProperties = GRID_SIZE_PROPERTIES[currentGridSize as keyof typeof GRID_SIZE_PROPERTIES] || GRID_SIZE_PROPERTIES['8x8'];

  // ======================
  // Load stats from profile context
  // ======================
  const loadStatsFromProfile = () => {
    if (profile) {
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

  // Load local stats
  const loadLocalStats = async () => {
    try {
      setIsLoadingStats(true);
      loadStatsFromProfile();
      loadAchievementsFromProfile();
      
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

      // Use UTC date for daily challenge ID with category
      const todayId = `daily-${getUTCDateString()}-${selectedCategory}`;
      const dailyResult = await getUserChallengeResult(user.uid, todayId);
      
      if (dailyResult && dailyResult.completed) {
        setDailyPlayed(true);
        setDailyResult(dailyResult);
      } else {
        setDailyPlayed(false);
        setDailyResult(null);
      }

      // Check weekly challenge with category
      const weekId = `weekly-${getWeekNumber(new Date())}-${selectedCategory}`;
      const weeklyResult = await getUserChallengeResult(user.uid, weekId);
      
      if (weeklyResult && weeklyResult.completed) {
        setWeeklyPlayed(true);
        setWeeklyResult(weeklyResult);
      } else {
        setWeeklyPlayed(false);
        setWeeklyResult(null);
      }
    } catch (error) {
      console.error('Error loading challenge status:', error);
    }
  };

  // ======================
  // Load category fact from API with better fallback handling
  // ======================
  const loadCategoryFact = async (forceRefresh: boolean = false) => {
    setFactData(prev => ({ ...prev, loading: true }));

    try {
      const today = new Date().toDateString();
      const storedDate = await AsyncStorage.getItem(`lastFactDate_${selectedCategory}`);
      const storedFactData = await AsyncStorage.getItem(`dailyFactData_${selectedCategory}`);

      // If we have cached data from today and not forcing refresh, use it
      if (!forceRefresh && storedDate === today && storedFactData) {
        const parsedData = JSON.parse(storedFactData);
        setFactData({
          displayFact: parsedData.displayFact,
          factName: parsedData.factName || '',
          factEmoji: parsedData.factEmoji || '',
          factText: parsedData.factText || '',
          progress: parsedData.progress || '',
          loading: false,
        });
        console.log(`📚 Using cached fact for ${getCategoryDisplayName(selectedCategory)}`);
        return;
      }

      // Try to fetch new fact from API
      console.log(`📚 Fetching fresh fact for ${getCategoryDisplayName(selectedCategory)}...`);
      const factString = await fetchDailyCategoryFact(selectedCategory);
      
      // Even if factString is null, we'll create a fallback
      const categoryEmoji = getCategoryEmoji(selectedCategory);
      const categoryName = getCategoryDisplayName(selectedCategory);
      
      let displayFact = factString;
      let factName = '';
      let factEmoji = categoryEmoji;
      let factText = '';
      
      if (!displayFact) {
        // Create a friendly fallback fact
        displayFact = `${categoryEmoji} ${categoryName}: Discover amazing ${categoryName.toLowerCase()} facts! Check back soon for more facts.`;
        factName = categoryName;
        factText = `Discover amazing ${categoryName.toLowerCase()} facts! Check back soon for more facts.`;
      } else {
        // Extract the fact info from the formatted fact string
        const extracted = extractFactInfo(displayFact);
        factName = extracted.factName || categoryName;
        factEmoji = extracted.factEmoji || categoryEmoji;
        factText = extracted.factText || displayFact;
      }

      const progress = `Daily ${categoryName} fact`;

      // Store in AsyncStorage
      await AsyncStorage.setItem(`lastFactDate_${selectedCategory}`, today);
      await AsyncStorage.setItem(
        `dailyFactData_${selectedCategory}`,
        JSON.stringify({
          displayFact,
          factName,
          factEmoji,
          factText,
          progress,
          fetchedAt: new Date().toISOString(),
        })
      );

      setFactData({
        displayFact,
        factName,
        factEmoji,
        factText,
        progress,
        loading: false,
      });

      console.log(`✅ Loaded fact for ${categoryName}: ${factName}`);

    } catch (error: any) {
      console.error('Error loading category fact:', error.message);

      // Try to get cached data even if it's from a previous day
      try {
        const storedFactData = await AsyncStorage.getItem(`dailyFactData_${selectedCategory}`);
        if (storedFactData) {
          const parsedData = JSON.parse(storedFactData);
          setFactData({
            displayFact: parsedData.displayFact,
            factName: parsedData.factName || getCategoryDisplayName(selectedCategory),
            factEmoji: parsedData.factEmoji || getCategoryEmoji(selectedCategory),
            factText: parsedData.factText || '',
            progress: 'Using cached fact',
            loading: false,
          });
          console.log(`📚 Using cached fact for ${getCategoryDisplayName(selectedCategory)} (from previous day)`);
          return;
        }
      } catch {}

      // Ultimate fallback - create a nice fact with emoji
      const categoryEmoji = getCategoryEmoji(selectedCategory);
      const categoryName = getCategoryDisplayName(selectedCategory);
      const fallbackFact = `${categoryEmoji} ${categoryName}: Welcome to the ${categoryName} category! Amazing facts coming soon.`;
      
      setFactData({
        displayFact: fallbackFact,
        factName: categoryName,
        factEmoji: categoryEmoji,
        factText: `Welcome to the ${categoryName} category! Amazing facts coming soon.`,
        progress: 'Offline mode',
        loading: false,
        error: error.message,
      });
    }
  };

  // Load challenge data (player counts and timers)
  const loadChallengeData = async () => {
    try {
      const dailyPlayerCount = await getChallengePlayerCount('daily', selectedCategory);
      const dailyTimeRemaining = getTimeRemaining('daily');
      const dailyExpired = dailyTimeRemaining.includes('Expired');
      
      setDailyChallengeData({
        remainingTime: dailyTimeRemaining,
        playerCount: dailyPlayerCount,
        loading: false
      });
      setIsDailyExpired(dailyExpired);

      const weeklyPlayerCount = await getChallengePlayerCount('weekly', selectedCategory);
      const weeklyTimeRemaining = getTimeRemaining('weekly');
      
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
      loadChallengeData(),
      loadCategoryFact()
    ]);
  };

  // Update timers every second
  useEffect(() => {
    loadChallengeData();
    loadCategoryFact();
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
  }, [selectedCategory]);

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

  // Update dailyChallengeData when memoized values change
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
    loadStatsFromProfile();
    loadAchievementsFromProfile();
    loadLocalStats();
    loadChallengeStatus();
  }, [profile]);

  // Add focus listener
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshAllData();
    });

    return unsubscribe;
  }, [navigation, profile, selectedCategory]);

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

  // ======================
  // SHARE FUNCTIONALITY
  // ======================
  
  const appDownloadUrl = 'https://example.com/download'; // Replace with actual app store link
  const shareMessage = `🧩 Join me on this awesome puzzle app! Solve daily & weekly challenges with fun categories like Animals, Cars, Sports and more! Download now: ${appDownloadUrl}`;
  
  const handleShare = async (option: typeof SHARE_OPTIONS[0]) => {
    try {
      switch (option.action) {
        case 'native':
          await Share.share({
            message: shareMessage,
            title: 'Join me on Puzzle App!',
          });
          break;
          
        case 'whatsapp':
          const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
          const canOpenWhatsapp = await Linking.canOpenURL(whatsappUrl);
          if (canOpenWhatsapp) {
            await Linking.openURL(whatsappUrl);
          } else {
            Alert.alert('WhatsApp not installed', 'Please install WhatsApp to share.');
          }
          break;
          
        case 'telegram':
          const telegramUrl = `tg://msg?text=${encodeURIComponent(shareMessage)}`;
          const canOpenTelegram = await Linking.canOpenURL(telegramUrl);
          if (canOpenTelegram) {
            await Linking.openURL(telegramUrl);
          } else {
            Alert.alert('Telegram not installed', 'Please install Telegram to share.');
          }
          break;
          
        case 'messenger':
          const messengerUrl = `fb-messenger://share?link=${encodeURIComponent(appDownloadUrl)}`;
          const canOpenMessenger = await Linking.canOpenURL(messengerUrl);
          if (canOpenMessenger) {
            await Linking.openURL(messengerUrl);
          } else {
            Alert.alert('Messenger not installed', 'Please install Messenger to share.');
          }
          break;
          
        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
          await Linking.openURL(twitterUrl);
          break;
          
        case 'copy':
          await AsyncStorage.setItem('shareLink', appDownloadUrl);
          await Share.share({
            message: shareMessage,
          });
          break;
          
        default:
          await Share.share({
            message: shareMessage,
            title: 'Join me on Puzzle App!',
          });
      }
      
      console.log(`📱 Shared via ${option.name}`);
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Share Failed', 'Could not share. Please try again.');
    }
  };
  
  const showShareOptions = () => {
    Alert.alert(
      'Invite Friends',
      'Share this app with friends!',
      [
        ...SHARE_OPTIONS.map(option => ({
          text: `${option.icon} ${option.name}`,
          onPress: () => handleShare(option),
        })),
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
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

    let subtitle = `Today's theme: ${getCategoryDisplayName(selectedCategory)}`;

    if (puzzlesSolved > 0) {
      const gameText = pluralize(puzzlesSolved, 'game', 'games');
      const streakText = pluralize(currentStreak, 'day', 'days');
      
      subtitle += ` • Played ${puzzlesSolved} ${gameText}`;
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
    if (timeInfo.dailyExpired) {
      return 'PLAY DAILY CHALLENGE';
    }
    if (dailyPlayed) {
      return 'SEE DAILY CHALLENGE RESULTS';
    }
    return 'PLAY DAILY CHALLENGE';
  };

  const getDailyButtonColor = () => {
    if (timeInfo.dailyExpired || !dailyPlayed) {
      return '#2E7D32';
    }
    return '#9C27B0';
  };

  // Navigation handlers
  const handleDailyChallengePress = () => {
    if (timeInfo.dailyExpired || !dailyPlayed) {
      goToPlay(navigation, 'daily', {
        gridSize: currentGridSize,
        difficulty: currentDifficulty,
        category: selectedCategory
      });
    } else {
      navigation.navigate('ChallengeResults', {
        challengeId: `daily-${getUTCDateString()}-${selectedCategory}`,
        challengeType: 'daily',
        time: dailyResult?.bestTime,
        isPerfect: dailyResult?.isPerfect,
        moves: dailyResult?.moves,
        correctMoves: dailyResult?.correctMoves,
        wrongMoves: dailyResult?.wrongMoves,
        accuracy: dailyResult?.accuracy,
        completed: true,
        category: selectedCategory,
      } as any);
    }
  };

  const handleWeeklyChallengePress = () => {
    if (weeklyPlayed) {
      navigation.navigate('ChallengeResults', {
        challengeId: `weekly-${getWeekNumber(new Date())}-${selectedCategory}`,
        challengeType: 'weekly',
        time: weeklyResult?.bestTime,
        isPerfect: weeklyResult?.isPerfect,
        moves: weeklyResult?.moves,
        correctMoves: weeklyResult?.correctMoves,
        wrongMoves: weeklyResult?.wrongMoves,
        accuracy: weeklyResult?.accuracy,
        completed: true,
        category: selectedCategory,
      } as any);
    } else {
      goToPlay(navigation, 'weekly', {
        gridSize: currentGridSize,
        difficulty: currentDifficulty,
        category: selectedCategory
      });
    }
  };

  const handleQuickPlayPress = () => {
    goToPlay(navigation, 'sequential', {
      gridSize: currentGridSize,
      difficulty: currentDifficulty,
      category: selectedCategory
    });
  };

  // Get weekly button text
  const getWeeklyButtonText = () => {
    if (weeklyPlayed) return 'SEE WEEKLY CHALLENGE RESULTS';
    return 'PLAY WEEKLY CHALLENGE';
  };

  // Refresh fact manually
  const handleRefreshFact = async () => {
    console.log(`🔄 Manually refreshing fact for ${getCategoryDisplayName(selectedCategory)}`);
    await loadCategoryFact(true);
  };

  // Helper to safely render text
  const renderSafeText = (text: string | number | undefined | null, fallback: string = '') => {
    const safeText = text ?? fallback;
    return String(safeText);
  };

  // Challenge data with category items
  const dailyChallenge = {
    title: `Daily ${todayItem.name} Adventure`,
    description: `Complete today's special ${currentGridSize} puzzle featuring ${todayItem.name.toLowerCase()}`,
    remainingTime: timeInfo.dailyRemaining,
    players: dailyChallengeData.playerCount.toLocaleString(),
    emoji: todayItem.emoji,
    itemName: todayItem.name,
    category: getCategoryDisplayName(selectedCategory),
    loading: dailyChallengeData.loading,
    isUrgent: timeInfo.dailyUrgent,
    played: dailyPlayed && !timeInfo.dailyExpired,
    result: dailyResult,
    isExpired: timeInfo.dailyExpired,
  };
  
  const weeklyChallenge = {
    title: `Weekly ${weekItem.name} Expedition`,
    description: `A special ${currentGridSize} ${weekItem.name.toLowerCase()} puzzle available all week`,
    remainingTime: timeInfo.weeklyRemaining,
    players: weeklyChallengeData.playerCount.toLocaleString(),
    emoji: weekItem.emoji,
    itemName: weekItem.name,
    category: getCategoryDisplayName(selectedCategory),
    loading: weeklyChallengeData.loading || isLoadingStats,
    isUrgent: timeInfo.weeklyUrgent,
    played: weeklyPlayed,
    result: weeklyResult,
  };

  // Category rotation preview
  const categoryPreview = {
    daily: dailyPreview.slice(0, 3),
    weekly: weeklyPreview.slice(0, 3),
    totalDaily: dailyItems.length,
    totalWeekly: weeklyItems.length,
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

        {/* Category Badge */}
        <View style={styles.categoryBadgeContainer}>
          <Text style={[styles.categoryBadge, { 
            backgroundColor: colors.button,
            color: getContrastColor(colors.button)
          }]}>
            Current Theme: {getCategoryDisplayName(selectedCategory)} {todayItem.emoji}
          </Text>
        </View>

        {/* Daily Challenge */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Daily Challenge
        </Text>
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
          onPress={handleDailyChallengePress}
          onPlayPress={handleDailyChallengePress}
          played={dailyPlayed && !timeInfo.dailyExpired}
          result={dailyResult}
          buttonText={getDailyButtonText()}
          buttonColor={getDailyButtonColor()}
        />

        {/* Daily Preview */}
        <View style={[styles.previewContainer, { backgroundColor: `${colors.button}10` }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>
            Coming up this week:
          </Text>
          <View style={styles.previewItems}>
            {categoryPreview.daily.map((item, index) => (
              <View key={index} style={styles.previewItem}>
                <Text style={[styles.previewEmoji, { color: colors.text }]}>{item.emoji}</Text>
                <Text style={[styles.previewDay, { color: colors.text }]}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Challenge */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Weekly Challenge
        </Text>
        <ChallengeCard
          type="weekly"
          title={weeklyChallenge.title}
          description={weeklyChallenge.description}
          remainingTime={weeklyChallenge.remainingTime}
          players={weeklyChallenge.loading ? 'Loading...' : weeklyChallenge.players}
          emoji={weeklyChallenge.emoji}
          themeColors={colors}
          isUrgent={weeklyChallenge.isUrgent}
          isLoading={weeklyChallenge.loading}
          onPress={handleWeeklyChallengePress}
          onPlayPress={handleWeeklyChallengePress}
          played={weeklyPlayed}
          result={weeklyResult}
          buttonText={getWeeklyButtonText()}
        />

        {/* Weekly Preview */}
        <View style={[styles.previewContainer, { backgroundColor: `${colors.button}10` }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>
            Coming up this month:
          </Text>
          <View style={styles.previewItems}>
            {categoryPreview.weekly.map((item, index) => (
              <View key={index} style={styles.previewItem}>
                <Text style={[styles.previewEmoji, { color: colors.text }]}>{item.emoji}</Text>
                <Text style={[styles.previewWeek, { color: colors.text }]}>Week {item.week}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Play - UPDATED with category emoji */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Play
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
          {hasCustomSettings 
            ? `Your preferred settings: ${currentGridSize} • ${currentDifficulty} • ${getCategoryDisplayName(selectedCategory)}`
            : `Default settings: ${currentGridSize} • ${currentDifficulty} • ${getCategoryDisplayName(selectedCategory)}`
          }
        </Text>
        
        <QuickPlayCard
          gridSize={currentGridSize}
          difficulty={currentDifficulty}
          emoji={categoryEmoji}
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

        {/* Daily Category Fact Section - UPDATED with fact name and emoji on right */}
        <View style={styles.factSectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, flex: 1 }]}>
            📚 Daily {getCategoryDisplayName(selectedCategory)} Fact
          </Text>
          {factData.factName && !factData.loading && factData.factEmoji && (
            <View style={[styles.factNameBadge, { 
              backgroundColor: colors.button,
            }]}>
              <Text 
                style={[styles.factNameText, { color: getContrastColor(colors.button) }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {factData.factEmoji} {factData.factName}
              </Text>
            </View>
          )}
        </View>
        
        <FactCard
          fact={factData.factText || factData.displayFact}
          themeColors={colors}
          isLoading={factData.loading}
          onRefresh={handleRefreshFact}
        />

        {/* Achievements */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Achievements
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
            📊 Live Challenge Status
          </Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                Daily Players
              </Text>
              <View>
                <Text style={[styles.statusValue, { color: colors.text }]}>
                  {dailyChallenge.loading ? '...' : dailyChallenge.players}
                </Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                Weekly Players
              </Text>
              <View>
                <Text style={[styles.statusValue, { color: colors.text }]}>
                  {weeklyChallenge.loading ? '...' : weeklyChallenge.players}
                </Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                Daily Ends In
              </Text>
              <View>
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
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                Weekly Ends In
              </Text>
              <View>
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
          </View>
          <View>
            <Text style={[styles.statusNote, { color: colors.text, opacity: 0.7 }]}>
              Updates every second • UTC-based timing
            </Text>
          </View>
        </View>

        {/* Share App Section */}
        <View style={styles.shareSection}>
          <Text style={[styles.shareTitle, { color: colors.text }]}>
            📱 Invite Friends
          </Text>
          <Text style={[styles.shareSubtitle, { color: colors.text, opacity: 0.7 }]}>
            Share the fun! Invite friends to play with you
          </Text>
          
          <TouchableOpacity 
            style={[styles.shareMainButton, { backgroundColor: colors.button }]}
            onPress={showShareOptions}
            activeOpacity={0.8}
          >
            <Text style={[styles.shareMainButtonText, { color: getContrastColor(colors.button) }]}>
              📤 Share App
            </Text>
          </TouchableOpacity>
          
          <View style={styles.shareOptionsGrid}>
            {SHARE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[styles.shareOption, { backgroundColor: `${colors.button}15` }]}
                onPress={() => handleShare(option)}
                activeOpacity={0.7}
              >
                <Text style={[styles.shareOptionIcon, { color: option.color }]}>
                  {option.icon}
                </Text>
                <Text style={[styles.shareOptionText, { color: colors.text }]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
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
    flexWrap: 'nowrap',
  },
  factNameBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: '50%', 
    flexShrink: 1,
  },
  factNameText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryBadgeContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  categoryBadge: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  previewContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.8,
  },
  previewItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewItem: {
    alignItems: 'center',
  },
  previewEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  previewDay: {
    fontSize: 12,
    opacity: 0.7,
  },
  previewWeek: {
    fontSize: 12,
    opacity: 0.7,
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
  shareSection: {
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 16,
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shareSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  shareMainButton: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  shareMainButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  shareOption: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  shareOptionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  shareOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HomeScreen;