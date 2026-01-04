// src/game/types.ts

/**
 * A single cell in the puzzle grid
 */
export interface Cell {
  value: number | null;   // number representing the animal tile (1,2,...)
  fixed: boolean;         // true if this tile is given and cannot be changed
}

/**
 * A full puzzle grid
 */
export interface Puzzle {
  grid: Cell[][];         // 2D array representing the puzzle
  gridSize: number;       // size of the grid: 6, 8, 10, 12
  difficulty: Difficulty; // difficulty level of the puzzle
  id?: number;            // optional unique ID for the puzzle
}

/**
 * Difficulty levels for puzzles
 */
export type Difficulty = "easy" | "medium" | "hard";

/**
 * Metadata for a challenge (daily or weekly)
 */
export interface Challenge {
  type: "daily" | "weekly"; // type of challenge
  puzzleId: number;         // unique puzzle ID in challenge
  gridSize: number;         // grid size for this challenge
  difficulty: Difficulty;   // difficulty level
  date: string;             // ISO string: "YYYY-MM-DD" for daily, start date for weekly
  maxAttempts: number;      // max attempts allowed per player
}

/**
 * Player statistics structure
 */
export interface Stats {
  puzzlesCompleted: number;                  // total puzzles completed
  bestTimes: { [gridSize: string]: string };// best times per grid size, e.g., { "6x6": "2m 15s" }
  dailyScore: number;                        // cumulative daily challenge score
  weeklyScore: number;                       // cumulative weekly challenge score
  accuracy: number;                          // percentage of correct tiles filled
}

/**
 * Optional type for the mapping of numbers to animal emojis
 */
export type AnimalMap = { [key: number]: string };
