// src/types/auth.ts
export interface UserStats {
  puzzlesSolved: number;
  accuracy: number;
  currentStreak: number;
  totalPlayDays: number;
  weekendPuzzles: number;
  lastPlayDate: string | null;
  
  // Add these new stats
  dailyChallengesCompleted: number;
  weeklyChallengesCompleted: number;
  perfectGames: number;
  bestTime: number;
  averageTime: number;
  totalPlayTime: number;
  longestStreak: number;
  totalMoves: number;
  totalCorrectMoves: number;
  totalWrongMoves: number;
  
  // Position tracking stats
  firstPlaceWins: number;
  secondPlaceWins: number;
  thirdPlaceWins: number;
  dailyFirstPlace: number;
  dailySecondPlace: number;
  dailyThirdPlace: number;
  weeklyFirstPlace: number;
  weeklySecondPlace: number;
  weeklyThirdPlace: number;
}

export interface UserSettings {
  gridSize: string;
  difficulty: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  authProvider: string;
  createdAt: string;
  stats: UserStats;
  settings: UserSettings;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile?: (updates: Partial<User>) => Promise<void>;
}

export interface SignInFormData {
  email: string;
  password: string;
  username?: string;
}