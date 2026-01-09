// components/game/BacktrackingValidator.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CellValue = string | null; // Simplified
type Grid = CellValue[][];

interface BacktrackingValidatorProps {
  grid: Grid;
  subgridRows: number;
  subgridCols: number;
  onValidated?: (isValid: boolean) => void;
  themeColors: any;
}

const BacktrackingValidator: React.FC<BacktrackingValidatorProps> = ({
  grid,
  subgridRows,
  subgridCols,
  onValidated,
  themeColors,
}) => {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    conflicts: Array<{ row: number; col: number; reason: string }>;
  }>({ isValid: true, conflicts: [] });

  useEffect(() => {
    validateGrid();
  }, [grid]);

  const validateGrid = () => {
    const conflicts: Array<{ row: number; col: number; reason: string }> = [];
    const gridSize = grid.length;
    
    // Validate rows
    for (let row = 0; row < gridSize; row++) {
      const rowValues = new Set<CellValue>();
      for (let col = 0; col < gridSize; col++) {
        const value = grid[row][col];
        if (value !== null) {
          if (rowValues.has(value)) {
            conflicts.push({ row, col, reason: `Duplicate ${value} in row ${row + 1}` });
          }
          rowValues.add(value);
        }
      }
    }
    
    // Validate columns
    for (let col = 0; col < gridSize; col++) {
      const colValues = new Set<CellValue>();
      for (let row = 0; row < gridSize; row++) {
        const value = grid[row][col];
        if (value !== null) {
          if (colValues.has(value)) {
            conflicts.push({ row, col, reason: `Duplicate ${value} in column ${col + 1}` });
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
            const value = grid[row][col];
            
            if (value !== null) {
              if (subgridValues.has(value)) {
                conflicts.push({ 
                  row, 
                  col, 
                  reason: `Duplicate ${value} in subgrid (${subgridRow + 1}, ${subgridCol + 1})` 
                });
              }
              subgridValues.add(value);
            }
          }
        }
      }
    }
    
    const result = {
      isValid: conflicts.length === 0,
      conflicts
    };
    
    setValidationResult(result);
    onValidated?.(result.isValid);
  };

  if (validationResult.isValid) {
    return (
      <View style={[styles.container, { 
        backgroundColor: (themeColors.success || '#4CAF50') + '20' 
      }]}>
        <Text style={[styles.text, { color: themeColors.success || '#4CAF50' }]}>
          ✓ Puzzle is valid
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { 
      backgroundColor: (themeColors.error || '#F44336') + '20' 
    }]}>
      <Text style={[styles.text, { color: themeColors.error || '#F44336' }]}>
        ⚠️ Found {validationResult.conflicts.length} conflict(s)
      </Text>
      {validationResult.conflicts.slice(0, 3).map((conflict, index) => (
        <Text key={index} style={[styles.conflictText, { color: themeColors.text }]}>
          Row {conflict.row + 1}, Col {conflict.col + 1}: {conflict.reason}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  conflictText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
});

export default BacktrackingValidator;