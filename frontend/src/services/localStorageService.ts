// src/services/localStorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalGameStats {
  totalGames: number;
  totalPuzzlesSolved: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalPlayTime: number; // minutes
  daysPlayed: number;
  weekendPuzzles: number;
  lastPlayedDate: string | null;
  puzzlesByDate: Record<string, number>; // Track puzzles solved per day
  totalAttempts: number;
  perfectGames: number;
}

export interface LocalAchievements {
  firstSteps: number;          // 0=not started, 1=in progress, 2=completed
  puzzleEnthusiast: number;     // progress 0-50
  weekendWarrior: number;       // progress 0-30
  accuracyMaster: number;       // 0 or 1
  streakKing: number;           // progress 0-30
}

export interface LocalDailyHistory {
  date: string;
  solved: boolean;
  time?: number;
  reward?: number;
}

export interface LocalWeeklyProgress {
  currentWeek: number | null;
  puzzlesCompleted: number;
  totalTime: number;
  bestTime: number | null;
}

export interface LocalGameData {
  playerId: string;
  stats: LocalGameStats;
  achievements: LocalAchievements;
  dailyHistory: LocalDailyHistory[];
  weeklyProgress: LocalWeeklyProgress;
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    gridSize: string;
    difficulty: string;
  };
  lastSyncTimestamp: number | null;
  createdAt?: string;
}

class LocalStorageService {
  private static STORAGE_KEY = 'game_player_data';
  
  private static DEFAULT_DATA: LocalGameData = {
    playerId: '',
    stats: {
      totalGames: 0,
      totalPuzzlesSolved: 0,
      accuracy: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPlayTime: 0,
      daysPlayed: 0,
      weekendPuzzles: 0,
      lastPlayedDate: null,
      puzzlesByDate: {},
      totalAttempts: 0,
      perfectGames: 0
    },
    achievements: {
      firstSteps: 0,
      puzzleEnthusiast: 0,
      weekendWarrior: 0,
      accuracyMaster: 0,
      streakKing: 0
    },
    dailyHistory: [],
    weeklyProgress: {
      currentWeek: null,
      puzzlesCompleted: 0,
      totalTime: 0,
      bestTime: null
    },
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      gridSize: '8x8',
      difficulty: 'Easy'
    },
    lastSyncTimestamp: null
  };

  // Initialize local storage
  static async initialize(userId?: string): Promise<LocalGameData> {
    try {
      const existingData = await this.getData();
      
      if (!existingData) {
        // Create new player data
        const newData: LocalGameData = {
          ...this.DEFAULT_DATA,
          playerId: userId || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        };
        await this.saveData(newData);
        console.log('Local storage initialized for player:', newData.playerId);
        return newData;
      }
      
      // If userId provided and different, update it
      if (userId && existingData.playerId !== userId) {
        existingData.playerId = userId;
        await this.saveData(existingData);
      }
      
      return existingData;
    } catch (error) {
      console.error('Error initializing local storage:', error);
      return this.DEFAULT_DATA;
    }
  }

  // Get all data
  static async getData(): Promise<LocalGameData | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.STORAGE_KEY);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading local data:', error);
      return null;
    }
  }

  // Save all data
  static async saveData(data: LocalGameData): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(this.STORAGE_KEY, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving local data:', error);
      return false;
    }
  }

  // Update stats after solving a puzzle
  static async recordPuzzleSolved(
    timeInSeconds: number, 
    isPerfect: boolean,
    isWeekend: boolean
  ): Promise<LocalGameData | null> {
    const data = await this.getData();
    if (!data) return null;

    const today = new Date().toDateString();
    const stats = { ...data.stats };
    
    // Update puzzles solved
    stats.totalPuzzlesSolved += 1;
    stats.totalGames += 1;
    stats.totalAttempts += 1;
    
    // Track by date
    stats.puzzlesByDate[today] = (stats.puzzlesByDate[today] || 0) + 1;
    
    // Update play time
    stats.totalPlayTime += timeInSeconds / 60;
    
    // Update perfect games
    if (isPerfect) {
      stats.perfectGames += 1;
    }
    
    // Update streak
    if (stats.lastPlayedDate === this.getYesterday()) {
      stats.currentStreak += 1;
    } else if (stats.lastPlayedDate !== today) {
      stats.currentStreak = 1;
      stats.daysPlayed += 1;
    }
    
    // Update longest streak
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
    
    // Update weekend puzzles
    if (isWeekend) {
      stats.weekendPuzzles += 1;
    }
    
    // Update accuracy
    stats.accuracy = (stats.totalPuzzlesSolved / stats.totalAttempts) * 100;
    
    stats.lastPlayedDate = today;
    
    data.stats = stats;
    
    // Check achievements
    await this.checkAchievements(data);
    
    await this.saveData(data);
    return data;
  }

  // Record daily challenge
  static async recordDailyChallenge(
    solved: boolean, 
    timeInSeconds?: number, 
    reward?: number
  ): Promise<void> {
    const data = await this.getData();
    if (!data) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Add to history
    const newEntry: LocalDailyHistory = {
      date: today,
      solved,
      time: timeInSeconds,
      reward
    };
    
    data.dailyHistory = [newEntry, ...data.dailyHistory].slice(0, 7);
    
    // Update weekly progress
    await this.updateWeeklyProgress(data, solved, timeInSeconds);
    
    await this.saveData(data);
  }

  // Update weekly progress
  private static async updateWeeklyProgress(
    data: LocalGameData, 
    solved: boolean, 
    timeInSeconds?: number
  ): Promise<void> {
    const currentWeek = this.getWeekNumber(new Date());
    const weekly = data.weeklyProgress;
    
    if (weekly.currentWeek !== currentWeek) {
      // New week
      data.weeklyProgress = {
        currentWeek,
        puzzlesCompleted: solved ? 1 : 0,
        totalTime: timeInSeconds || 0,
        bestTime: timeInSeconds || null
      };
    } else {
      // Same week
      weekly.puzzlesCompleted += solved ? 1 : 0;
      if (timeInSeconds) {
        weekly.totalTime += timeInSeconds;
        if (!weekly.bestTime || timeInSeconds < weekly.bestTime) {
          weekly.bestTime = timeInSeconds;
        }
      }
    }
  }

  // Check and update achievements
  private static async checkAchievements(data: LocalGameData): Promise<void> {
    const achievements = { ...data.achievements };
    const stats = data.stats;
    
    // First Steps
    if (stats.totalPuzzlesSolved >= 1 && achievements.firstSteps === 0) {
      achievements.firstSteps = 2;
    }
    
    // Puzzle Enthusiast
    achievements.puzzleEnthusiast = Math.min(stats.totalPuzzlesSolved, 50);
    
    // Weekend Warrior
    achievements.weekendWarrior = Math.min(stats.weekendPuzzles, 30);
    
    // Accuracy Master
    if (stats.accuracy >= 95 && achievements.accuracyMaster === 0) {
      achievements.accuracyMaster = 1;
    }
    
    // Streak King
    achievements.streakKing = Math.min(stats.currentStreak, 30);
    
    data.achievements = achievements;
  }

  // Get data for home page
  static async getHomePageData() {
    const data = await this.getData();
    if (!data) return null;
    
    return {
      puzzlesSolved: data.stats.totalPuzzlesSolved,
      accuracy: data.stats.accuracy,
      currentStreak: data.stats.currentStreak,
      trophies: this.countCompletedAchievements(data.achievements),
      recentChallenges: data.dailyHistory.slice(0, 3)
    };
  }

  // Get data for statistics page
  static async getStatisticsData() {
    const data = await this.getData();
    if (!data) return null;
    
    return {
      overview: {
        puzzlesCompleted: data.stats.totalPuzzlesSolved,
        accuracy: data.stats.accuracy,
        currentStreak: data.stats.currentStreak,
        achievementsProgress: this.getAchievementsProgress(data.achievements),
        dailyProgress: data.dailyHistory.filter(d => d.solved).length,
        weeklyProgress: data.weeklyProgress.puzzlesCompleted
      },
      activity: {
        daysPlayed: data.stats.daysPlayed,
        weekendPuzzles: data.stats.weekendPuzzles,
        totalPlayTime: data.stats.totalPlayTime
      },
      streakPerformance: {
        current: data.stats.currentStreak,
        longest: data.stats.longestStreak
      },
      achievements: data.achievements
    };
  }

  private static countCompletedAchievements(achievements: LocalAchievements): number {
    let count = 0;
    if (achievements.firstSteps === 2) count++;
    if (achievements.puzzleEnthusiast === 50) count++;
    if (achievements.weekendWarrior === 30) count++;
    if (achievements.accuracyMaster === 1) count++;
    if (achievements.streakKing === 30) count++;
    return count;
  }

  private static getAchievementsProgress(achievements: LocalAchievements) {
    return {
      firstSteps: achievements.firstSteps === 2 ? 1 : 0,
      puzzleEnthusiast: achievements.puzzleEnthusiast / 50,
      weekendWarrior: achievements.weekendWarrior / 30,
      accuracyMaster: achievements.accuracyMaster,
      streakKing: achievements.streakKing / 30
    };
  }

  private static getYesterday(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toDateString();
  }

  private static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Clear all data (for testing)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export default LocalStorageService;