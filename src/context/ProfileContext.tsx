// Update src/context/ProfileContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Trophy/Achievement type
export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  unlocked: boolean;
  unlockDate?: string;
  category: 'game' | 'time' | 'special';
  requirement: {
    type: 'puzzles_completed' | 'accuracy' | 'streak' | 'daily_play' | 'weekend_play';
    value: number;
  };
}

// Profile data type
export interface ProfileData {
  name: string;
  username: string;
  email: string;
  avatar: string;
  joinDate: string;
  bio: string;
  stats: {
    puzzlesSolved: number;
    accuracy: number; // Change from string to number for calculations
    currentStreak: number;
    totalPlayDays: number;
    lastPlayDate?: string;
    weekendPuzzles: number;
  };
  trophies: Trophy[];
}

// Default profile data
const defaultProfile: ProfileData = {
  name: 'Chamal Kayssar',
  username: '@chamal_plays',
  email: 'chamal@example.com',
  avatar: '😎',
  joinDate: 'Joined January 2024',
  bio: 'Puzzle enthusiast and problem solver',
  stats: {
    puzzlesSolved: 987,
    accuracy: 92, // Percentage as number
    currentStreak: 7,
    totalPlayDays: 45,
    weekendPuzzles: 120,
  },
  trophies: [
    {
      id: 'first_puzzle',
      name: 'First Steps',
      description: 'Complete your first puzzle',
      icon: '🎯',
      unlocked: true,
      unlockDate: '2024-01-01',
      category: 'game',
      requirement: { type: 'puzzles_completed', value: 1 }
    },
    {
      id: 'puzzle_enthusiast',
      name: 'Puzzle Enthusiast',
      description: 'Complete 50 puzzles',
      icon: '🏆',
      unlocked: true,
      unlockDate: '2024-01-15',
      category: 'game',
      requirement: { type: 'puzzles_completed', value: 50 }
    },
    {
      id: 'weekend_warrior',
      name: 'Weekend Warrior',
      description: 'Complete 30 puzzles on weekends',
      icon: '🌅',
      unlocked: true,
      unlockDate: '2024-02-01',
      category: 'time',
      requirement: { type: 'weekend_play', value: 30 }
    },
    {
      id: 'accuracy_master',
      name: 'Accuracy Master',
      description: 'Achieve 95% accuracy',
      icon: '🎯',
      unlocked: false,
      category: 'game',
      requirement: { type: 'accuracy', value: 95 }
    },
    {
      id: 'streak_king',
      name: 'Streak King',
      description: 'Maintain a 30-day streak',
      icon: '🔥',
      unlocked: false,
      category: 'time',
      requirement: { type: 'streak', value: 30 }
    },
    {
      id: 'puzzle_master',
      name: 'Puzzle Master',
      description: 'Complete 500 puzzles',
      icon: '👑',
      unlocked: false,
      category: 'game',
      requirement: { type: 'puzzles_completed', value: 500 }
    },
    {
      id: 'daily_player',
      name: 'Daily Player',
      description: 'Play for 7 consecutive days',
      icon: '📅',
      unlocked: true,
      unlockDate: '2024-01-08',
      category: 'time',
      requirement: { type: 'daily_play', value: 7 }
    },
    {
      id: 'quick_learner',
      name: 'Quick Learner',
      description: 'Achieve 80% accuracy',
      icon: '🚀',
      unlocked: true,
      unlockDate: '2024-01-05',
      category: 'game',
      requirement: { type: 'accuracy', value: 80 }
    },
  ],
};

interface ProfileContextType {
  profile: ProfileData;
  updateProfile: (newProfile: Partial<ProfileData>) => Promise<void>;
  resetProfile: () => Promise<void>;
  unlockTrophy: (trophyId: string) => Promise<void>;
  checkAndUnlockTrophies: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load profile from AsyncStorage on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const updateProfile = async (newProfile: Partial<ProfileData>) => {
    const updatedProfile = { ...profile, ...newProfile };
    setProfile(updatedProfile);
    
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const unlockTrophy = async (trophyId: string) => {
    const updatedTrophies = profile.trophies.map(trophy => {
      if (trophy.id === trophyId && !trophy.unlocked) {
        return {
          ...trophy,
          unlocked: true,
          unlockDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        };
      }
      return trophy;
    });

    const updatedProfile = { ...profile, trophies: updatedTrophies };
    setProfile(updatedProfile);
    
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to save trophy:', error);
    }
  };

  const checkAndUnlockTrophies = async () => {
    const updatedTrophies = profile.trophies.map(trophy => {
      // Skip already unlocked trophies
      if (trophy.unlocked) return trophy;

      let shouldUnlock = false;
      
      switch (trophy.requirement.type) {
        case 'puzzles_completed':
          shouldUnlock = profile.stats.puzzlesSolved >= trophy.requirement.value;
          break;
        case 'accuracy':
          shouldUnlock = profile.stats.accuracy >= trophy.requirement.value;
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
      }

      if (shouldUnlock) {
        return {
          ...trophy,
          unlocked: true,
          unlockDate: new Date().toISOString().split('T')[0]
        };
      }
      
      return trophy;
    });

    // Check if any trophies were newly unlocked
    const newlyUnlocked = updatedTrophies.filter((trophy, index) => 
      trophy.unlocked && !profile.trophies[index].unlocked
    );

    if (newlyUnlocked.length > 0) {
      const updatedProfile = { ...profile, trophies: updatedTrophies };
      setProfile(updatedProfile);
      
      try {
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      } catch (error) {
        console.error('Failed to save trophies:', error);
      }

      return newlyUnlocked;
    }

    return [];
  };

  const resetProfile = async () => {
    setProfile(defaultProfile);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(defaultProfile));
    } catch (error) {
      console.error('Failed to reset profile:', error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      updateProfile, 
      resetProfile,
      unlockTrophy,
      checkAndUnlockTrophies 
    }}>
      {children}
    </ProfileContext.Provider>
  );
};