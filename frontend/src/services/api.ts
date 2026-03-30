// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCategoryEmoji, getCategoryDisplayName } from '../utils/categoryHelpers';

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

// Legacy Fact interface for backward compatibility
export interface Fact {
  id: number;
  name: string;
  category: string;
  facts: string[];
}

// ============================
// BASE URL
// ============================

const BASE_URL = 'https://raw.githubusercontent.com/brokenheart3/sudoAPI/main';

// ============================
// AXIOS
// ============================

const axiosConfig = {
  timeout: 15000,
};

const loadJson = async <T>(url: string): Promise<T> => {
  console.log('📡 API Request:', url);
  try {
    const { data } = await axios.get<T>(url, axiosConfig);
    return data;
  } catch (error) {
    console.error('❌ API Request failed:', url, error);
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
  // Direct mapping - folder names match category names exactly
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
// CORE: GET RANDOM PUZZLE FROM REPO BY CATEGORY AND DIFFICULTY
// ============================

async function getPuzzleFromRepo(
  category: Category, 
  size: number, 
  difficulty: string
): Promise<PuzzleResponse> {
  const difficultyFolder = getDifficultyFolder(difficulty);
  const categoryFolder = getCategoryFolder(category);
  
  console.log('========== DEBUG ==========');
  console.log('Category:', category);
  console.log('Size:', size);
  console.log('Difficulty:', difficulty);
  
  const indexUrl = `${BASE_URL}/${categoryFolder}/${size}/${difficultyFolder}/index.json`;
  console.log('Fetching index:', indexUrl);
  
  const index = await loadJson<any>(indexUrl);
  const files = index.files;
  
  if (!files || files.length === 0) {
    throw new Error('No files found in index');
  }
  
  // Handle both string[] and object[] formats
  const fileEntries = files.map((f: any) => typeof f === 'string' ? { file: f } : f);
  
  const randomIndex = Math.floor(Math.random() * fileEntries.length);
  const randomFile = fileEntries[randomIndex].file;
  console.log('Selected file:', randomFile);
  
  const fileUrl = `${BASE_URL}/${categoryFolder}/${size}/${difficultyFolder}/${randomFile}`;
  console.log('Fetching puzzle file:', fileUrl);
  
  const puzzles = await loadJson<PuzzleResponse[]>(fileUrl);
  
  if (!puzzles || puzzles.length === 0) {
    throw new Error('No puzzles found in file');
  }
  
  const puzzleIndex = Math.floor(Math.random() * puzzles.length);
  const puzzle = puzzles[puzzleIndex];
  console.log('Selected puzzle ID:', puzzle.id);
  console.log('=========================');
  
  return { ...puzzle, category };
}

// ============================
// 1️⃣ SEQUENTIAL - RANDOM PUZZLE BY CATEGORY AND DIFFICULTY
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
// 2️⃣ DAILY CHALLENGE - DETERMINISTIC PUZZLE BASED ON DAY
// ============================

export async function fetchDailyChallenge(
  category: Category = 'animals',
  size: number,
  difficulty: string = 'easy'
): Promise<PuzzleResponse | null> {
  console.log('📅 fetchDailyChallenge - Called with:', { category, size, difficulty });
  try {
    const difficultyFolder = getDifficultyFolder(difficulty);
    const categoryFolder = getCategoryFolder(category);
    
    const indexUrl = `${BASE_URL}/${categoryFolder}/${size}/${difficultyFolder}/index.json`;
    console.log('📅 Loading daily index from:', indexUrl);
    
    const index = await loadJson<any>(indexUrl);
    const files = index.files;
    
    // Handle both string[] and object[] formats
    const fileEntries = files.map((f: any) => typeof f === 'string' ? { file: f } : f);

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    console.log('📅 Day of year:', dayOfYear);

    const fileIndex = dayOfYear % fileEntries.length;
    const file = fileEntries[fileIndex].file;
    console.log(`📅 Selected file ${fileIndex + 1}/${fileEntries.length}:`, file);

    const fileUrl = `${BASE_URL}/${categoryFolder}/${size}/${difficultyFolder}/${file}`;
    const puzzles = await loadJson<PuzzleResponse[]>(fileUrl);

    const puzzleIndex = dayOfYear % puzzles.length;
    const puzzle = puzzles[puzzleIndex];
    
    console.log(`📅 Selected puzzle ${puzzleIndex + 1}/${puzzles.length}`);
    console.log('✅ Daily puzzle loaded');
    
    return { ...puzzle, category };
  } catch (err) {
    console.error('❌ Daily fetch failed:', err);
    return null;
  }
}

// ============================
// 3️⃣ WEEKLY CHALLENGE - DETERMINISTIC PUZZLE BASED ON WEEK
// ============================

export async function fetchWeeklyChallenge(
  category: Category = 'animals',
  size: number,
  difficulty: string = 'easy'
): Promise<PuzzleResponse | null> {
  console.log('📆 fetchWeeklyChallenge - Called with:', { category, size, difficulty });
  try {
    const difficultyFolder = getDifficultyFolder(difficulty);
    const categoryFolder = getCategoryFolder(category);
    
    const indexUrl = `${BASE_URL}/${categoryFolder}/${size}/${difficultyFolder}/index.json`;
    console.log('📆 Loading weekly index from:', indexUrl);
    
    const index = await loadJson<any>(indexUrl);
    const files = index.files;
    
    // Handle both string[] and object[] formats
    const fileEntries = files.map((f: any) => typeof f === 'string' ? { file: f } : f);

    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    
    console.log('📆 Week number:', weekNumber);

    const fileIndex = weekNumber % fileEntries.length;
    const file = fileEntries[fileIndex].file;
    console.log(`📆 Selected file ${fileIndex + 1}/${fileEntries.length}:`, file);

    const fileUrl = `${BASE_URL}/${categoryFolder}/${size}/${difficultyFolder}/${file}`;
    const puzzles = await loadJson<PuzzleResponse[]>(fileUrl);

    // Use first puzzle of the file for weekly consistency
    const puzzle = puzzles[0];
    console.log('✅ Weekly puzzle loaded');
    
    return { ...puzzle, category };
  } catch (err) {
    console.error('❌ Weekly fetch failed:', err);
    return null;
  }
}

// ============================
// 4️⃣ CATEGORY FACTS
// ============================

export async function fetchCategoryFacts(category: Category): Promise<CategoryFact[] | null> {
  try {
    const categoryFolder = getCategoryFolder(category);
    
    // Correct URL pattern based on your repo structure: /{category}/facts/{category}_fact.json
    const url = `${BASE_URL}/${categoryFolder}/facts/${categoryFolder}_fact.json`;
    console.log(`📚 Fetching ${category} facts from:`, url);
    
    const data = await loadJson<CategoryFact[]>(url);
    if (data && data.length > 0) {
      console.log(`✅ Found ${data.length} fact items for ${category}`);
      return data;
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

    // Update index for next time
    currentIndex.itemIdx++;
    if (currentIndex.itemIdx >= facts.length) {
      currentIndex.itemIdx = 0;
      currentIndex.factIdx++;
    }

    await AsyncStorage.setItem(
      storageKey,
      JSON.stringify(currentIndex)
    );

    // Format the fact with emoji and category name
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
// 6️⃣ CHECK IF CATEGORY EXISTS FOR A GIVEN SIZE/DIFFICULTY
// ============================

export async function checkCategoryExists(
  category: Category, 
  size: number, 
  difficulty: string
): Promise<boolean> {
  try {
    const difficultyFolder = getDifficultyFolder(difficulty);
    const categoryFolder = getCategoryFolder(category);
    
    const indexUrl = `${BASE_URL}/${categoryFolder}/${size}/${difficultyFolder}/index.json`;
    await loadJson<any>(indexUrl);
    return true;
  } catch {
    return false;
  }
}

// ============================
// 7️⃣ GET AVAILABLE SIZES FOR CATEGORY AND DIFFICULTY
// ============================

export async function getAvailableSizes(
  category: Category, 
  difficulty: string
): Promise<number[]> {
  try {
    const difficultyFolder = getDifficultyFolder(difficulty);
    const categoryFolder = getCategoryFolder(category);
    
    // Common puzzle sizes - adjust based on your actual data
    const sizes = [5, 6, 7, 8, 9, 10, 11, 12, 16];
    const availableSizes: number[] = [];
    
    for (const size of sizes) {
      try {
        const url = `${BASE_URL}/${categoryFolder}/${size}/${difficultyFolder}/index.json`;
        await loadJson<any>(url);
        availableSizes.push(size);
      } catch {
        // Size not available, skip
      }
    }
    
    return availableSizes;
  } catch {
    return [];
  }
}

// ============================
// 8️⃣ GET AVAILABLE DIFFICULTIES FOR CATEGORY AND SIZE
// ============================

export async function getAvailableDifficulties(
  category: Category,
  size: number
): Promise<string[]> {
  const difficulties = ['easy', 'medium', 'hard', 'expert'];
  const available: string[] = [];
  
  for (const difficulty of difficulties) {
    const exists = await checkCategoryExists(category, size, difficulty);
    if (exists) {
      available.push(difficulty);
    }
  }
  
  return available;
}

// ============================
// 9️⃣ GET RANDOM CATEGORY
// ============================

export function getRandomCategory(): Category {
  const categories = getAllCategories();
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

// ============================
// 🔟 VALIDATE CATEGORY
// ============================

export function isValidCategory(category: string): category is Category {
  return getAllCategories().includes(category as Category);
}

// ============================
// BACKWARD COMPATIBILITY
// ============================

/**
 * @deprecated Use fetchDailyCategoryFact with category parameter instead
 */
export async function fetchDailyAnimalFact(): Promise<string | null> {
  return fetchDailyCategoryFact('animals');
}

/**
 * @deprecated Use fetchCategoryFacts with category parameter instead
 */
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