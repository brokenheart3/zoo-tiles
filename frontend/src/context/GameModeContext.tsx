// src/context/GameModeContext.tsx (updated)
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { auth } from '../services/firebase';
import { getUserChallengeResult } from '../services/userService';
import { 
  getUTCDateString, 
  getWeekNumber, 
  isDailyChallengeActive, 
  isWeeklyChallengeActive,
  getDailyTimeRemaining,
  getWeeklyTimeRemaining,
  debugUTCTime
} from '../utils/timeUtils';
import { Category } from '../services/api';

type Mode = 'sequential' | 'daily' | 'weekly';

interface ChallengeCompletion {
  completed: boolean;
  result: any;
}

interface ChallengeLockStatus {
  isActive: boolean;
  isExpired: boolean;
  isCompleted: boolean;
  remainingTime: string;
  canPlay: boolean;
  canViewResults: boolean;
}

interface GameModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  dailyCompletion: ChallengeCompletion;
  weeklyCompletion: ChallengeCompletion;
  dailyLockStatus: ChallengeLockStatus;
  weeklyLockStatus: ChallengeLockStatus;
  refreshChallengeStatus: (category?: Category) => Promise<void>;
  markChallengeCompleted: (type: 'daily' | 'weekly', result: any, category?: Category) => Promise<void>;
  refreshTimers: () => void;
}

const GameModeContext = createContext<GameModeContextType | undefined>(undefined);

export const GameModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>('sequential');
  const [dailyCompletion, setDailyCompletion] = useState<ChallengeCompletion>({ completed: false, result: null });
  const [weeklyCompletion, setWeeklyCompletion] = useState<ChallengeCompletion>({ completed: false, result: null });
  const [dailyLockStatus, setDailyLockStatus] = useState<ChallengeLockStatus>({
    isActive: true,
    isExpired: false,
    isCompleted: false,
    remainingTime: 'Loading...',
    canPlay: true,
    canViewResults: false,
  });
  const [weeklyLockStatus, setWeeklyLockStatus] = useState<ChallengeLockStatus>({
    isActive: true,
    isExpired: false,
    isCompleted: false,
    remainingTime: 'Loading...',
    canPlay: true,
    canViewResults: false,
  });
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const currentCategoryRef = useRef<Category>('animals');
  let refreshPromise: Promise<void> | null = null;

  const updateLockStatus = useCallback(() => {
    const dailyActive = isDailyChallengeActive();
    const weeklyActive = isWeeklyChallengeActive();
    
    const dailyRemaining = getDailyTimeRemaining();
    const weeklyRemaining = getWeeklyTimeRemaining();
    
    const dailyIsExpired = !dailyActive;
    const weeklyIsExpired = !weeklyActive;
    
    setDailyLockStatus({
      isActive: dailyActive,
      isExpired: dailyIsExpired,
      isCompleted: dailyCompletion.completed,
      remainingTime: dailyRemaining,
      canPlay: true,
      canViewResults: dailyCompletion.completed || dailyIsExpired,
    });
    
    setWeeklyLockStatus({
      isActive: weeklyActive,
      isExpired: weeklyIsExpired,
      isCompleted: weeklyCompletion.completed,
      remainingTime: weeklyRemaining,
      canPlay: true,
      canViewResults: weeklyCompletion.completed || weeklyIsExpired,
    });
  }, [dailyCompletion.completed, weeklyCompletion.completed]);

  const refreshChallengeStatus = useCallback(async (category: Category = 'animals'): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in, cannot refresh challenge status');
      return;
    }

    // Prevent concurrent refreshes
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        currentCategoryRef.current = category;
        const todayId = `daily-${getUTCDateString()}-${category}`;
        const weekId = `weekly-${getWeekNumber(new Date())}-${category}`;
        
        console.log('🔄 Refreshing challenge status:', { todayId, weekId, category });
        
        const [daily, weekly] = await Promise.all([
          getUserChallengeResult(user.uid, todayId),
          getUserChallengeResult(user.uid, weekId)
        ]);
        
        const dailyCompleted = daily?.completed === true;
        const weeklyCompleted = weekly?.completed === true;
        
        console.log('📊 Results from Firebase:');
        console.log('   Daily:', dailyCompleted, daily?.bestTime ? `Time: ${daily.bestTime}s` : '');
        console.log('   Weekly:', weeklyCompleted, weekly?.bestTime ? `Time: ${weekly.bestTime}s` : '');
        
        setDailyCompletion({ completed: dailyCompleted, result: daily });
        setWeeklyCompletion({ completed: weeklyCompleted, result: weekly });
        
        updateLockStatus();
        
        // Dispatch event for other components to know status changed
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('challengeStatusChanged', { 
            detail: { daily: dailyCompleted, weekly: weeklyCompleted, category }
          }));
        }
      } catch (error) {
        console.error('Error refreshing challenge status:', error);
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }, [updateLockStatus]);

  const markChallengeCompleted = useCallback(async (type: 'daily' | 'weekly', result: any, category: Category = 'animals') => {
    console.log('🏆 markChallengeCompleted called:', { type, category, result });
    
    // Update local state immediately for UI responsiveness
    if (type === 'daily') {
      setDailyCompletion({ completed: true, result });
      console.log('✅ Daily challenge marked as completed in context (local)');
    } else {
      setWeeklyCompletion({ completed: true, result });
      console.log('✅ Weekly challenge marked as completed in context (local)');
    }
    
    updateLockStatus();
    
    // Wait a moment for Firestore to save the data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // IMPORTANT: Refresh from Firebase to ensure consistency
    console.log('🔄 Refreshing from Firebase to confirm completion...');
    await refreshChallengeStatus(category);
    
    console.log('✅ Challenge status refreshed from Firebase after completion');
  }, [updateLockStatus, refreshChallengeStatus]);

  const refreshTimers = useCallback(() => {
    updateLockStatus();
  }, [updateLockStatus]);

  // Start timer for real-time updates
  useEffect(() => {
    const startTimer = () => {
      if (timerInterval) clearInterval(timerInterval);
      const interval = setInterval(() => {
        updateLockStatus();
      }, 1000);
      setTimerInterval(interval);
    };
    
    startTimer();
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  // Listen for auth state changes and load initial status
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialStatus = async (user: any) => {
      if (!user || !isMounted) return;
      
      console.log('🔐 User authenticated, loading challenge status from Firebase...');
      await refreshChallengeStatus();
      setIsInitialLoad(false);
    };
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('User logged in:', user.uid);
        await loadInitialStatus(user);
        debugUTCTime();
      } else {
        console.log('No user logged in, resetting challenge status');
        if (isMounted) {
          setDailyCompletion({ completed: false, result: null });
          setWeeklyCompletion({ completed: false, result: null });
          updateLockStatus();
        }
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [refreshChallengeStatus, updateLockStatus]);

  // Listen for category changes from settings
  useEffect(() => {
    const handleCategoryChange = (event: any) => {
      const newCategory = event.detail?.category;
      if (newCategory && newCategory !== currentCategoryRef.current) {
        console.log('🔄 Category changed to:', newCategory);
        refreshChallengeStatus(newCategory);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('categoryChanged', handleCategoryChange);
      return () => window.removeEventListener('categoryChanged', handleCategoryChange);
    }
  }, [refreshChallengeStatus]);

  // Auto-refresh every 5 minutes to sync with Firebase
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      const user = auth.currentUser;
      if (user && !isInitialLoad) {
        console.log('🔄 Auto-refreshing challenge status...');
        refreshChallengeStatus(currentCategoryRef.current);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(autoRefreshInterval);
  }, [refreshChallengeStatus, isInitialLoad]);

  return (
    <GameModeContext.Provider value={{ 
      mode, 
      setMode,
      dailyCompletion,
      weeklyCompletion,
      dailyLockStatus,
      weeklyLockStatus,
      refreshChallengeStatus,
      markChallengeCompleted,
      refreshTimers,
    }}>
      {children}
    </GameModeContext.Provider>
  );
};

export const useGameMode = () => {
  const context = useContext(GameModeContext);
  if (!context) {
    throw new Error('useGameMode must be used within GameModeProvider');
  }
  return context;
};
