// src/utils/FactSequencer.ts

import { fetchCategoryFacts, Category, CategoryFact } from '../services/api';

export interface SequentialFactResponse {
  fact: string;
  animalName: string;
  animalId: number;
  totalAnimals: number;
  factIndex: number;
  totalFacts: number;
}

/**
 * Clean fact text - remove animal name if it starts the sentence
 */
export const cleanFactText = (fact: string, animalName: string): string => {
  if (!fact || !animalName) return fact || '';
  
  const lowerFact = fact.toLowerCase().trim();
  const lowerAnimalName = animalName.toLowerCase();
  
  const patterns = [
    `${lowerAnimalName}:`,
    `${lowerAnimalName}s:`,
    `the ${lowerAnimalName}`,
    `a ${lowerAnimalName}`,
    `an ${lowerAnimalName}`,
  ];
  
  let cleanedFact = fact;
  
  for (const pattern of patterns) {
    if (lowerFact.startsWith(pattern)) {
      const matchLength = fact.slice(0, pattern.length).length;
      cleanedFact = fact.slice(matchLength).trim();
      
      if (cleanedFact.length > 0) {
        cleanedFact = cleanedFact.charAt(0).toUpperCase() + cleanedFact.slice(1);
      }
      break;
    }
  }
  
  return cleanedFact;
};

/**
 * Check if fact starts with animal name
 */
export const factStartsWithAnimalName = (fact: string, animalName: string): boolean => {
  if (!fact || !animalName) return false;
  
  const lowerFact = fact.toLowerCase().trim();
  const lowerAnimalName = animalName.toLowerCase();
  
  const startsWithPatterns = [
    `${lowerAnimalName}:`,
    `${lowerAnimalName}s:`,
    `the ${lowerAnimalName}`,
    `a ${lowerAnimalName}`,
    `an ${lowerAnimalName}`,
  ];
  
  return startsWithPatterns.some(pattern => lowerFact.startsWith(pattern));
};

/**
 * Process sequential fact response
 */
export const processSequentialFact = (
  response: SequentialFactResponse
): {
  displayFact: string;
  animalName: string;
  wasCleaned: boolean;
  progress: string;
} => {
  const wasCleaned = factStartsWithAnimalName(response.fact, response.animalName);
  const displayFact = wasCleaned 
    ? cleanFactText(response.fact, response.animalName)
    : response.fact;
  
  const formattedAnimalName = formatAnimalName(response.animalName);
  
  const progress = `Animal ${response.animalId}/${response.totalAnimals} • Fact ${response.factIndex + 1}/${response.totalFacts}`;
  
  return {
    displayFact,
    animalName: formattedAnimalName,
    wasCleaned,
    progress,
  };
};

/**
 * Format animal name for display
 */
export const formatAnimalName = (animalName: string): string => {
  if (!animalName) return '';
  
  return animalName.charAt(0).toUpperCase() + animalName.slice(1);
};

/**
 * Create a sequential fact sequencer for a category
 */
export class CategoryFactSequencer {
  private category: Category;
  private facts: CategoryFact[] = [];
  private currentAnimalIndex: number = 0;
  private currentFactIndex: number = 0;
  private initialized: boolean = false;

  constructor(category: Category) {
    this.category = category;
  }

  async initialize(): Promise<void> {
    try {
      const factsData = await fetchCategoryFacts(this.category);
      
      if (factsData && factsData.length > 0) {
        this.facts = factsData;
      }
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing fact sequencer:', error);
      this.initialized = true;
    }
  }

  getCurrentFact(): SequentialFactResponse | null {
    if (!this.initialized || this.facts.length === 0) {
      return null;
    }

    const currentAnimal = this.facts[this.currentAnimalIndex];
    const fact = currentAnimal.facts[this.currentFactIndex] || currentAnimal.facts[0];

    return {
      fact,
      animalName: currentAnimal.name,
      animalId: this.currentAnimalIndex + 1,
      totalAnimals: this.facts.length,
      factIndex: this.currentFactIndex,
      totalFacts: currentAnimal.facts.length,
    };
  }

  nextFact(): SequentialFactResponse | null {
    if (!this.initialized || this.facts.length === 0) {
      return null;
    }

    const currentAnimal = this.facts[this.currentAnimalIndex];
    
    // Move to next fact within current animal
    if (this.currentFactIndex + 1 < currentAnimal.facts.length) {
      this.currentFactIndex++;
    } else {
      // Move to next animal
      this.currentAnimalIndex = (this.currentAnimalIndex + 1) % this.facts.length;
      this.currentFactIndex = 0;
    }

    return this.getCurrentFact();
  }

  previousFact(): SequentialFactResponse | null {
    if (!this.initialized || this.facts.length === 0) {
      return null;
    }

    // Move to previous fact
    if (this.currentFactIndex > 0) {
      this.currentFactIndex--;
    } else {
      // Move to previous animal
      this.currentAnimalIndex = (this.currentAnimalIndex - 1 + this.facts.length) % this.facts.length;
      const prevAnimal = this.facts[this.currentAnimalIndex];
      this.currentFactIndex = prevAnimal.facts.length - 1;
    }

    return this.getCurrentFact();
  }

  reset(): void {
    this.currentAnimalIndex = 0;
    this.currentFactIndex = 0;
  }

  getProgress(): { current: number; total: number; percentage: number } {
    if (this.facts.length === 0) {
      return { current: 0, total: 0, percentage: 0 };
    }

    const totalFacts = this.facts.reduce((sum, animal) => sum + animal.facts.length, 0);
    let factsSeen = 0;
    
    for (let i = 0; i < this.currentAnimalIndex; i++) {
      factsSeen += this.facts[i].facts.length;
    }
    factsSeen += this.currentFactIndex + 1;

    return {
      current: factsSeen,
      total: totalFacts,
      percentage: (factsSeen / totalFacts) * 100,
    };
  }

  isInitialized(): boolean {
    return this.initialized && this.facts.length > 0;
  }
}

/**
 * Test cleaning function
 */
export const testCleaning = () => {
  const tests = [
    { fact: "Aardvark: They are nocturnal.", animal: "Aardvark", expected: "They are nocturnal." },
    { fact: "Aardvarks: They eat ants.", animal: "Aardvark", expected: "They eat ants." },
    { fact: "The aardvark digs quickly.", animal: "Aardvark", expected: "Digs quickly." },
    { fact: "A aardvark has long tongue.", animal: "Aardvark", expected: "Has long tongue." },
    { fact: "An aardvark lives in Africa.", animal: "Aardvark", expected: "Lives in Africa." },
    { fact: "Aardvarks are mammals.", animal: "Aardvark", expected: "Aardvarks are mammals." },
  ];
  
  console.log('Testing fact cleaning:');
  tests.forEach(test => {
    const cleaned = cleanFactText(test.fact, test.animal);
    const matches = cleaned === test.expected;
    console.log(`${matches ? '✓' : '✗'} "${test.fact}" -> "${cleaned}"`);
  });
};

// Export a singleton instance for the current category
let sequencerInstance: CategoryFactSequencer | null = null;

export const getCategoryFactSequencer = (category: Category): CategoryFactSequencer => {
  if (!sequencerInstance || sequencerInstance['category'] !== category) {
    sequencerInstance = new CategoryFactSequencer(category);
  }
  return sequencerInstance;
};