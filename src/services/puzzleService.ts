// src/services/puzzleService.ts
import { Puzzle, Difficulty } from "../game/types";

/**
 * Fetch a puzzle from the GitHub sudoAPI
 * Returns a Puzzle object with grid, gridSize, difficulty, and optional id
 */
export const fetchPuzzle = async (
  gridSize: number,
  difficulty: Difficulty,
  puzzleId: number = 1
): Promise<Puzzle> => {
  try {
    const url = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/${gridSize}/${difficulty}/${difficulty}_${gridSize}_${puzzleId}.json`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Failed to fetch puzzle: ${res.status}`);

    const data = await res.json();

    // Ensure the return matches the Puzzle type
    return {
      grid: data.grid,
      gridSize,
      difficulty,
      id: puzzleId,
    };
  } catch (err) {
    console.error("fetchPuzzle error:", err);
    throw err;
  }
};
