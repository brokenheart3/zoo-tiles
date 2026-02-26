// src/types/navigation.ts
import type { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Play: {
    gridSize: string;
    difficulty: string;
    challengeType?: 'daily' | 'weekly';
    challengeId?: string;
  };
  Challenge: {
    screen: 'Daily' | 'Weekly';
  };
  Settings: undefined;
  Profile: undefined;
  GameResults: {
    time: number;
    isPerfect: boolean;
    mode: string;
    difficulty: string;
    gridSize: string;
  };
};

export type PlayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Play'>;
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;