// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================
// TYPES
// ============================

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

export interface Fact {
  id: number;
  name: string;
  category: string;
  facts: string[];
}

// ============================
// BASE URL
// ============================

const BASE_URL =
  'https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals';

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
  console.log('🔧 getDifficultyFolder - Input:', difficulty);
  
  // Convert to lowercase and trim
  const difficultyLower = difficulty?.toLowerCase().trim() || 'easy';
  console.log('🔧 getDifficultyFolder - Lowercase:', difficultyLower);
  
  let folder = 'easy'; // default
  
  switch (difficultyLower) {
    case 'easy':
      folder = 'easy';
      break;
    case 'medium':
      folder = 'medium';
      break;
    case 'hard':
      folder = 'hard';
      break;
    case 'expert':
      folder = 'expert';
      break;
    default:
      console.log('🔧 getDifficultyFolder - Unknown difficulty, using easy');
      folder = 'easy';
  }
  
  console.log('🔧 getDifficultyFolder - Selected folder:', folder);
  return folder;
};

// ============================
// CORE: GET RANDOM PUZZLE FROM REPO BY DIFFICULTY
// ============================

async function getPuzzleFromRepo(size: number, difficulty: string): Promise<PuzzleResponse> {
  const difficultyFolder = getDifficultyFolder(difficulty);
  
  console.log('========== DEBUG ==========');
  console.log('1. Trying to fetch:', `${BASE_URL}/${size}/${difficultyFolder}/index.json`);
  
  try {
    const indexUrl = `${BASE_URL}/${size}/${difficultyFolder}/index.json`;
    const index = await loadJson<any>(indexUrl);
    console.log('2. Index loaded successfully:', index);
    
    const files = index.files;
    console.log('3. Files array:', files);
    
    if (files && files.length > 0) {
      const randomIndex = Math.floor(Math.random() * files.length);
      const randomFile = files[randomIndex].file;
      console.log('4. Selected file:', randomFile);
      
      const fileUrl = `${BASE_URL}/${size}/${difficultyFolder}/${randomFile}`;
      console.log('5. Fetching puzzle file:', fileUrl);
      
      const puzzles = await loadJson<PuzzleResponse[]>(fileUrl);
      console.log('6. Loaded puzzles count:', puzzles?.length);
      
      if (puzzles && puzzles.length > 0) {
        const puzzleIndex = Math.floor(Math.random() * puzzles.length);
        const puzzle = puzzles[puzzleIndex];
        console.log('7. Selected puzzle:', puzzle);
        console.log('=========================');
        return puzzle;
      }
    }
    throw new Error('No files or puzzles found');
  } catch (error) {
    console.log('❌ ERROR:', error);
    console.log('=========================');
    throw error;
  }
}

// ============================
// 1️⃣ SEQUENTIAL - ACCEPTS DIFFICULTY
// ============================

export async function fetchSequentialPuzzle(
  size: number,
  difficulty: string = 'easy'
): Promise<PuzzleResponse | null> {
  console.log('🎮 fetchSequentialPuzzle - Called with:', { size, difficulty });
  try {
    const puzzle = await getPuzzleFromRepo(size, difficulty);
    console.log('🎮 fetchSequentialPuzzle - Success');
    return puzzle;
  } catch (err) {
    console.error('❌ Sequential fetch failed:', err);
    return null;
  }
}

// ============================
// 2️⃣ DAILY - ACCEPTS DIFFICULTY
// ============================

export async function fetchDailyChallenge(
  size: number,
  difficulty: string = 'easy'
): Promise<PuzzleResponse | null> {
  console.log('📅 fetchDailyChallenge - Called with:', { size, difficulty });
  try {
    const difficultyFolder = getDifficultyFolder(difficulty);
    
    // Get all puzzles for this difficulty
    const indexUrl = `${BASE_URL}/${size}/${difficultyFolder}/index.json`;
    console.log('📅 Loading daily index from:', indexUrl);
    
    const index = await loadJson<any>(indexUrl);
    const files = index.files;

    // Calculate day of year for deterministic selection
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    console.log('📅 Day of year:', dayOfYear);

    // Pick file deterministically
    const fileIndex = dayOfYear % files.length;
    const file = files[fileIndex].file;
    console.log(`📅 Selected file ${fileIndex + 1}/${files.length}:`, file);

    // Load puzzles from file
    const fileUrl = `${BASE_URL}/${size}/${difficultyFolder}/${file}`;
    const puzzles = await loadJson<PuzzleResponse[]>(fileUrl);

    // Pick puzzle deterministically
    const puzzleIndex = dayOfYear % puzzles.length;
    const puzzle = puzzles[puzzleIndex];
    
    console.log(`📅 Selected puzzle ${puzzleIndex + 1}/${puzzles.length}`);
    console.log('✅ Daily puzzle loaded');
    
    return puzzle;
  } catch (err) {
    console.error('❌ Daily fetch failed:', err);
    
    // Fallback to sequential if daily fails
    console.log('📅 Falling back to sequential puzzle');
    return fetchSequentialPuzzle(size, difficulty);
  }
}

// ============================
// 3️⃣ WEEKLY - ACCEPTS DIFFICULTY
// ============================

export async function fetchWeeklyChallenge(
  size: number,
  difficulty: string = 'easy'
): Promise<PuzzleResponse | null> {
  console.log('📆 fetchWeeklyChallenge - Called with:', { size, difficulty });
  try {
    const difficultyFolder = getDifficultyFolder(difficulty);
    
    const indexUrl = `${BASE_URL}/${size}/${difficultyFolder}/index.json`;
    console.log('📆 Loading weekly index from:', indexUrl);
    
    const index = await loadJson<any>(indexUrl);
    const files = index.files;

    // Calculate week number
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    
    console.log('📆 Week number:', weekNumber);

    // Pick file deterministically
    const fileIndex = weekNumber % files.length;
    const file = files[fileIndex].file;
    console.log(`📆 Selected file ${fileIndex + 1}/${files.length}:`, file);

    // Load puzzles from file
    const fileUrl = `${BASE_URL}/${size}/${difficultyFolder}/${file}`;
    const puzzles = await loadJson<PuzzleResponse[]>(fileUrl);

    // Pick first puzzle for weekly
    const puzzle = puzzles[0];
    console.log('✅ Weekly puzzle loaded');
    
    return puzzle;
  } catch (err) {
    console.error('❌ Weekly fetch failed:', err);
    
    // Fallback to sequential if weekly fails
    console.log('📆 Falling back to sequential puzzle');
    return fetchSequentialPuzzle(size, difficulty);
  }
}

// ============================
// 4️⃣ ANIMAL FACTS
// ============================

export async function fetchAnimalFacts(): Promise<Fact[] | null> {
  try {
    const url = `${BASE_URL}/facts/animals_fact.json`;
    console.log('📚 Fetching animal facts from:', url);
    return await loadJson<Fact[]>(url);
  } catch (err) {
    console.error('❌ Facts fetch failed:', err);
    return null;
  }
}

// ============================
// 5️⃣ DAILY FACT ROTATION
// ============================

export async function fetchDailyAnimalFact(): Promise<string | null> {
  try {
    const storageKey = '@daily_animal_fact_index';
    const stored = await AsyncStorage.getItem(storageKey);

    let currentIndex = stored
      ? JSON.parse(stored)
      : { animalIdx: 0, factIdx: 0 };

    const animals = await fetchAnimalFacts();
    if (!animals) return null;

    const animal = animals[currentIndex.animalIdx % animals.length];
    const fact =
      animal.facts[currentIndex.factIdx % animal.facts.length];

    // Update index for next time
    currentIndex.animalIdx++;
    if (currentIndex.animalIdx >= animals.length) {
      currentIndex.animalIdx = 0;
      currentIndex.factIdx++;
    }

    await AsyncStorage.setItem(
      storageKey,
      JSON.stringify(currentIndex)
    );

    const factString = `${animal.name}: ${fact}`;
    console.log('📚 Daily fact:', factString);
    
    return factString;
  } catch (err) {
    console.error('❌ Daily fact failed:', err);
    return null;
  }
}