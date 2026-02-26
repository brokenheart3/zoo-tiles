// src/navigation/types.ts
export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Play: {
    gridSize: string;
    difficulty: string;
    challengeType?: 'daily' | 'weekly';
    challengeId?: string;
  };
  DailyChallenge: undefined;
  WeeklyChallenge: undefined;
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
  GameResults: {
    time: number;
    isPerfect: boolean;
    mode: string;
    difficulty: string;
    gridSize: string;
    moves: number;
  };
  Settings: undefined;
  Profile: undefined;
  Notifications: undefined;
};