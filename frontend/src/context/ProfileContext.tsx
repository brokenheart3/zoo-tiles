// src/context/ProfileContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockDate?: string;
  category: 'game' | 'time' | 'special';
  requirement: {
    type: 'puzzles_completed' | 'accuracy' | 'streak' | 'daily_play' | 'weekend_play' | 'daily_challenges' | 'weekly_challenges' | 'perfect_games';
    value: number;
  };
}

export interface ProfileData {
  name: string;
  username: string;
  email: string;
  avatar: string;
  joinDate?: string;
  bio?: string;
  stats: {
    // Basic stats
    puzzlesSolved: number;
    dailyChallengesCompleted: number;
    weeklyChallengesCompleted: number;
    accuracy: number;
    currentStreak: number;
    longestStreak: number;
    totalPlayTime: number; // in minutes
    totalPlayDays: number;
    weekendPuzzles: number;
    perfectGames: number;
    lastPlayDate?: string;
    
    // Advanced stats
    averageTime: number; // in seconds
    bestTime: number; // in seconds
    totalMoves: number;
    totalCorrectMoves: number;
    totalWrongMoves: number;
  };
  trophies: Trophy[];
}

// Empty stats template with all fields
const emptyStats = {
  puzzlesSolved: 0,
  dailyChallengesCompleted: 0,
  weeklyChallengesCompleted: 0,
  accuracy: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalPlayTime: 0,
  totalPlayDays: 0,
  weekendPuzzles: 0,
  perfectGames: 0,
  lastPlayDate: undefined,
  averageTime: 0,
  bestTime: Infinity,
  totalMoves: 0,
  totalCorrectMoves: 0,
  totalWrongMoves: 0,
};

// Updated trophy template with new achievements
const trophyTemplate: Trophy[] = [
  {
    id: 'first_puzzle',
    name: 'First Steps',
    description: 'Complete your first puzzle',
    icon: '🎯',
    unlocked: false,
    category: 'game',
    requirement: { type: 'puzzles_completed', value: 1 },
  },
  {
    id: 'puzzle_enthusiast',
    name: 'Puzzle Enthusiast',
    description: 'Complete 50 puzzles',
    icon: '🏆',
    unlocked: false,
    category: 'game',
    requirement: { type: 'puzzles_completed', value: 50 },
  },
  {
    id: 'puzzle_master',
    name: 'Puzzle Master',
    description: 'Complete 500 puzzles',
    icon: '👑',
    unlocked: false,
    category: 'game',
    requirement: { type: 'puzzles_completed', value: 500 },
  },
  {
    id: 'daily_challenger',
    name: 'Daily Challenger',
    description: 'Complete 7 daily challenges',
    icon: '📅',
    unlocked: false,
    category: 'game',
    requirement: { type: 'daily_challenges', value: 7 },
  },
  {
    id: 'daily_champion',
    name: 'Daily Champion',
    description: 'Complete 30 daily challenges',
    icon: '🌟',
    unlocked: false,
    category: 'game',
    requirement: { type: 'daily_challenges', value: 30 },
  },
  {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Complete 4 weekly challenges',
    icon: '📆',
    unlocked: false,
    category: 'game',
    requirement: { type: 'weekly_challenges', value: 4 },
  },
  {
    id: 'weekly_champion',
    name: 'Weekly Champion',
    description: 'Complete 12 weekly challenges',
    icon: '⭐',
    unlocked: false,
    category: 'game',
    requirement: { type: 'weekly_challenges', value: 12 },
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 30 puzzles on weekends',
    icon: '🌅',
    unlocked: false,
    category: 'time',
    requirement: { type: 'weekend_play', value: 30 },
  },
  {
    id: 'accuracy_apprentice',
    name: 'Accuracy Apprentice',
    description: 'Achieve 80% accuracy',
    icon: '🎯',
    unlocked: false,
    category: 'game',
    requirement: { type: 'accuracy', value: 80 },
  },
  {
    id: 'accuracy_master',
    name: 'Accuracy Master',
    description: 'Achieve 95% accuracy',
    icon: '🎯',
    unlocked: false,
    category: 'game',
    requirement: { type: 'accuracy', value: 95 },
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    unlocked: false,
    category: 'time',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_king',
    name: 'Streak King',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    unlocked: false,
    category: 'time',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'perfect_beginner',
    name: 'Perfect Beginner',
    description: 'Get your first perfect game',
    icon: '✨',
    unlocked: false,
    category: 'game',
    requirement: { type: 'perfect_games', value: 1 },
  },
  {
    id: 'perfect_master',
    name: 'Perfect Master',
    description: 'Get 10 perfect games',
    icon: '💫',
    unlocked: false,
    category: 'game',
    requirement: { type: 'perfect_games', value: 10 },
  },
  {
    id: 'dedicated_player',
    name: 'Dedicated Player',
    description: 'Play on 30 different days',
    icon: '📅',
    unlocked: false,
    category: 'time',
    requirement: { type: 'daily_play', value: 30 },
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play on 100 different days',
    icon: '🎖️',
    unlocked: false,
    category: 'time',
    requirement: { type: 'daily_play', value: 100 },
  },
];

interface ProfileContextType {
  profile: ProfileData | null;
  updateProfile: (newProfile: Partial<ProfileData>) => Promise<void>;
  updateStats: (stats: Partial<ProfileData['stats']>) => Promise<void>;
  incrementPuzzlesSolved: (
    timeInSeconds: number, 
    moves: number, 
    correctMoves: number, 
    wrongMoves: number, 
    isPerfect: boolean, 
    isWeekend: boolean,
    isDaily?: boolean,
    isWeekly?: boolean
  ) => Promise<void>;
  resetProfile: () => Promise<void>;
  unlockTrophy: (trophyId: string) => Promise<void>;
  checkAndUnlockTrophies: () => Promise<Trophy[]>;
  getUnlockedTrophies: () => Trophy[];
  getLockedTrophies: () => Trophy[];
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  registerStatsRefresh: (callback: () => void) => void; // Add this
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsRefreshCallback, setStatsRefreshCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Try to load from AsyncStorage first
      const savedProfile = await AsyncStorage.getItem('userProfile');
      
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile({
          ...parsed,
          stats: {
            ...emptyStats,
            ...parsed.stats,
            bestTime: parsed.stats?.bestTime || Infinity,
          },
          trophies: parsed.trophies || trophyTemplate,
        });
      } else {
        // Create default profile
        setProfile({
          name: '',
          username: '',
          email: '',
          avatar: '😎',
          joinDate: new Date().toISOString().split('T')[0],
          stats: { ...emptyStats, bestTime: Infinity },
          trophies: trophyTemplate,
        });
      }

      // If user is logged in, sync with Firebase
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const firebaseData = userDoc.data();
          if (firebaseData.profile) {
            const mergedProfile = {
              ...firebaseData.profile,
              stats: {
                ...emptyStats,
                ...firebaseData.profile.stats,
                bestTime: firebaseData.profile.stats?.bestTime || Infinity,
              },
              trophies: firebaseData.profile.trophies || trophyTemplate,
            };
            setProfile(mergedProfile);
            await AsyncStorage.setItem('userProfile', JSON.stringify(mergedProfile));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile({
        name: '',
        username: '',
        email: '',
        avatar: '😎',
        joinDate: new Date().toISOString().split('T')[0],
        stats: { ...emptyStats, bestTime: Infinity },
        trophies: trophyTemplate,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add refreshProfile function
  const refreshProfile = useCallback(async () => {
    console.log('🔄 Refreshing profile from AsyncStorage');
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile({
          ...parsed,
          stats: {
            ...emptyStats,
            ...parsed.stats,
            bestTime: parsed.stats?.bestTime || Infinity,
          },
          trophies: parsed.trophies || trophyTemplate,
        });
        console.log('✅ Profile refreshed, perfectGames:', parsed.stats?.perfectGames);
        
        // Call the stats refresh callback if it exists
        if (statsRefreshCallback) {
          console.log('📊 Calling stats refresh callback');
          statsRefreshCallback();
        }
      } else {
        console.log('⚠️ No profile found in AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Failed to refresh profile:', error);
    }
  }, [statsRefreshCallback]);

  // Add function to register stats screen callback
  const registerStatsRefresh = useCallback((callback: () => void) => {
    console.log('📊 Stats screen registered for refresh');
    setStatsRefreshCallback(() => callback);
  }, []);

  const updateProfile = async (newProfile: Partial<ProfileData>) => {
    
    if (!profile) {
      console.log('❌ No profile in updateProfile');
      return;
    }
    
    console.log('💾 updateProfile called with perfectGames:', newProfile.stats?.perfectGames);
    
    const updatedProfile = { ...profile, ...newProfile };
    console.log('📝 Updated profile perfectGames:', updatedProfile.stats.perfectGames);
    
    setProfile(updatedProfile);
    
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      console.log('✅ Saved to AsyncStorage');
      
      // Verify AsyncStorage
      const saved = await AsyncStorage.getItem('userProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📖 AsyncStorage verification - perfectGames:', parsed.stats.perfectGames);
      }
      
      // Call the stats refresh callback if it exists
      if (statsRefreshCallback) {
        console.log('📊 Calling stats refresh callback from updateProfile');
        statsRefreshCallback();
      }
    } catch (error) {
      console.error('❌ Failed to save profile:', error);
    }
  };

  const updateStats = async (newStats: Partial<ProfileData['stats']>) => {
    console.log('💾 updateStats called with perfectGames:', newStats.perfectGames);
    if (!profile) {
      console.log('❌ No profile in updateStats');
      return;
    }
    
    const updatedStats = { ...profile.stats, ...newStats };
    console.log('📝 Merged stats - perfectGames:', updatedStats.perfectGames);
    
    await updateProfile({ stats: updatedStats });
  };

  const incrementPuzzlesSolved = async (
    timeInSeconds: number,
    moves: number,
    correctMoves: number,
    wrongMoves: number,
    isPerfect: boolean,
    isWeekend: boolean,
    isDaily: boolean = false,
    isWeekly: boolean = false
  ) => {
    if (!profile) {
      return;
    }

    const now = new Date();
    const lastPlayedDate = profile.stats.lastPlayDate ? new Date(profile.stats.lastPlayDate) : null;
    
    // Calculate streak
    let streak = profile.stats.currentStreak;
    let totalPlayDays = profile.stats.totalPlayDays;

    if (!lastPlayedDate || now.toDateString() !== lastPlayedDate.toDateString()) {
      streak += 1;
      totalPlayDays += 1;
    }

    // Calculate new accuracy
    const totalMoves = profile.stats.totalMoves + moves;
    const totalCorrectMoves = profile.stats.totalCorrectMoves + correctMoves;
    
    const newAccuracy = totalMoves > 0 ? Number(((totalCorrectMoves / totalMoves) * 100).toFixed(1)) : 0;

    // Calculate new average time
    const totalPlayTimeSeconds = profile.stats.averageTime * profile.stats.puzzlesSolved + timeInSeconds;
    const newAverageTime = profile.stats.puzzlesSolved > 0 
      ? Number((totalPlayTimeSeconds / (profile.stats.puzzlesSolved + 1)).toFixed(1))
      : timeInSeconds;

    // Update best time
    const newBestTime = Math.min(
      profile.stats.bestTime === Infinity ? timeInSeconds : profile.stats.bestTime,
      timeInSeconds
    );

    // Calculate daily and weekly challenge counts
    let dailyChallengesCompleted = profile.stats.dailyChallengesCompleted;
    let weeklyChallengesCompleted = profile.stats.weeklyChallengesCompleted;

    if (isDaily) {
      dailyChallengesCompleted += 1;
      console.log('📅 Daily challenge completed! Total:', dailyChallengesCompleted);
    }
    
    if (isWeekly) {
      weeklyChallengesCompleted += 1;
      console.log('📆 Weekly challenge completed! Total:', weeklyChallengesCompleted);
    }

    // CRITICAL: Calculate total play time in MINUTES
    const timeInMinutes = Math.floor(timeInSeconds / 60);
    const newTotalPlayTime = (profile.stats.totalPlayTime || 0) + timeInMinutes;

    // Calculate new perfect games count
    const newPerfectGames = isPerfect ? profile.stats.perfectGames + 1 : profile.stats.perfectGames;
    console.log('3️⃣ New perfectGames calculation:', {
      isPerfect,
      oldValue: profile.stats.perfectGames,
      newValue: newPerfectGames
    });

    const updatedStats = {
      puzzlesSolved: profile.stats.puzzlesSolved + 1,
      dailyChallengesCompleted,
      weeklyChallengesCompleted,
      accuracy: newAccuracy,
      currentStreak: streak,
      longestStreak: Math.max(streak, profile.stats.longestStreak),
      totalPlayTime: newTotalPlayTime,
      totalPlayDays,
      weekendPuzzles: isWeekend ? profile.stats.weekendPuzzles + 1 : profile.stats.weekendPuzzles,
      perfectGames: newPerfectGames,
      lastPlayDate: now.toISOString(),
      averageTime: newAverageTime,
      bestTime: newBestTime,
      totalMoves: profile.stats.totalMoves + moves,
      totalCorrectMoves: profile.stats.totalCorrectMoves + correctMoves,
      totalWrongMoves: profile.stats.totalWrongMoves + wrongMoves,
    };

    await updateStats(updatedStats);
    
    await checkAndUnlockTrophies();
  };

  const unlockTrophy = async (trophyId: string) => {
    if (!profile) return;
    
    const updatedTrophies = profile.trophies.map(trophy =>
      trophy.id === trophyId && !trophy.unlocked
        ? { ...trophy, unlocked: true, unlockDate: new Date().toISOString().split('T')[0] }
        : trophy
    );
    
    await updateProfile({ trophies: updatedTrophies });
  };

  const checkAndUnlockTrophies = async (): Promise<Trophy[]> => {
    if (!profile) return [];
    
    const updatedTrophies = profile.trophies.map(trophy => {
      if (trophy.unlocked) return trophy;

      let shouldUnlock = false;
      switch (trophy.requirement.type) {
        case 'puzzles_completed':
          shouldUnlock = profile.stats.puzzlesSolved >= trophy.requirement.value;
          break;
        case 'daily_challenges':
          shouldUnlock = profile.stats.dailyChallengesCompleted >= trophy.requirement.value;
          break;
        case 'weekly_challenges':
          shouldUnlock = profile.stats.weeklyChallengesCompleted >= trophy.requirement.value;
          break;
        case 'accuracy':
          shouldUnlock = profile.stats.accuracy >= trophy.requirement.value;
          console.log(`🏆 Checking accuracy trophy: ${profile.stats.accuracy.toFixed(1)}% >= ${trophy.requirement.value}% = ${shouldUnlock}`);
          break;
        case 'streak':
          shouldUnlock = profile.stats.currentStreak >= trophy.requirement.value;
          break;
        case 'daily_play':
          shouldUnlock = profile.stats.totalPlayDays >= trophy.requirement.value;
          break;
        case 'weekend_play':
          shouldUnlock = profile.stats.weekendPuzzles >= trophy.requirement.value;
          break;
        case 'perfect_games':
          shouldUnlock = profile.stats.perfectGames >= trophy.requirement.value;
          break;
      }

      return shouldUnlock ? { ...trophy, unlocked: true, unlockDate: new Date().toISOString().split('T')[0] } : trophy;
    });

    const newlyUnlocked = updatedTrophies.filter(
      (trophy, index) => trophy.unlocked && profile.trophies[index] && !profile.trophies[index].unlocked
    );

    if (newlyUnlocked.length > 0) {
      console.log('🏆 New trophies unlocked:', newlyUnlocked.map(t => t.name));
      await updateProfile({ trophies: updatedTrophies });
    }

    return newlyUnlocked;
  };

  const getUnlockedTrophies = (): Trophy[] => profile?.trophies.filter(t => t.unlocked) || [];
  const getLockedTrophies = (): Trophy[] => profile?.trophies.filter(t => !t.unlocked) || [];

  const resetProfile = async () => {
    setProfile({
      name: '',
      username: '',
      email: '',
      avatar: '😎',
      joinDate: new Date().toISOString().split('T')[0],
      stats: { ...emptyStats, bestTime: Infinity },
      trophies: trophyTemplate,
    });
    
    try {
      await AsyncStorage.removeItem('userProfile');
      
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { profile: null }, { merge: true });
      }
    } catch (error) {
      console.error('Failed to reset profile:', error);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        updateStats,
        incrementPuzzlesSolved,
        resetProfile,
        unlockTrophy,
        checkAndUnlockTrophies,
        getUnlockedTrophies,
        getLockedTrophies,
        isLoading,
        refreshProfile,
        registerStatsRefresh,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};