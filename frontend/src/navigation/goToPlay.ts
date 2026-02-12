// src/navigation/goToPlay.ts
import { NavigationProp } from '@react-navigation/native';

export type GameMode = 'sequential' | 'daily' | 'weekly';

// Helper to get ISO week number
const getWeekNumber = (date: Date) => {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  // January 4 is always in week 1
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from week1
  return String(
    1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
};

export const goToPlay = (navigation: NavigationProp<any>, mode: GameMode) => {
  navigation.navigate('Play', { 
    gridSize: '8x8',       // default, can customize
    difficulty: 'Medium',  // default, can customize
    challengeType: mode === 'sequential' ? undefined : mode,
    challengeId: mode === 'daily' 
        ? `daily-${new Date().toISOString().split('T')[0]}`
        : mode === 'weekly'
        ? `weekly-${getWeekNumber(new Date())}` // <-- fixed
        : undefined
  });
};


