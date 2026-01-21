// src/utils/FactSequencer.ts

import { SequentialFactResponse } from '../services/api';

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
  
  const progress = `Animal ${response.animalId}/${response.totalAnimals} • Fact ${response.factIndex + 1}`;
  
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