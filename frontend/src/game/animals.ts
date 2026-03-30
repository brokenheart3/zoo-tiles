// -----------------------------
// Animal Symbols for Sudoku-Tiles
// -----------------------------

export const ANIMALS: Record<number, string> = {
  1: "🦁", // Lion
  2: "🐯", // Tiger
  3: "🐘", // Elephant
  4: "🦓", // Zebra
  5: "🦒", // Giraffe
  6: "🐵", // Monkey
  7: "🐍", // Snake
  8: "🐢", // Turtle
  9: "🦅", // Eagle
  10: "🐬", // Dolphin
  11: "🐧", // Penguin
  12: "🦘", // Kangaroo
};

// -----------------------------
// Get animal by number helper
// -----------------------------
export function getAnimal(value: number | null): string | null {
  if (value === null) return null;
  return ANIMALS[value] ?? null;
}


