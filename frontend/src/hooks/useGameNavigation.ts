// src/hooks/useGameNavigation.ts
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';
import { GameMode } from '../navigation/goToPlay';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the navigation param types
type RootStackParamList = {
  Play: {
    gridSize: string;
    difficulty: string;
    challengeType?: 'daily' | 'weekly';
    challengeId?: string;
  };
  // Add other screens as needed
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Helper to get ISO week number
const getWeekNumber = (date: Date) => {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return String(
    1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
};

export const useGameNavigation = () => {
  const navigation = useNavigation<NavigationProp>();
  const { settings } = useSettings();

  const goToPlay = (mode: GameMode) => {
    console.log(`Starting ${mode} game with ${settings.gridSize} • ${settings.difficulty}`);
    
    // Create params object with proper typing
    const params = {
      gridSize: settings.gridSize,
      difficulty: settings.difficulty,
      challengeType: mode === 'sequential' ? undefined : mode,
      challengeId: mode === 'daily' 
          ? `daily-${new Date().toISOString().split('T')[0]}`
          : mode === 'weekly'
          ? `weekly-${getWeekNumber(new Date())}`
          : undefined
    };
    
    // Use type assertion if needed
    navigation.navigate('Play', params as any);
  };

  return { goToPlay };
};