export type CellValue = string | null;
export type Grid = CellValue[][];

export interface PuzzleConstraints {
  gridSize: number;
  subgridRows: number;
  subgridCols: number;
  allowedValues: string[];
}

export class BacktrackingSolver {
  private grid: Grid;
  private constraints: PuzzleConstraints;
  
  constructor(grid: Grid, constraints: PuzzleConstraints) {
    this.grid = JSON.parse(JSON.stringify(grid)); // Deep copy
    this.constraints = constraints;
  }
  
  // Check if value can be placed at (row, col)
  private isValidPlacement(row: number, col: number, value: CellValue): boolean {
    if (value === null) return true;
    
    const { gridSize, subgridRows, subgridCols } = this.constraints;
    
    // Check row
    for (let c = 0; c < gridSize; c++) {
      if (c !== col && this.grid[row][c] === value) {
        return false;
      }
    }
    
    // Check column
    for (let r = 0; r < gridSize; r++) {
      if (r !== row && this.grid[r][col] === value) {
        return false;
      }
    }
    
    // Check subgrid
    const subgridRow = Math.floor(row / subgridRows);
    const subgridCol = Math.floor(col / subgridCols);
    const startRow = subgridRow * subgridRows;
    const startCol = subgridCol * subgridCols;
    
    for (let r = 0; r < subgridRows; r++) {
      for (let c = 0; c < subgridCols; c++) {
        const currentRow = startRow + r;
        const currentCol = startCol + c;
        
        if (currentRow !== row && currentCol !== col && 
            this.grid[currentRow][currentCol] === value) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  // Find empty cell
  private findEmptyCell(): [number, number] | null {
    for (let row = 0; row < this.constraints.gridSize; row++) {
      for (let col = 0; col < this.constraints.gridSize; col++) {
        if (this.grid[row][col] === null) {
          return [row, col];
        }
      }
    }
    return null;
  }
  
  // Backtracking algorithm
  public solve(): { solved: boolean; solution: Grid; steps: number } {
    const emptyCell = this.findEmptyCell();
    
    if (!emptyCell) {
      return { solved: true, solution: this.grid, steps: 0 };
    }
    
    const [row, col] = emptyCell;
    let steps = 0;
    
    for (const value of this.constraints.allowedValues) {
      steps++;
      
      if (this.isValidPlacement(row, col, value)) {
        this.grid[row][col] = value;
        
        const result = this.solve();
        steps += result.steps;
        
        if (result.solved) {
          return { solved: true, solution: result.solution, steps };
        }
        
        // Backtrack
        this.grid[row][col] = null;
      }
    }
    
    return { solved: false, solution: this.grid, steps };
  }
  
  // Check if current grid is valid
  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const { gridSize, subgridRows, subgridCols } = this.constraints;
    
    // Validate rows
    for (let row = 0; row < gridSize; row++) {
      const rowValues = new Set<CellValue>();
      for (let col = 0; col < gridSize; col++) {
        const value = this.grid[row][col];
        if (value !== null) {
          if (rowValues.has(value)) {
            errors.push(`Row ${row + 1} has duplicate ${value}`);
          }
          rowValues.add(value);
        }
      }
    }
    
    // Validate columns
    for (let col = 0; col < gridSize; col++) {
      const colValues = new Set<CellValue>();
      for (let row = 0; row < gridSize; row++) {
        const value = this.grid[row][col];
        if (value !== null) {
          if (colValues.has(value)) {
            errors.push(`Column ${col + 1} has duplicate ${value}`);
          }
          colValues.add(value);
        }
      }
    }
    
    // Validate subgrids
    const subgridSize = Math.sqrt(gridSize);
    for (let subgridRow = 0; subgridRow < subgridSize; subgridRow++) {
      for (let subgridCol = 0; subgridCol < subgridSize; subgridCol++) {
        const subgridValues = new Set<CellValue>();
        const startRow = subgridRow * subgridRows;
        const startCol = subgridCol * subgridCols;
        
        for (let r = 0; r < subgridRows; r++) {
          for (let c = 0; c < subgridCols; c++) {
            const row = startRow + r;
            const col = startCol + c;
            const value = this.grid[row][col];
            
            if (value !== null) {
              if (subgridValues.has(value)) {
                errors.push(`Subgrid (${subgridRow + 1}, ${subgridCol + 1}) has duplicate ${value}`);
              }
              subgridValues.add(value);
            }
          }
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Generate a solvable puzzle
  public static generatePuzzle(constraints: PuzzleConstraints, difficulty: number = 0.5): Grid {
    const { gridSize, allowedValues } = constraints;
    const grid: Grid = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null)
    );
    
    const solver = new BacktrackingSolver(grid, constraints);
    const { solution } = solver.solve();
    
    // Remove some cells based on difficulty
    const cellsToRemove = Math.floor(gridSize * gridSize * difficulty);
    const removedCells = new Set<string>();
    
    while (removedCells.size < cellsToRemove) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      const key = `${row},${col}`;
      
      if (!removedCells.has(key)) {
        solution[row][col] = null;
        removedCells.add(key);
      }
    }
    
    return solution;
  }
}