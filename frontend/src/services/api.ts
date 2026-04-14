// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCategoryEmoji, getCategoryDisplayName } from '../utils/categoryHelpers';
import { getUTCDateString, getWeekNumber } from '../utils/timeUtils';
import Constants from 'expo-constants';

// ============================
// TYPES
// ============================

export type Category = 
  | 'aircraft' | 'animals' | 'arabic' | 'birds' | 'bugs' | 'cars' | 'clothing' 
  | 'colors' | 'cyrillic' | 'devanagari' | 'emotions' | 'fantasy' | 'fish' 
  | 'flags' | 'flowers' | 'food' | 'fruits' | 'games' | 'geography' | 'greek' 
  | 'hebrew' | 'holidays' | 'latin' | 'math' | 'music' | 'numbers' | 'office' 
  | 'planets' | 'plants' | 'roadSigns' | 'science' | 'shapes' | 'sports' | 'tech' 
  | 'time' | 'tools' | 'trains' | 'transport' | 'vegetables' | 'weather';

export interface Puzzle {
  id: number;
  size: number;
  difficulty: string;
  contents: string[];
  puzzle: string[][];
  solution: string[][];
}

export interface PuzzleResponse extends Puzzle {
  category?: string;
}

export interface CategoryFact {
  name: string;
  facts: string[];
}

export interface Fact {
  id: number;
  name: string;
  category: string;
  facts: string[];
}

// ============================
// BASE URL - Environment based
// ============================

// Get API URL from environment or app config
const getBaseUrl = (): string => {
  // Check if we have a custom URL from app config
  const configUrl = Constants.expoConfig?.extra?.API_URL;
  if (configUrl) return configUrl;
  
  // Check environment variable
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  
  // Development fallback
  return __DEV__ ? 'http://localhost:3000' : 'https://sudoku-tiles-api.onrender.com';
};

const BASE_URL = getBaseUrl();

console.log(`🌐 API Base URL: ${BASE_URL} (${__DEV__ ? 'Development' : 'Production'})`);

// ============================
// AXIOS CONFIG
// ============================

const axiosConfig = {
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
};

const loadJson = async <T>(url: string): Promise<T> => {
  console.log('📡 API Request:', url);
  try {
    const { data } = await axios.get<T>(url, axiosConfig);
    return data;
  } catch (error: any) {
    console.error('❌ API Request failed:', url, error?.response?.status || error.message);
    throw error;
  }
};

// ============================
// HELPER: Map difficulty to folder name
// ============================
const getDifficultyFolder = (difficulty: string): string => {
  const difficultyLower = difficulty?.toLowerCase().trim() || 'easy';
  
  switch (difficultyLower) {
    case 'easy': return 'easy';
    case 'medium': return 'medium';
    case 'hard': return 'hard';
    case 'expert': return 'expert';
    default: return 'easy';
  }
};

// ============================
// HELPER: Get category folder name
// ============================
const getCategoryFolder = (category: Category): string => {
  const categoryMap: Record<Category, string> = {
    aircraft: 'aircraft',
    animals: 'animals',
    arabic: 'arabic',
    birds: 'birds',
    bugs: 'bugs',
    cars: 'cars',
    clothing: 'clothing',
    colors: 'colors',
    cyrillic: 'cyrillic',
    devanagari: 'devanagari',
    emotions: 'emotions',
    fantasy: 'fantasy',
    fish: 'fish',
    flags: 'flags',
    flowers: 'flowers',
    food: 'food',
    fruits: 'fruits',
    games: 'games',
    geography: 'geography',
    greek: 'greek',
    hebrew: 'hebrew',
    holidays: 'holidays',
    latin: 'latin',
    math: 'math',
    music: 'music',
    numbers: 'numbers',
    office: 'office',
    planets: 'planets',
    plants: 'plants',
    roadSigns: 'roadSigns',
    science: 'science',
    shapes: 'shapes',
    sports: 'sports',
    tech: 'tech',
    time: 'time',
    tools: 'tools',
    trains: 'trains',
    transport: 'transport',
    vegetables: 'vegetables',
    weather: 'weather',
  };
  
  return categoryMap[category] || 'animals';
};

// ============================
// HELPER: Get UTC day of year (1-366)
// ============================
const getUTCDayOfYear = (date: Date = new Date()): number => {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  const oneDay = 86400000;
  return Math.floor(diff / oneDay);
};

// ============================
// HELPER: Get week number as number
// ============================
const getWeekNumberAsNumber = (date: Date = new Date()): number => {
  const firstDayOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7);
  return weekNum;
};

// ============================
// HELPER: Get all available categories
// ============================
export const getAllCategories = (): Category[] => {
  return [
    'aircraft', 'animals', 'arabic', 'birds', 'bugs', 'cars', 'clothing',
    'colors', 'cyrillic', 'devanagari', 'emotions', 'fantasy', 'fish',
    'flags', 'flowers', 'food', 'fruits', 'games', 'geography', 'greek',
    'hebrew', 'holidays', 'latin', 'math', 'music', 'numbers', 'office',
    'planets', 'plants', 'roadSigns', 'science', 'shapes', 'sports', 'tech',
    'time', 'tools', 'trains', 'transport', 'vegetables', 'weather'
  ];
};

// ============================
// HELPER: Get category display info
// ============================
export const getCategoryInfo = (category: Category) => {
  return {
    id: category,
    name: getCategoryDisplayName(category),
    emoji: getCategoryEmoji(category),
    folder: getCategoryFolder(category),
  };
};

// ============================
// CORE: GET RANDOM PUZZLE FROM BACKEND
// ============================
async function getPuzzleFromRepo(
  category: Category, 
  size: number, 
  difficulty: string
): Promise<PuzzleResponse> {
  const difficultyFolder = getDifficultyFolder(difficulty);
  
  console.log('========== DEBUG ==========');
  console.log('Category:', category);
  console.log('Size:', size);
  console.log('Difficulty:', difficulty);
  
  try {
    const url = `${BASE_URL}/puzzle/${category}/${size}/${difficultyFolder}`;
    console.log('Fetching from backend:', url);
    
    const puzzle = await loadJson<PuzzleResponse>(url);
    
    if (!puzzle) {
      throw new Error('No puzzle returned from backend');
    }
    
    console.log('Selected puzzle ID:', puzzle.id);
    console.log('=========================');
    
    return { ...puzzle, category };
  } catch (error) {
    console.error('Failed to fetch puzzle from backend:', error);
    throw new Error(`No puzzle found for ${category}/${size}/${difficulty}`);
  }
}

// ============================
// 1️⃣ SEQUENTIAL - RANDOM PUZZLE
// ============================
export async function fetchSequentialPuzzle(
  category: Category = 'animals',
  size: number,
  difficulty: string = 'easy'
): Promise<PuzzleResponse | null> {
  console.log('🎮 fetchSequentialPuzzle - Called with:', { category, size, difficulty });
  try {
    const puzzle = await getPuzzleFromRepo(category, size, difficulty);
    console.log('🎮 fetchSequentialPuzzle - Success');
    return puzzle;
  } catch (err) {
    console.error('❌ Sequential fetch failed:', err);
    return null;
  }
}

// ============================
// 2️⃣ DAILY CHALLENGE - WITH UTC DATE
// ============================
export async function fetchDailyChallenge(
  category: Category = 'animals',
  size: number
): Promise<PuzzleResponse | null> {
  const utcDate: string = getUTCDateString();
  const dayOfYear: number = getUTCDayOfYear();
  
  console.log('📅 fetchDailyChallenge - UTC Date:', utcDate, 'Day of Year:', dayOfYear, { category, size });
  
  try {
    const url = `${BASE_URL}/daily/${category}/${size}?date=${utcDate}`;
    console.log('Fetching daily challenge from:', url);
    
    const puzzle = await loadJson<PuzzleResponse>(url);
    
    if (!puzzle) {
      throw new Error('No daily puzzle returned');
    }
    
    console.log('✅ Daily puzzle loaded, ID:', puzzle.id, 'for UTC date:', utcDate);
    return { ...puzzle, category };
  } catch (err) {
    console.error('❌ Daily fetch failed for UTC date:', utcDate, err);
    return null;
  }
}

// ============================
// 3️⃣ WEEKLY CHALLENGE - WITH UTC WEEK
// ============================
export async function fetchWeeklyChallenge(
  category: Category = 'animals',
  size: number
): Promise<PuzzleResponse | null> {
  const utcWeekNumber: number = getWeekNumberAsNumber();
  
  console.log('📆 fetchWeeklyChallenge - UTC Week:', utcWeekNumber, { category, size });
  
  try {
    const url = `${BASE_URL}/weekly/${category}/${size}?week=${utcWeekNumber}`;
    console.log('Fetching weekly challenge from:', url);
    
    const puzzle = await loadJson<PuzzleResponse>(url);
    
    if (!puzzle) {
      throw new Error('No weekly puzzle returned');
    }
    
    console.log('✅ Weekly puzzle loaded, ID:', puzzle.id, 'for UTC week:', utcWeekNumber);
    return { ...puzzle, category };
  } catch (err) {
    console.error('❌ Weekly fetch failed for UTC week:', utcWeekNumber, err);
    return null;
  }
}

// ============================
// 4️⃣ CATEGORY FACTS
// ============================
let factsCache: Record<string, CategoryFact[]> = {};

export async function fetchCategoryFacts(category: Category): Promise<CategoryFact[] | null> {
  try {
    if (factsCache[category]) {
      console.log(`📚 Returning cached facts for ${category}`);
      return factsCache[category];
    }
    
    const url = `${BASE_URL}/facts/${category}`;
    console.log(`📚 Fetching ${category} facts from:`, url);
    
    const facts = await loadJson<CategoryFact[]>(url);
    
    if (facts && facts.length > 0) {
      factsCache[category] = facts;
      console.log(`✅ Found ${facts.length} fact items for ${category}`);
      return facts;
    }
    
    console.log(`⚠️ No facts found for ${category}`);
    return null;
  } catch (err) {
    console.error(`❌ ${category} facts fetch failed:`, err);
    return null;
  }
}

// ============================
// 5️⃣ DAILY CATEGORY FACT ROTATION
// ============================
export async function fetchDailyCategoryFact(category: Category = 'animals'): Promise<string | null> {
  try {
    const storageKey = `@daily_${category}_fact_index`;
    const stored = await AsyncStorage.getItem(storageKey);

    let currentIndex = stored
      ? JSON.parse(stored)
      : { itemIdx: 0, factIdx: 0 };

    const facts = await fetchCategoryFacts(category);
    
    if (!facts || facts.length === 0) {
      console.log(`⚠️ No facts available for ${category}, using fallback`);
      const emoji = getCategoryEmoji(category);
      return `${emoji} Discover amazing ${getCategoryDisplayName(category).toLowerCase()} facts every day!`;
    }

    const factItem = facts[currentIndex.itemIdx % facts.length];
    const fact = factItem.facts[currentIndex.factIdx % factItem.facts.length];

    currentIndex.itemIdx++;
    if (currentIndex.itemIdx >= facts.length) {
      currentIndex.itemIdx = 0;
      currentIndex.factIdx++;
    }

    await AsyncStorage.setItem(storageKey, JSON.stringify(currentIndex));

    const emoji = getCategoryEmoji(category);
    const factString = `${emoji} ${factItem.name}: ${fact}`;
    console.log(`📚 Daily ${category} fact:`, factString.substring(0, 100) + '...');
    
    return factString;
  } catch (err) {
    console.error(`❌ Daily ${category} fact failed:`, err);
    const emoji = getCategoryEmoji(category);
    return `${emoji} Discover amazing ${getCategoryDisplayName(category).toLowerCase()} facts every day!`;
  }
}

// ============================
// 6️⃣ GET AVAILABLE SIZES
// ============================
export async function getAvailableSizes(): Promise<number[]> {
  try {
    const url = `${BASE_URL}/sizes`;
    const response = await loadJson<{ sizes: number[] }>(url);
    return response.sizes || [5, 6, 7, 8, 9, 10, 11, 12, 16];
  } catch (err) {
    console.error('Failed to fetch sizes:', err);
    return [5, 6, 7, 8, 9, 10, 11, 12, 16];
  }
}

// ============================
// 7️⃣ GET AVAILABLE DIFFICULTIES
// ============================
export async function getAvailableDifficulties(): Promise<string[]> {
  try {
    const url = `${BASE_URL}/difficulties`;
    const response = await loadJson<{ difficulties: string[] }>(url);
    return response.difficulties || ['easy', 'medium', 'hard', 'expert'];
  } catch (err) {
    console.error('Failed to fetch difficulties:', err);
    return ['easy', 'medium', 'hard', 'expert'];
  }
}

// ============================
// 8️⃣ GET ALL CATEGORIES
// ============================
export async function getAvailableCategories(): Promise<Category[]> {
  try {
    const url = `${BASE_URL}/categories`;
    const response = await loadJson<{ categories: Category[] }>(url);
    return response.categories || getAllCategories();
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return getAllCategories();
  }
}

// ============================
// 9️⃣ CHECK BACKEND HEALTH
// ============================
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const url = `${BASE_URL}/health`;
    const response = await loadJson<{ status: string }>(url);
    return response.status === 'ok';
  } catch (err) {
    console.error('Backend health check failed:', err);
    return false;
  }
}

// ============================
// UTILITIES
// ============================
export function getRandomCategory(): Category {
  const categories = getAllCategories();
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

export function isValidCategory(category: string): category is Category {
  return getAllCategories().includes(category as Category);
}

// ============================
// BACKWARD COMPATIBILITY
// ============================
export async function fetchDailyAnimalFact(): Promise<string | null> {
  return fetchDailyCategoryFact('animals');
}

export async function fetchAnimalFacts(): Promise<Fact[] | null> {
  const facts = await fetchCategoryFacts('animals');
  if (!facts) return null;
  
  return facts.map((fact, index) => ({
    id: index,
    name: fact.name,
    category: 'animals',
    facts: fact.facts
  }));
}