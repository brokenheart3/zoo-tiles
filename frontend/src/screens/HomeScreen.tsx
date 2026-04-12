// src/screens/HomeScreen.tsx
import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext, themeStyles } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { useProfile } from "../context/ProfileContext";
import { useGameMode } from "../context/GameModeContext";
import { goToPlay } from "../navigation/goToPlay";
import { challengeService } from "../services/challengeService";

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
} from "../utils/categoryHelpers";
import { Category } from "../services/api";

// Import homescreen components
import {
  GreetingHeader,
  ChallengeCard,
  QuickPlayCard,
  FactCard,
  AchievementsList,
  StatsSummary,
  SettingsLink,
} from "../components/homescreen";
import { AppFooter } from "../components/common";
import ShareInvite from "../components/common/ShareInvite";

// Import services
import { getUTCDateString, getWeekNumber } from "../utils/timeUtils";
import { fetchDailyCategoryFact } from "../services/api";
import { getStatisticsData } from "../services/userService";
import { auth } from "../services/firebase";
import { ChallengeCategory } from "../types/challenge";

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

// Grid size properties
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

const DEFAULT_SETTINGS = {
  gridSize: '8x8' as const,
  difficulty: 'Medium' as const,
  category: 'animals' as Category,
};

// Helper for pluralization
const pluralize = (count: number, singular: string, plural: string) => {
  return count === 1 ? singular : plural;
};

// Helper to extract fact info
const extractFactInfo = (factString: string): { factName: string; factEmoji: string; factText: string } => {
  if (!factString) {
    return { factName: '', factEmoji: '', factText: '' };
  }
  
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

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { settings } = useSettings();
  const { profile } = useProfile();
  const { 
    dailyCompletion, 
    weeklyCompletion, 
    dailyLockStatus,
    weeklyLockStatus,
    refreshChallengeStatus,
  } = useGameMode();
  
  const colors = themeStyles[theme];
  
  const selectedCategory = (settings as any).category || DEFAULT_SETTINGS.category;
  const currentGridSize = settings.gridSize || DEFAULT_SETTINGS.gridSize;
  const currentDifficulty = settings.difficulty || DEFAULT_SETTINGS.difficulty;
  
  // Get data from category helpers
  const todayItem = getTodayCategoryItem(selectedCategory);
  const weekItem = getWeekCategoryItem(selectedCategory);
  const categoryEmoji = getCategoryEmoji(selectedCategory);
  const dailyItems = getDailyItemsForCategory(selectedCategory);
  const weeklyItems = getWeeklyItemsForCategory(selectedCategory);
  const dailyPreview = getDailyPreview(selectedCategory);
  const weeklyPreview = getWeeklyPreview(selectedCategory);
  
  const [hasCustomSettings, setHasCustomSettings] = useState(false);
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
  
  const [dailyChallengeState, setDailyChallengeState] = useState({
    playerCount: 0,
    loading: true,
    title: '',
    emoji: '',
  });
  
  const [weeklyChallengeState, setWeeklyChallengeState] = useState({
    playerCount: 0,
    loading: true,
    title: '',
    emoji: '',
  });

  const timeUpdateRef = useRef<number | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Use context for completion status
  const dailyCompleted = dailyCompletion.completed;
  const weeklyCompleted = weeklyCompletion.completed;
  const dailyResultData = dailyCompletion.result;
  const weeklyResultData = weeklyCompletion.result;

  // Load challenge data (titles, emojis, and player counts)
  const loadChallengeData = async () => {
    try {
      const category = selectedCategory as ChallengeCategory;
      
      // IMPORTANT: Refresh challenge status first to get latest completion state
      await refreshChallengeStatus(category);
      
      // Load daily challenge metadata
      const dailyMetadata = await challengeService.getChallengeMetadata('daily', currentGridSize, category);
      const dailyPlayerCount = await challengeService.getChallengePlayerCount('daily', category);
      
      setDailyChallengeState({
        playerCount: dailyPlayerCount,
        loading: false,
        title: dailyMetadata.name,
        emoji: dailyMetadata.challengeEmoji,
      });
      
      // Load weekly challenge metadata
      const weeklyMetadata = await challengeService.getChallengeMetadata('weekly', currentGridSize, category);
      const weeklyPlayerCount = await challengeService.getChallengePlayerCount('weekly', category);
      
      setWeeklyChallengeState({
        playerCount: weeklyPlayerCount,
        loading: false,
        title: weeklyMetadata.name,
        emoji: weeklyMetadata.challengeEmoji,
      });
      
      console.log('📛 Challenge data loaded:', {
        category,
        daily: {
          title: dailyMetadata.name,
          emoji: dailyMetadata.challengeEmoji,
          completed: dailyCompleted,
        },
        weekly: {
          title: weeklyMetadata.name,
          emoji: weeklyMetadata.challengeEmoji,
          completed: weeklyCompleted,
        }
      });
    } catch (error) {
      console.error('Error loading challenge data:', error);
      // Fallback to category helpers
      setDailyChallengeState({
        playerCount: 0,
        loading: false,
        title: `${getCategoryDisplayName(selectedCategory)} Challenge`,
        emoji: todayItem.emoji,
      });
      setWeeklyChallengeState({
        playerCount: 0,
        loading: false,
        title: `${getCategoryDisplayName(selectedCategory)} Weekly`,
        emoji: weekItem.emoji,
      });
    }
  };

  // Load stats from profile
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

  // Load category fact
  const loadCategoryFact = async (forceRefresh: boolean = false) => {
    setFactData(prev => ({ ...prev, loading: true }));

    try {
      const today = new Date().toDateString();
      const storedDate = await AsyncStorage.getItem(`lastFactDate_${selectedCategory}`);
      const storedFactData = await AsyncStorage.getItem(`dailyFactData_${selectedCategory}`);

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
        return;
      }

      const factString = await fetchDailyCategoryFact(selectedCategory);
      const categoryEmojiLocal = getCategoryEmoji(selectedCategory);
      const categoryName = getCategoryDisplayName(selectedCategory);
      
      let displayFact = factString;
      let factName = '';
      let factEmoji = categoryEmojiLocal;
      let factText = '';
      
      if (!displayFact) {
        displayFact = `${categoryEmojiLocal} ${categoryName}: Discover amazing ${categoryName.toLowerCase()} facts!`;
        factName = categoryName;
        factText = `Discover amazing ${categoryName.toLowerCase()} facts!`;
      } else {
        const extracted = extractFactInfo(displayFact);
        factName = extracted.factName || categoryName;
        factEmoji = extracted.factEmoji || categoryEmojiLocal;
        factText = extracted.factText || displayFact;
      }

      const progress = `Daily ${categoryName} fact`;

      await AsyncStorage.setItem(`lastFactDate_${selectedCategory}`, today);
      await AsyncStorage.setItem(
        `dailyFactData_${selectedCategory}`,
        JSON.stringify({ displayFact, factName, factEmoji, factText, progress })
      );

      setFactData({ displayFact, factName, factEmoji, factText, progress, loading: false });
    } catch (error: any) {
      console.error('Error loading category fact:', error.message);
      const categoryEmojiLocal = getCategoryEmoji(selectedCategory);
      const categoryName = getCategoryDisplayName(selectedCategory);
      const fallbackFact = `${categoryEmojiLocal} ${categoryName}: Amazing facts coming soon!`;
      
      setFactData({
        displayFact: fallbackFact,
        factName: categoryName,
        factEmoji: categoryEmojiLocal,
        factText: `Amazing ${categoryName} facts coming soon!`,
        progress: 'Offline mode',
        loading: false,
        error: error.message,
      });
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    console.log('🔄 Refreshing all home screen data...');
    loadStatsFromProfile();
    loadAchievementsFromProfile();
    await Promise.all([
      loadLocalStats(),
      loadChallengeData(),
      loadCategoryFact(),
    ]);
  };

  // Update timers every second
  useEffect(() => {
    loadChallengeData();
    loadCategoryFact();
    loadLocalStats();
    
    timeUpdateRef.current = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 1000);

    const dataRefreshInterval = setInterval(() => {
      refreshAllData();
    }, 30000);

    return () => {
      if (timeUpdateRef.current) clearInterval(timeUpdateRef.current);
      clearInterval(dataRefreshInterval);
    };
  }, [selectedCategory, currentGridSize]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 HomeScreen focused, refreshing...');
      refreshAllData();
      return () => {};
    }, [selectedCategory, currentGridSize])
  );

  // Reload stats when profile changes
  useEffect(() => {
    loadStatsFromProfile();
    loadAchievementsFromProfile();
    loadLocalStats();
  }, [profile]);

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

  const getContrastColor = (bgColor: string): string => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Get remaining time for display (use lockStatus from context)
  const dailyRemaining = dailyLockStatus?.remainingTime || 'Loading...';
  const weeklyRemaining = weeklyLockStatus?.remainingTime || 'Loading...';
  const isDailyExpired = dailyLockStatus?.isExpired || false;
  const isWeeklyExpired = weeklyLockStatus?.isExpired || false;

  // Button text based on completion status and lock status
  const getDailyButtonText = () => {
    if (dailyCompleted) return 'VIEW RESULTS';
    if (isDailyExpired) return 'DAILY CHALLENGE EXPIRED';
    return 'PLAY DAILY CHALLENGE';
  };

  const getDailyButtonColor = () => {
    if (dailyCompleted) return '#9C27B0';
    if (isDailyExpired) return '#757575';
    return '#2E7D32';
  };

  const getWeeklyButtonText = () => {
    if (weeklyCompleted) return 'VIEW RESULTS';
    if (isWeeklyExpired) return 'WEEKLY CHALLENGE EXPIRED';
    return 'PLAY WEEKLY CHALLENGE';
  };

  const getWeeklyButtonColor = () => {
    if (weeklyCompleted) return '#9C27B0';
    if (isWeeklyExpired) return '#757575';
    return '#2E7D32';
  };

  // Navigation handlers
  const handleDailyChallengePress = () => {
    console.log('Daily challenge pressed - Status:', {
      completed: dailyCompleted,
      isExpired: isDailyExpired,
      hasResult: !!dailyResultData,
      category: selectedCategory,
    });
    
    if (dailyCompleted && dailyResultData) {
      const todayDate = getUTCDateString();
      const challengeId = `daily-${todayDate}-${selectedCategory}`;
      
      navigation.navigate('ChallengeResults', {
        challengeId: challengeId,
        challengeType: 'daily',
        time: dailyResultData?.bestTime,
        isPerfect: dailyResultData?.isPerfect,
        moves: dailyResultData?.moves,
        correctMoves: dailyResultData?.correctMoves,
        wrongMoves: dailyResultData?.wrongMoves,
        accuracy: dailyResultData?.accuracy,
        completed: true,
        category: selectedCategory,
      } as any);
      return;
    }
    
    if (isDailyExpired) {
      Alert.alert('Challenge Expired', 'This daily challenge has expired. Check back tomorrow!');
      return;
    }
    
    goToPlay(navigation, 'daily', {
      gridSize: currentGridSize,
      difficulty: currentDifficulty,
      category: selectedCategory
    });
  };

  const handleWeeklyChallengePress = () => {
    console.log('Weekly challenge pressed - Status:', {
      completed: weeklyCompleted,
      isExpired: isWeeklyExpired,
      hasResult: !!weeklyResultData,
      category: selectedCategory,
    });
    
    if (weeklyCompleted && weeklyResultData) {
      const weekNumber = getWeekNumber(new Date());
      const challengeId = `weekly-${weekNumber}-${selectedCategory}`;
      
      navigation.navigate('ChallengeResults', {
        challengeId: challengeId,
        challengeType: 'weekly',
        time: weeklyResultData?.bestTime,
        isPerfect: weeklyResultData?.isPerfect,
        moves: weeklyResultData?.moves,
        correctMoves: weeklyResultData?.correctMoves,
        wrongMoves: weeklyResultData?.wrongMoves,
        accuracy: weeklyResultData?.accuracy,
        completed: true,
        category: selectedCategory,
      } as any);
      return;
    }
    
    if (isWeeklyExpired) {
      Alert.alert('Challenge Expired', 'This weekly challenge has expired. Check back next week!');
      return;
    }
    
    goToPlay(navigation, 'weekly', {
      gridSize: currentGridSize,
      difficulty: currentDifficulty,
      category: selectedCategory
    });
  };

  const handleQuickPlayPress = () => {
    goToPlay(navigation, 'sequential', {
      gridSize: currentGridSize,
      difficulty: currentDifficulty,
      category: selectedCategory
    });
  };

  const handleRefreshFact = async () => {
    await loadCategoryFact(true);
  };

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
      if (currentStreak > 0) subtitle += `, ${currentStreak} ${streakText}`;
    }

    return {
      greeting: `${timeGreeting}, ${firstName}! 👋`,
      subtitle,
      showSettingsPrompt: !hasCustomSettings,
      showProfilePrompt: !profile?.name,
      settingsPromptText: 'Customize your settings',
      profilePromptText: 'Create a profile to save your progress',
    };
  };

  const greetingData = getGreeting();

  // Create challenge objects using data from challengeService
  const dailyChallenge = {
    title: dailyChallengeState.loading ? 'Loading...' : `${dailyChallengeState.emoji} ${dailyChallengeState.title}`,
    description: `Complete today's special ${currentGridSize} puzzle`,
    remainingTime: dailyRemaining,
    players: dailyChallengeState.loading ? 'Loading...' : dailyChallengeState.playerCount.toLocaleString(),
    emoji: dailyChallengeState.emoji,
    loading: dailyChallengeState.loading,
    isUrgent: !isDailyExpired && dailyRemaining !== 'Expired' && dailyRemaining.includes('h') && parseInt(dailyRemaining) < 2,
    played: dailyCompleted && !isDailyExpired,
    result: dailyResultData,
    isExpired: isDailyExpired,
  };
  
  const weeklyChallenge = {
    title: weeklyChallengeState.loading ? 'Loading...' : `${weeklyChallengeState.emoji} ${weeklyChallengeState.title}`,
    description: `A special ${currentGridSize} puzzle available all week`,
    remainingTime: weeklyRemaining,
    players: weeklyChallengeState.loading ? 'Loading...' : weeklyChallengeState.playerCount.toLocaleString(),
    emoji: weeklyChallengeState.emoji,
    loading: weeklyChallengeState.loading || isLoadingStats,
    isUrgent: !isWeeklyExpired && weeklyRemaining !== 'Expired' && weeklyRemaining.includes('d') && parseInt(weeklyRemaining) === 1,
    played: weeklyCompleted && !isWeeklyExpired,
    result: weeklyResultData,
  };

  const categoryPreview = {
    daily: dailyPreview.slice(0, 3),
    weekly: weeklyPreview.slice(0, 3),
    totalDaily: dailyItems.length,
    totalWeekly: weeklyItems.length,
  };

  const userId = auth.currentUser?.uid || 'player123';
  const userName = profile?.name?.split(' ')[0] || 'A Player';

  // Debug function
  const debugStatus = async () => {
    Alert.alert(
      'Challenge Status',
      `📅 Daily Challenge:\n` +
      `   Display: ${dailyChallenge.title}\n` +
      `   Title from service: ${dailyChallengeState.title}\n` +
      `   Emoji from service: ${dailyChallengeState.emoji}\n` +
      `   Completed: ${dailyCompleted ? '✅ Yes' : '❌ No'}\n` +
      `   Expired: ${isDailyExpired ? '✅ Yes' : '❌ No'}\n` +
      `   Remaining: ${dailyRemaining}\n` +
      `   Category: ${getCategoryDisplayName(selectedCategory)}\n` +
      `   Grid Size: ${currentGridSize}\n` +
      `   Difficulty: ${currentDifficulty}\n\n` +
      `📆 Weekly Challenge:\n` +
      `   Display: ${weeklyChallenge.title}\n` +
      `   Title from service: ${weeklyChallengeState.title}\n` +
      `   Emoji from service: ${weeklyChallengeState.emoji}\n` +
      `   Completed: ${weeklyCompleted ? '✅ Yes' : '❌ No'}\n` +
      `   Expired: ${isWeeklyExpired ? '✅ Yes' : '❌ No'}\n` +
      `   Remaining: ${weeklyRemaining}\n` +
      `   Category: ${getCategoryDisplayName(selectedCategory)}\n` +
      `   Grid Size: ${currentGridSize}\n` +
      `   Difficulty: ${currentDifficulty}`
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Debug Button */}
        <View style={styles.headerRow}>
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
          <TouchableOpacity onPress={debugStatus} style={styles.debugButton}>
            <Text style={{ color: colors.text, fontSize: 20 }}>🐛</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryBadgeContainer}>
          <Text style={[styles.categoryBadge, { 
            backgroundColor: colors.button,
            color: getContrastColor(colors.button)
          }]}>
            Current Theme: {getCategoryDisplayName(selectedCategory)} {categoryEmoji}
          </Text>
        </View>

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
          isUrgent={dailyChallenge.isUrgent}
          isLoading={dailyChallenge.loading}
          onPress={handleDailyChallengePress}
          onPlayPress={handleDailyChallengePress}
          played={dailyChallenge.played}
          result={dailyResultData}
          buttonText={getDailyButtonText()}
          buttonColor={getDailyButtonColor()}
        />

        {/* Daily Preview - Shows upcoming emojis in the daily rotation */}
        <View style={[styles.previewContainer, { backgroundColor: `${colors.button}10` }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>Coming up this week:</Text>
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Challenge</Text>
        <ChallengeCard
          type="weekly"
          title={weeklyChallenge.title}
          description={weeklyChallenge.description}
          remainingTime={weeklyChallenge.remainingTime}
          players={weeklyChallenge.players}
          emoji={weeklyChallenge.emoji}
          themeColors={colors}
          isUrgent={weeklyChallenge.isUrgent}
          isLoading={weeklyChallenge.loading}
          onPress={handleWeeklyChallengePress}
          onPlayPress={handleWeeklyChallengePress}
          played={weeklyChallenge.played}
          result={weeklyResultData}
          buttonText={getWeeklyButtonText()}
          buttonColor={getWeeklyButtonColor()}
        />

        {/* Weekly Preview - Shows upcoming emojis in the weekly rotation */}
        <View style={[styles.previewContainer, { backgroundColor: `${colors.button}10` }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>Coming up this month:</Text>
          <View style={styles.previewItems}>
            {categoryPreview.weekly.map((item, index) => (
              <View key={index} style={styles.previewItem}>
                <Text style={[styles.previewEmoji, { color: colors.text }]}>{item.emoji}</Text>
                <Text style={[styles.previewWeek, { color: colors.text }]}>Week {item.week}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Play */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Play</Text>
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

        <SettingsLink
          hasCustomSettings={hasCustomSettings}
          themeColors={colors}
          onPress={() => navigation.navigate('Settings')}
        />

        {/* Daily Fact */}
        <View style={styles.factSectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, flex: 1 }]}>
            📚 Daily {getCategoryDisplayName(selectedCategory)} Fact
          </Text>
          {factData.factName && !factData.loading && factData.factEmoji && (
            <View style={[styles.factNameBadge, { backgroundColor: colors.button }]}>
              <Text style={[styles.factNameText, { color: getContrastColor(colors.button) }]} numberOfLines={1}>
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
        <AchievementsList trophies={achievements} themeColors={colors} />

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

        {/* Share Invite */}
        <ShareInvite
          themeColors={colors}
          userId={userId}
          userName={userName}
          variant="card"
          challengeName={dailyChallenge.title}
          challengeType="daily"
        />

        <AppFooter textColor={colors.text} version="1.0.0" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 },
  debugButton: { padding: 8, marginRight: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginTop: 25, marginBottom: 10 },
  sectionSubtitle: { fontSize: 14, marginHorizontal: 20, marginBottom: 15, opacity: 0.8 },
  factSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 25, marginBottom: 10 },
  factNameBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, maxWidth: '50%' },
  factNameText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  categoryBadgeContainer: { marginHorizontal: 20, marginBottom: 10 },
  categoryBadge: { fontSize: 14, fontWeight: '600', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  previewContainer: { marginHorizontal: 20, marginTop: 10, marginBottom: 20, padding: 15, borderRadius: 12 },
  previewTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10, opacity: 0.8 },
  previewItems: { flexDirection: 'row', justifyContent: 'space-around' },
  previewItem: { alignItems: 'center' },
  previewEmoji: { fontSize: 24, marginBottom: 4 },
  previewDay: { fontSize: 12, opacity: 0.7 },
  previewWeek: { fontSize: 12, opacity: 0.7 },
});

export default HomeScreen;