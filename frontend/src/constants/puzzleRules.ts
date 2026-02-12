// src/constants/puzzleRules.ts

export type ChallengeMode = 'daily' | 'weekly' | 'sequential';

export interface PuzzleRules {
  allowNext: boolean;        // Show "Next" button to go to the next puzzle
  allowReset: boolean;       // Allow resetting the current puzzle
  allowHint: boolean;        // Allow hints
  allowUndo: boolean;        // Allow undo
  maxMoves?: number;         // Optional max moves (for scoring)
  timerEnabled: boolean;     // Show timer
  highlightSameAnimal: boolean; // Highlight all cells with same animal when clicked
  markWrongEntry: boolean;      // Mark wrong entries in red
}

export const PUZZLE_RULES: Record<ChallengeMode, PuzzleRules> = {
  daily: {
    allowNext: false,
    allowReset: true,
    allowHint: true,
    allowUndo: true,
    timerEnabled: true,
    highlightSameAnimal: true,
    markWrongEntry: true,
  },
  weekly: {
    allowNext: false,
    allowReset: true,
    allowHint: true,
    allowUndo: true,
    timerEnabled: true,
    highlightSameAnimal: true,
    markWrongEntry: true,
  },
  sequential: {
    allowNext: true,
    allowReset: true,
    allowHint: true,
    allowUndo: true,
    timerEnabled: true,
    highlightSameAnimal: true,
    markWrongEntry: true,
  },
};
