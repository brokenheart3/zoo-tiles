// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCategoryEmoji, getCategoryDisplayName } from '../utils/categoryHelpers';
import { getUTCDateString, getWeekNumber } from '../utils/timeUtils';

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
// GITHUB RAW URL (Production)
// ============================
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/brokenheart3/sudoAPI/main';

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
// CORE: GET RANDOM PUZZLE FROM GITHUB
// ============================
async function getPuzzleFromRepo(
  category: Category, 
  size: number, 
  difficulty: string
): Promise<PuzzleResponse> {
  const difficultyFolder = getDifficultyFolder(difficulty);
  const fileNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const randomFileNum = fileNumbers[Math.floor(Math.random() * fileNumbers.length)];
  
  console.log('========== DEBUG ==========');
  console.log('Category:', category);
  console.log('Size:', size);
  console.log('Difficulty:', difficulty);
  
  try {
    const url = `${GITHUB_RAW_URL}/${category}/${size}/${difficultyFolder}/${difficultyFolder}_${size}_${randomFileNum}.json`;
    console.log('Fetching from GitHub:', url);
    
    const puzzles = await loadJson<any[]>(url);
    
    if (puzzles && puzzles.length > 0) {
      const randomIndex = Math.floor(Math.random() * puzzles.length);
      console.log('Selected puzzle ID:', puzzles[randomIndex]?.id);
      console.log('=========================');
      return { ...puzzles[randomIndex], category };
    }
    
    throw new Error('No puzzle returned from GitHub');
  } catch (error) {
    console.error('Failed to fetch puzzle from GitHub:', error);
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
  const fileNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const fileNum: number = fileNumbers[dayOfYear % fileNumbers.length];
  
  console.log('📅 fetchDailyChallenge - UTC Date:', utcDate, 'Day of Year:', dayOfYear, 'File Num:', fileNum, { category, size });
  
  try {
    const url = `${GITHUB_RAW_URL}/${category}/${size}/easy/easy_${size}_${fileNum}.json`;
    console.log('Fetching daily challenge from GitHub:', url);
    
    const puzzles = await loadJson<any[]>(url);
    
    if (puzzles && puzzles.length > 0) {
      const puzzleIndex: number = dayOfYear % puzzles.length;
      console.log('✅ Daily puzzle loaded, ID:', puzzles[puzzleIndex]?.id, 'for UTC date:', utcDate);
      return { ...puzzles[puzzleIndex], category };
    }
    
    throw new Error('No daily puzzle returned');
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
  const fileNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const fileNum: number = fileNumbers[utcWeekNumber % fileNumbers.length];
  
  console.log('📆 fetchWeeklyChallenge - UTC Week:', utcWeekNumber, 'File Num:', fileNum, { category, size });
  
  try {
    const url = `${GITHUB_RAW_URL}/${category}/${size}/easy/easy_${size}_${fileNum}.json`;
    console.log('Fetching weekly challenge from GitHub:', url);
    
    const puzzles = await loadJson<any[]>(url);
    
    if (puzzles && puzzles.length > 0) {
      const puzzleIndex: number = utcWeekNumber % puzzles.length;
      console.log('✅ Weekly puzzle loaded, ID:', puzzles[puzzleIndex]?.id, 'for UTC week:', utcWeekNumber);
      return { ...puzzles[puzzleIndex], category };
    }
    
    throw new Error('No weekly puzzle returned');
  } catch (err) {
    console.error('❌ Weekly fetch failed for UTC week:', utcWeekNumber, err);
    return null;
  }
}

// ============================
// 4️⃣ CATEGORY FACTS - FROM GITHUB
// ============================
let factsCache: Record<string, CategoryFact[]> = {};

export async function fetchCategoryFacts(category: Category): Promise<CategoryFact[] | null> {
  try {
    if (factsCache[category]) {
      console.log(`📚 Returning cached facts for ${category}`);
      return factsCache[category];
    }
    
    const url = `${GITHUB_RAW_URL}/${category}/facts/${category}_fact.json`;
    console.log(`📚 Fetching ${category} facts from GitHub:`, url);
    
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
  return [5, 6, 7, 8, 9, 10, 11, 12, 16];
}

// ============================
// 7️⃣ GET AVAILABLE DIFFICULTIES
// ============================
export async function getAvailableDifficulties(): Promise<string[]> {
  return ['easy', 'medium', 'hard', 'expert'];
}

// ============================
// 8️⃣ GET ALL CATEGORIES
// ============================
export async function getAvailableCategories(): Promise<Category[]> {
  return getAllCategories();
}

// ============================
// 9️⃣ CHECK BACKEND HEALTH (GitHub)
// ============================
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const url = `${GITHUB_RAW_URL}/animals/5/easy/easy_5_1.json`;
    const response = await loadJson<any>(url);
    return response !== null;
  } catch (err) {
    console.error('GitHub health check failed:', err);
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