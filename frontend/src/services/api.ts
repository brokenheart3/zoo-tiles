// src/services/api.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Type definitions
export interface AnimalFact {
  id: number;
  name: string;
  category: string;
  facts: string[];
  emoji?: string;
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
  [key: string]: any; // Allow additional properties
}

export interface FactsResponse {
  success: boolean;
  animals?: AnimalFact[];
  animal?: AnimalFact;
  facts?: any[];
  fact?: string;
  total?: number;
  returned?: number;
  source?: string;
  [key: string]: any; // Allow additional properties
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
// PUZZLE ENDPOINTS (Updated to match backend)
// ============================================

// Daily puzzle
export async function getDailyPuzzle(size: number = 16): Promise<PuzzleResponse> {
  try {
    const resp = await axios.get<PuzzleResponse>(`${BASE_URL}/animals/${size}/daily`);
    return resp.data;
  } catch (error) {
    console.error('Error fetching daily puzzle:', error);
    throw error;
  }
}

// Weekly puzzle
export async function getWeeklyPuzzle(size: number = 16): Promise<PuzzleResponse> {
  try {
    const resp = await axios.get<PuzzleResponse>(`${BASE_URL}/animals/${size}/weekly`);
    return resp.data;
  } catch (error) {
    console.error('Error fetching weekly puzzle:', error);
    throw error;
  }
}

// Sequential puzzle by difficulty
export async function getSequentialPuzzle(
  size: number = 16, 
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
): Promise<PuzzleResponse> {
  try {
    const resp = await axios.get<PuzzleResponse>(`${BASE_URL}/animals/${size}/${difficulty}/sequential`);
    return resp.data;
  } catch (error) {
    console.error(`Error fetching ${difficulty} puzzle:`, error);
    throw error;
  }
}

// Daily puzzle with animal facts
export async function getDailyPuzzleWithFacts(size: number = 16): Promise<any> {
  try {
    const resp = await axios.get(`${BASE_URL}/animals/${size}/daily/with-facts`);
    return resp.data as any;
  } catch (error) {
    console.error('Error fetching daily puzzle with facts:', error);
    throw error;
  }
}

// ============================================
// ANIMAL FACTS ENDPOINTS (Updated)
// ============================================

// Get all animal facts with optional filtering
export async function getAllAnimalFacts(options?: {
  category?: string;
  search?: string;
  limit?: number;
  random?: boolean;
}): Promise<FactsResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.search) params.append('search', options.search);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.random) params.append('random', 'true');
    
    const url = `${BASE_URL}/animals/facts${params.toString() ? `?${params.toString()}` : ''}`;
    const resp = await axios.get<FactsResponse>(url);
    return resp.data;
  } catch (error) {
    console.error('Error fetching all animal facts:', error);
    throw error;
  }
}

// Get random animal with facts
export async function getRandomAnimal(): Promise<FactsResponse> {
  try {
    const resp = await axios.get<FactsResponse>(`${BASE_URL}/animals/facts/random`);
    return resp.data;
  } catch (error) {
    console.error('Error fetching random animal:', error);
    throw error;
  }
}

// Get random fact from any animal
export async function getRandomFact(): Promise<FactsResponse> {
  try {
    const resp = await axios.get<FactsResponse>(`${BASE_URL}/animals/facts/random/fact`);
    return resp.data;
  } catch (error) {
    console.error('Error fetching random fact:', error);
    throw error;
  }
}

// Get facts by animal name
export async function getFactsByName(name: string): Promise<FactsResponse> {
  try {
    const resp = await axios.get<FactsResponse>(`${BASE_URL}/animals/facts/name/${encodeURIComponent(name)}`);
    return resp.data;
  } catch (error) {
    console.error(`Error fetching facts for ${name}:`, error);
    throw error;
  }
}

// Get facts by animal emoji
export async function getFactsByEmoji(emoji: string): Promise<FactsResponse> {
  try {
    const resp = await axios.get<FactsResponse>(`${BASE_URL}/animals/facts/emoji/${encodeURIComponent(emoji)}`);
    return resp.data;
  } catch (error) {
    console.error(`Error fetching facts for emoji ${emoji}:`, error);
    throw error;
  }
}

// Get a single fact by animal ID (if you want to implement this)
export async function getFactByAnimalId(animalId: number, factIndex: number = 0): Promise<string | null> {
  try {
    const allFacts = await getAllAnimalFacts();
    if (allFacts.animals) {
      const animal = allFacts.animals.find(a => a.id === animalId);
      if (animal && animal.facts && animal.facts.length > factIndex) {
        return animal.facts[factIndex];
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching fact for animal ${animalId}:`, error);
    return null;
  }
}

// ============================================
// SEQUENTIAL FACTS SYSTEM (Client-side)
// ============================================

// Get next sequential fact
export async function getSequentialFact(): Promise<SequentialFactResponse> {
  try {
    // Get all animals first
    const allFacts = await getAllAnimalFacts();
    
    if (!allFacts.animals || allFacts.animals.length === 0) {
      throw new Error('No animals found');
    }
    
    // Get or create state
    const state = await getOrCreateSequentialState();
    
    // Find current animal
    const currentAnimal = allFacts.animals.find(a => a.id === state.animalId);
    
    // If no current animal or out of bounds, reset
    if (!currentAnimal || state.factIndex >= (currentAnimal.facts?.length || 0)) {
      state.animalId = allFacts.animals[0].id;
      state.factIndex = 0;
      const newAnimal = allFacts.animals[0];
      state.lastUpdated = new Date().toISOString().split('T')[0];
      
      return {
        animalId: state.animalId,
        factIndex: state.factIndex,
        fact: newAnimal.facts?.[0] || 'No fact available',
        animalName: newAnimal.name,
        totalAnimals: allFacts.animals.length,
        totalFacts: allFacts.animals.reduce((sum, a) => sum + (a.facts?.length || 0), 0)
      };
    }
    
    // Get current fact
    const fact = currentAnimal.facts?.[state.factIndex] || 'No fact available';
    
    // Prepare response
    const response: SequentialFactResponse = {
      animalId: state.animalId,
      factIndex: state.factIndex,
      fact,
      animalName: currentAnimal.name,
      totalAnimals: allFacts.animals.length,
      totalFacts: allFacts.animals.reduce((sum, a) => sum + (a.facts?.length || 0), 0)
    };
    
    // Update state for next call
    state.factIndex += 1;
    
    // If we've exhausted this animal's facts, move to next animal
    if (state.factIndex >= (currentAnimal.facts?.length || 0)) {
      const currentIndex = allFacts.animals.findIndex(a => a.id === state.animalId);
      const nextIndex = (currentIndex + 1) % allFacts.animals.length;
      state.animalId = allFacts.animals[nextIndex].id;
      state.factIndex = 0;
    }
    
    state.lastUpdated = new Date().toISOString().split('T')[0];
    await saveSequentialState(state);
    
    return response;
    
  } catch (error) {
    console.error('Error fetching sequential fact:', error);
    
    // Fallback response
    return {
      animalId: 1,
      factIndex: 0,
      fact: 'Discover amazing animal facts in sequential order!',
      animalName: 'Animal',
      totalAnimals: 0,
      totalFacts: 0
    };
  }
}

// Get progress of sequential facts
export async function getSequentialProgress(): Promise<{
  animalId: number;
  factIndex: number;
  totalAnimals: number;
  totalFacts: number;
  currentPosition: number;
  percentage: number;
} | null> {
  try {
    const state = await getOrCreateSequentialState();
    const allFacts = await getAllAnimalFacts();
    
    if (!allFacts.animals) {
      return {
        animalId: state.animalId,
        factIndex: state.factIndex,
        totalAnimals: 0,
        totalFacts: 0,
        currentPosition: 0,
        percentage: 0
      };
    }
    
    // Calculate total facts seen
    let totalSeen = 0;
    for (let i = 0; i < allFacts.animals.length; i++) {
      const animal = allFacts.animals[i];
      if (animal.id < state.animalId) {
        totalSeen += animal.facts?.length || 0;
      } else if (animal.id === state.animalId) {
        totalSeen += state.factIndex;
        break;
      }
    }
    
    const totalFacts = allFacts.animals.reduce((sum, a) => sum + (a.facts?.length || 0), 0);
    
    return {
      animalId: state.animalId,
      factIndex: state.factIndex,
      totalAnimals: allFacts.animals.length,
      totalFacts,
      currentPosition: totalSeen,
      percentage: totalFacts > 0 ? Math.round((totalSeen / totalFacts) * 100) : 0
    };
    
  } catch (error) {
    console.error('Error getting sequential progress:', error);
    return null;
  }
}

// Reset sequential facts progress
export async function resetSequentialProgress(): Promise<void> {
  try {
    const defaultState: FactState = {
      animalId: 1,
      factIndex: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    await saveSequentialState(defaultState);
  } catch (error) {
    console.error('Error resetting sequential progress:', error);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getOrCreateSequentialState(): Promise<FactState> {
  try {
    // Try to get from localStorage
    const stored = localStorage.getItem('sequentialFactState');
    if (stored) {
      const parsed = JSON.parse(stored) as FactState;
      const today = new Date().toISOString().split('T')[0];
      
      // Only return if it's from today (optional: could be persistent)
      // For now, we'll keep it persistent across days
      return parsed;
    }
    
    // Return default state
    return {
      animalId: 1,
      factIndex: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error getting sequential state:', error);
    return {
      animalId: 1,
      factIndex: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }
}

async function saveSequentialState(state: FactState): Promise<void> {
  try {
    localStorage.setItem('sequentialFactState', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving sequential state:', error);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Health check
export async function checkHealth(): Promise<boolean> {
  try {
    const resp = await axios.get(`${BASE_URL}/health`);
    return (resp.data as any).status === 'healthy';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// Get API info
export async function getApiInfo(): Promise<any> {
  try {
    const resp = await axios.get(`${BASE_URL}/`);
    return resp.data as any;
  } catch (error) {
    console.error('Error fetching API info:', error);
    throw error;
  }
}

// Debug: Test all endpoints
export async function testAllEndpoints(): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  
  try {
    // Test health
    results.health = await checkHealth();
    
    // Test daily puzzle
    try {
      results.dailyPuzzle = await getDailyPuzzle(16);
    } catch (e) {
      results.dailyPuzzle = { error: (e as Error).message };
    }
    
    // Test random fact
    try {
      results.randomFact = await getRandomFact();
    } catch (e) {
      results.randomFact = { error: (e as Error).message };
    }
    
    // Test animal facts
    try {
      results.animalFacts = await getAllAnimalFacts({ limit: 3 });
    } catch (e) {
      results.animalFacts = { error: (e as Error).message };
    }
    
    return results;
    
  } catch (error) {
    console.error('Error testing endpoints:', error);
    return { error: (error as Error).message };
  }
}

// Type guard function
export function isPuzzleResponse(data: any): data is PuzzleResponse {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.category === 'string' &&
    typeof data.size === 'number' &&
    data.puzzle &&
    typeof data.puzzle === 'object'
  );
}

export function isFactsResponse(data: any): data is FactsResponse {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.success === 'boolean'
  );
}