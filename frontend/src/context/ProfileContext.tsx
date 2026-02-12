// src/context/ProfileContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockDate?: string;
  category: 'game' | 'time' | 'special';
  requirement: {
    type: 'puzzles_completed' | 'accuracy' | 'streak' | 'daily_play' | 'weekend_play';
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
    puzzlesSolved: number;
    accuracy: number;
    currentStreak: number;
    totalPlayDays: number;
    lastPlayDate?: string;
    weekendPuzzles: number;
  };
  trophies: Trophy[];
}

// Empty stats template
const emptyStats = {
  puzzlesSolved: 0,
  accuracy: 0,
  currentStreak: 0,
  totalPlayDays: 0,
  weekendPuzzles: 0,
};

// Example trophy template (all locked)
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
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 30 puzzles on weekends',
    icon: '🌅',
    unlocked: false,
    category: 'time',
    requirement: { type: 'weekend_play', value: 30 },
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
    id: 'streak_king',
    name: 'Streak King',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    unlocked: false,
    category: 'time',
    requirement: { type: 'streak', value: 30 },
  },
];

interface ProfileContextType {
  profile: ProfileData | null;
  updateProfile: (newProfile: Partial<ProfileData>) => Promise<void>;
  resetProfile: () => Promise<void>;
  unlockTrophy: (trophyId: string) => Promise<void>;
  checkAndUnlockTrophies: () => Promise<Trophy[]>;
  getUnlockedTrophies: () => Trophy[];
  getLockedTrophies: () => Trophy[];
  isLoading: boolean;
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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile({
          ...parsed,
          stats: { ...emptyStats }, // always fresh stats
          trophies: parsed.trophies || trophyTemplate, // all locked if missing
        });
      } else {
        // if no saved profile, create empty profile
        setProfile({
          name: '',
          username: '',
          email: '',
          avatar: '',
          stats: { ...emptyStats },
          trophies: trophyTemplate,
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile({
        name: '',
        username: '',
        email: '',
        avatar: '',
        stats: { ...emptyStats },
        trophies: trophyTemplate,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (newProfile: Partial<ProfileData>) => {
    if (!profile) return;
    const updatedProfile = { ...profile, ...newProfile };
    setProfile(updatedProfile);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const unlockTrophy = async (trophyId: string) => {
    if (!profile) return;
    const updatedTrophies = profile.trophies.map(trophy =>
      trophy.id === trophyId && !trophy.unlocked
        ? { ...trophy, unlocked: true, unlockDate: new Date().toISOString().split('T')[0] }
        : trophy
    );
    const updatedProfile = { ...profile, trophies: updatedTrophies };
    setProfile(updatedProfile);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to save trophy:', error);
    }
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

      return shouldUnlock ? { ...trophy, unlocked: true, unlockDate: new Date().toISOString().split('T')[0] } : trophy;
    });

    const newlyUnlocked = updatedTrophies.filter(
      (trophy, index) => trophy.unlocked && profile.trophies[index] && !profile.trophies[index].unlocked
    );

    if (newlyUnlocked.length > 0) {
      const updatedProfile = { ...profile, trophies: updatedTrophies };
      setProfile(updatedProfile);
      try {
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      } catch (error) {
        console.error('Failed to save trophies:', error);
      }
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
      avatar: '',
      stats: { ...emptyStats },
      trophies: trophyTemplate,
    });
    try {
      await AsyncStorage.removeItem('userProfile');
    } catch (error) {
      console.error('Failed to reset profile:', error);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        resetProfile,
        unlockTrophy,
        checkAndUnlockTrophies,
        getUnlockedTrophies,
        getLockedTrophies,
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
