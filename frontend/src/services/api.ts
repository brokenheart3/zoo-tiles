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
  console.log('📡 API:', url);
  const { data } = await axios.get<T>(url, axiosConfig);
  return data;
};

// ============================
// CORE: GET RANDOM PUZZLE FROM REPO
// ============================

async function getPuzzleFromRepo(size: number): Promise<PuzzleResponse> {
  // 1) Read index.json to know files
  const indexUrl = `${BASE_URL}/${size}/easy/index.json`;
  const index = await loadJson<any>(indexUrl);

  const files = index.files;

  // 2) Pick random file
  const randomFile =
    files[Math.floor(Math.random() * files.length)].file;

  // 3) Load that file (contains 10,000 puzzles)
  const fileUrl = `${BASE_URL}/${size}/easy/${randomFile}`;
  const puzzles = await loadJson<PuzzleResponse[]>(fileUrl);

  // 4) Pick one puzzle inside
  const puzzle =
    puzzles[Math.floor(Math.random() * puzzles.length)];

  return puzzle;
}

// ============================
// 1️⃣ SEQUENTIAL
// ============================

export async function fetchSequentialPuzzle(
  size: number
): Promise<PuzzleResponse | null> {
  try {
    return await getPuzzleFromRepo(size);
  } catch (err) {
    console.error('❌ Sequential fetch failed:', err);
    return null;
  }
}

// ============================
// 2️⃣ DAILY
// ============================

export async function fetchDailyChallenge(
  size: number
): Promise<PuzzleResponse | null> {
  try {
    // get all puzzles
    const indexUrl = `${BASE_URL}/${size}/easy/index.json`;
    const index = await loadJson<any>(indexUrl);
    const files = index.files;

    // pick a file deterministically using today's date
    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
    );
    const file = files[dayOfYear % files.length].file;

    const fileUrl = `${BASE_URL}/${size}/easy/${file}`;
    const puzzles = await loadJson<PuzzleResponse[]>(fileUrl);

    // pick a puzzle deterministically using dayOfYear
    const puzzle = puzzles[dayOfYear % puzzles.length];
    return puzzle;
  } catch (err) {
    console.error('❌ Daily fetch failed:', err);
    return null;
  }
}

// ============================
// 3️⃣ WEEKLY
// ============================

export async function fetchWeeklyChallenge(
  size: number
): Promise<PuzzleResponse | null> {
  try {
    const indexUrl = `${BASE_URL}/${size}/easy/index.json`;
    const index = await loadJson<any>(indexUrl);
    const files = index.files;

    // calculate week number
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    const file = files[weekNumber % files.length].file;

    const fileUrl = `${BASE_URL}/${size}/easy/${file}`;
    const puzzles = await loadJson<PuzzleResponse[]>(fileUrl);

    // pick first puzzle of the file for weekly
    const puzzle = puzzles[0];
    return puzzle;
  } catch (err) {
    console.error('❌ Weekly fetch failed:', err);
    return null;
  }
}


// ============================
// 4️⃣ ANIMAL FACTS
// ============================

export async function fetchAnimalFacts(): Promise<Fact[] | null> {
  try {
    const url = `${BASE_URL}/facts/animals_fact.json`;
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

    // update index
    currentIndex.animalIdx++;
    if (currentIndex.animalIdx >= animals.length) {
      currentIndex.animalIdx = 0;
      currentIndex.factIdx++;
    }

    await AsyncStorage.setItem(
      storageKey,
      JSON.stringify(currentIndex)
    );

    return `${animal.name}: ${fact}`;
  } catch (err) {
    console.error('❌ Daily fact failed:', err);
    return null;
  }
}
