// src/types/challenge.ts

export type ChallengeType = 'daily' | 'weekly';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

// All 40 categories from your API
export type ChallengeCategory = 
  | 'aircraft'
  | 'animals'
  | 'arabic'
  | 'birds'
  | 'bugs'
  | 'cars'
  | 'clothing'
  | 'colors'
  | 'cyrillic'
  | 'devanagari'
  | 'emotions'
  | 'fantasy'
  | 'fish'
  | 'flags'
  | 'flowers'
  | 'food'
  | 'fruits'
  | 'games'
  | 'geography'
  | 'greek'
  | 'hebrew'
  | 'holidays'
  | 'latin'
  | 'math'
  | 'music'
  | 'numbers'
  | 'office'
  | 'planets'
  | 'plants'
  | 'roadSigns'
  | 'science'
  | 'shapes'
  | 'sports'
  | 'tech'
  | 'time'
  | 'tools'
  | 'trains'
  | 'transport'
  | 'vegetables'
  | 'weather';

// Challenge metadata (name, category, etc.)
export interface ChallengeMetadata {
  challengeId: string;
  challengeType: ChallengeType;
  name: string;
  category: ChallengeCategory;
  categoryDisplayName: string;
  icon: string;
  gridSize: string;
  difficulty: Difficulty;
  createdAt: Date;
}

// Player participation in a challenge
export interface ChallengeParticipation {
  userId: string;
  challengeId: string;
  challengeType: ChallengeType;
  gridSize: string;
  score: number;
  displayName: string;
  photoURL?: string;
  submittedAt: Date;
  _score: number;
  _challengeId: string;
  _challengeType: ChallengeType;
  challengeName?: string;  // Added for sharing
  category?: ChallengeCategory;  // Added for sharing
  categoryDisplayName?: string;  // Added for sharing
}

// Player rank information
export interface PlayerRank {
  position: number;
  totalPlayers: number;
  score: number;
  percentile: number;
  displayName: string;
  photoURL?: string;
}

// Challenge statistics
export interface ChallengeStats {
  playerCount: number;
  completionCount: number;
  averageTime: number;
  bestTime: number;
}

// Category information with display name and icon
export interface CategoryInfo {
  id: ChallengeCategory;
  displayName: string;
  icon: string;
}

// All 40 categories with their display names and icons
export const ALL_CATEGORIES: Record<ChallengeCategory, CategoryInfo> = {
  aircraft: { id: 'aircraft', displayName: 'Aircraft', icon: '✈️' },
  animals: { id: 'animals', displayName: 'Animals', icon: '🐾' },
  arabic: { id: 'arabic', displayName: 'Arabic', icon: '🕌' },
  birds: { id: 'birds', displayName: 'Birds', icon: '🐦' },
  bugs: { id: 'bugs', displayName: 'Bugs', icon: '🐛' },
  cars: { id: 'cars', displayName: 'Cars', icon: '🚗' },
  clothing: { id: 'clothing', displayName: 'Clothing', icon: '👕' },
  colors: { id: 'colors', displayName: 'Colors', icon: '🎨' },
  cyrillic: { id: 'cyrillic', displayName: 'Cyrillic', icon: '📖' },
  devanagari: { id: 'devanagari', displayName: 'Devanagari', icon: '📝' },
  emotions: { id: 'emotions', displayName: 'Emotions', icon: '😊' },
  fantasy: { id: 'fantasy', displayName: 'Fantasy', icon: '🐉' },
  fish: { id: 'fish', displayName: 'Fish', icon: '🐠' },
  flags: { id: 'flags', displayName: 'Flags', icon: '🏁' },
  flowers: { id: 'flowers', displayName: 'Flowers', icon: '🌺' },
  food: { id: 'food', displayName: 'Food', icon: '🍕' },
  fruits: { id: 'fruits', displayName: 'Fruits', icon: '🍎' },
  games: { id: 'games', displayName: 'Games', icon: '🎮' },
  geography: { id: 'geography', displayName: 'Geography', icon: '🌍' },
  greek: { id: 'greek', displayName: 'Greek', icon: '🏛️' },
  hebrew: { id: 'hebrew', displayName: 'Hebrew', icon: '✡️' },
  holidays: { id: 'holidays', displayName: 'Holidays', icon: '🎄' },
  latin: { id: 'latin', displayName: 'Latin', icon: '📜' },
  math: { id: 'math', displayName: 'Math', icon: '🔢' },
  music: { id: 'music', displayName: 'Music', icon: '🎵' },
  numbers: { id: 'numbers', displayName: 'Numbers', icon: '🔢' },
  office: { id: 'office', displayName: 'Office', icon: '💼' },
  planets: { id: 'planets', displayName: 'Planets', icon: '🪐' },
  plants: { id: 'plants', displayName: 'Plants', icon: '🌿' },
  roadSigns: { id: 'roadSigns', displayName: 'Road Signs', icon: '🚦' },
  science: { id: 'science', displayName: 'Science', icon: '🔬' },
  shapes: { id: 'shapes', displayName: 'Shapes', icon: '🔺' },
  sports: { id: 'sports', displayName: 'Sports', icon: '⚽' },
  tech: { id: 'tech', displayName: 'Tech', icon: '💻' },
  time: { id: 'time', displayName: 'Time', icon: '⏰' },
  tools: { id: 'tools', displayName: 'Tools', icon: '🔧' },
  trains: { id: 'trains', displayName: 'Trains', icon: '🚂' },
  transport: { id: 'transport', displayName: 'Transport', icon: '🚚' },
  vegetables: { id: 'vegetables', displayName: 'Vegetables', icon: '🥕' },
  weather: { id: 'weather', displayName: 'Weather', icon: '⛈️' }
};

// Helper function to get category info by id
export function getCategoryInfo(categoryId: ChallengeCategory): CategoryInfo {
  return ALL_CATEGORIES[categoryId];
}

// Helper function to get all categories as array
export function getAllCategories(): CategoryInfo[] {
  return Object.values(ALL_CATEGORIES);
}