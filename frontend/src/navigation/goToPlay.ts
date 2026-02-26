// src/navigation/goToPlay.ts
import { NavigationProp } from '@react-navigation/native';

export type GameMode = 'sequential' | 'daily' | 'weekly';

const getWeekNumber = (date: Date) => {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return String(
    1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
};

export const goToPlay = (
  navigation: NavigationProp<any>,
  mode: GameMode,
  options?: { gridSize?: string; difficulty?: string }
) => {
  const params = {
    gridSize: options?.gridSize || '8x8',
    difficulty: options?.difficulty || 'Medium',
    challengeType: mode === 'sequential' ? undefined : mode,
    challengeId: mode === 'daily' 
        ? `daily-${new Date().toISOString().split('T')[0]}`
        : mode === 'weekly'
        ? `weekly-${getWeekNumber(new Date())}`
        : undefined
  };
  
  console.log('🔍 goToPlay - Navigating with params:', JSON.stringify(params, null, 2));
  
  navigation.navigate('Play', params);
};