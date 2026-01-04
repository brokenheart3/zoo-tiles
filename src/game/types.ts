// -----------------------------
// Grid Configs for Zoo-Tiles
// -----------------------------
export type GridSize = 6 | 8 | 10 | 12;

export type SubGridConfig = {
  rows: number;
  cols: number;
};

export type GridConfig = {
  size: GridSize;
  subgrid: SubGridConfig;
  symbolCount: number; // number of unique animals per grid
};

// Predefined grid configs
export const GRID_CONFIGS: Record<GridSize, GridConfig> = {
  6: { size: 6, subgrid: { rows: 3, cols: 2 }, symbolCount: 6 },
  8: { size: 8, subgrid: { rows: 4, cols: 2 }, symbolCount: 8 },
  10: { size: 10, subgrid: { rows: 5, cols: 2 }, symbolCount: 10 },
  12: { size: 12, subgrid: { rows: 3, cols: 4 }, symbolCount: 12 },
};

// -----------------------------
// Helper function: subgrid index
// -----------------------------
export function getSubgridIndex(
  row: number,
  col: number,
  gridSize: GridSize
): number {
  const { rows, cols } = GRID_CONFIGS[gridSize].subgrid;

  const subgridRow = Math.floor(row / rows);
  const subgridCol = Math.floor(col / cols);

  return subgridRow * (gridSize / cols) + subgridCol;
}

// -----------------------------
// Cell and Puzzle Types
// -----------------------------
export type Cell = {
  value: number | null; // 1..N (later mapped to animals), null if empty
  fixed: boolean;       // true if part of the original puzzle
};

export type Puzzle = {
  id: string;           // unique puzzle ID from sudoAPI
  size: GridSize;       // 6,8,10,12
  grid: Cell[][];       // 2D array of cells
  solution?: number[][]; // optional full solution
};

// -----------------------------
// Example (for testing)
// -----------------------------
export const examplePuzzle: Puzzle = {
  id: "6_easy_1",
  size: 6,
  grid: [
    [
      { value: 1, fixed: true },
      { value: null, fixed: false },
      { value: 3, fixed: true },
      { value: null, fixed: false },
      { value: 5, fixed: true },
      { value: null, fixed: false },
    ],
    [
      { value: null, fixed: false },
      { value: 2, fixed: true },
      { value: null, fixed: false },
      { value: 4, fixed: true },
      { value: null, fixed: false },
      { value: 6, fixed: true },
    ],
    // 4 more rows ...
  ],
  solution: [
    [1,2,3,4,5,6],
    [6,2,5,4,1,3],
    // ...
  ],
};
