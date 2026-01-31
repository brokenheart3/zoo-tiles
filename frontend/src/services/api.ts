// src/services/api.ts
import axios from 'axios';
import { Platform } from 'react-native';

// ============================================
// CONFIGURATION
// ============================================

const LOCAL_IP = '192.168.137.1'; // <-- CHANGE THIS
const API_PORT = 3000;

export const getBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return `http://localhost:${API_PORT}`;
  } else {
    return `http://${LOCAL_IP}:${API_PORT}`;
  }
};

const BASE_URL = getBaseUrl();

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Animal {
  id: number;
  name: string;
  emoji?: string;
  category: string;
  facts: string[];
}

export interface Puzzle {
  id: number;
  size: number;
  difficulty: string;
  contents: string[];
  puzzle: string[][];
  solution: string[][];
}

export interface PuzzleResponse {
  category: string;
  size: number;
  puzzle: Puzzle;
  dailyIndex?: number;
  weeklyIndex?: number;
  sourceFile?: string;
  fileIndex?: number;
  puzzleIndex?: number;
  totalFiles?: number;
  puzzlesInFile?: number;
  [key: string]: any;
}

export interface FactsResponse {
  success: boolean;
  fact: string;
  animal?: Animal;
  animalName?: string;
  animalEmoji?: string;
  category?: string;
  index?: number;
  totalFacts?: number;
  total?: number;
  returned?: number;
  source?: string;
  error?: string;
  animals?: Animal[];
  [key: string]: any;
}

export interface SequentialFactResponse {
  animalId: number;
  factIndex: number;
  fact: string;
  animalName: string;
  totalAnimals: number;
  totalFacts: number;
}

export interface FactState {
  animalId: number;
  factIndex: number;
  lastUpdated: string;
}

// ============================================
// AXIOS CONFIG
// ============================================

const axiosConfig = {
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
};

const logApiCall = (endpoint: string) => {
  console.log(`📡 API Call: ${BASE_URL}${endpoint}`);
};

// ============================================
// PUZZLES ENDPOINTS
// ============================================

export async function getDailyPuzzle(size: number = 16): Promise<PuzzleResponse> {
  logApiCall(`/animals/${size}/daily`);
  const { data } = await axios.get<PuzzleResponse>(`${BASE_URL}/animals/${size}/daily`, axiosConfig);
  return data;
}

export async function getWeeklyPuzzle(size: number = 16): Promise<PuzzleResponse> {
  logApiCall(`/animals/${size}/weekly`);
  const { data } = await axios.get<PuzzleResponse>(`${BASE_URL}/animals/${size}/weekly`, axiosConfig);
  return data;
}

export async function getSequentialPuzzle(
  size: number = 16,
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
): Promise<PuzzleResponse> {
  logApiCall(`/animals/${size}/${difficulty}/sequential`);
  const { data } = await axios.get<PuzzleResponse>(
    `${BASE_URL}/animals/${size}/${difficulty}/sequential`,
    axiosConfig
  );
  return data;
}

// ============================================
// ANIMAL FACTS ENDPOINTS
// ============================================

export async function getAllAnimalFacts(options?: {
  category?: string;
  search?: string;
  limit?: number;
  random?: boolean;
}): Promise<FactsResponse> {
  const params = new URLSearchParams();
  if (options?.category) params.append('category', options.category);
  if (options?.search) params.append('search', options.search);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.random) params.append('random', 'true');

  const endpoint = `/animals/facts${params.toString() ? `?${params.toString()}` : ''}`;
  logApiCall(endpoint);

  const { data } = await axios.get<FactsResponse>(`${BASE_URL}${endpoint}`, axiosConfig);
  return data;
}

export async function getRandomAnimal(): Promise<FactsResponse> {
  logApiCall('/animals/facts/random');
  const { data } = await axios.get<FactsResponse>(`${BASE_URL}/animals/facts/random`, axiosConfig);
  return data;
}

export async function getRandomFact(): Promise<FactsResponse> {
  logApiCall('/animals/facts/random/fact');
  const { data } = await axios.get<FactsResponse>(`${BASE_URL}/animals/facts/random/fact`, axiosConfig);
  return data;
}

export async function getFactsByName(name: string): Promise<FactsResponse> {
  const endpoint = `/animals/facts/name/${encodeURIComponent(name)}`;
  logApiCall(endpoint);
  const { data } = await axios.get<FactsResponse>(`${BASE_URL}${endpoint}`, axiosConfig);
  return data;
}

export async function getFactsByEmoji(emoji: string): Promise<FactsResponse> {
  const endpoint = `/animals/facts/emoji/${encodeURIComponent(emoji)}`;
  logApiCall(endpoint);
  const { data } = await axios.get<FactsResponse>(`${BASE_URL}${endpoint}`, axiosConfig);
  return data;
}

// ============================================
// HEALTH CHECK
// ============================================

export async function checkHealth(): Promise<boolean> {
  try {
    logApiCall('/health');
    const { data } = await axios.get<{ status: string }>(`${BASE_URL}/health`);
    return data.status === 'healthy';
  } catch {
    return false;
  }
}
