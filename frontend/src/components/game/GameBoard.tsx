// src/components/game/GameBoard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface GameBoardProps {
  gridSize: string;
  difficulty: string;
  onComplete: (isPerfect: boolean) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  gridSize, 
  difficulty, 
  onComplete 
}) => {
  const [board, setBoard] = useState<any[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [moves, setMoves] = useState(0);
  const [perfectMoves, setPerfectMoves] = useState(0);

  // Parse grid size (e.g., "8x8" -> 8)
  const parseGridSize = (size: string): number => {
    if (size.includes('x')) {
      return parseInt(size.split('x')[0]);
    }
    return parseInt(size) || 8;
  };

  const size = parseGridSize(gridSize);

  // Initialize the game board
  useEffect(() => {
    initializeBoard();
  }, [gridSize]); // Re-initialize when gridSize changes

  const initializeBoard = () => {
    // Create a simple grid
    const newBoard = Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => ({
        value: Math.random() > 0.5 ? '🐶' : '🐱',
        isMatched: false,
      }))
    );
    setBoard(newBoard);
    setMoves(0);
    setPerfectMoves(0);
    setSelectedCell(null);
  };

  const handleCellPress = (row: number, col: number) => {
    // YOUR GAME LOGIC HERE
    // This is just a placeholder - implement your actual game rules
    
    setMoves(m => m + 1);
    
    // Simulate perfect move (replace with actual logic)
    if (Math.random() > 0.3) {
      setPerfectMoves(p => p + 1);
    }

    // Check if game is complete (replace with actual win condition)
    const allMatched = board.every(row => 
      row.every(cell => cell.isMatched)
    );

    if (allMatched) {
      const isPerfect = perfectMoves === moves;
      onComplete(isPerfect);
    }
  };

  const renderCell = (row: number, col: number) => {
    const cell = board[row]?.[col];
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;

    return (
      <TouchableOpacity
        key={`cell-${row}-${col}`}
        style={[
          styles.cell,
          isSelected && styles.selectedCell,
          cell?.isMatched && styles.matchedCell,
        ]}
        onPress={() => handleCellPress(row, col)}
      >
        <Text style={styles.cellText}>
          {cell?.isMatched ? '✓' : cell?.value || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.stats}>Moves: {moves}</Text>
        <Text style={styles.stats}>Perfect: {perfectMoves}</Text>
        <Text style={styles.stats}>Grid: {size}x{size}</Text>
      </View>

      <View style={[styles.board, { width: size * 45 }]}>
        {board.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  stats: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  board: {
    flexWrap: 'wrap',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 40,
    height: 40,
    margin: 2,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  matchedCell: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  cellText: {
    fontSize: 18,
    fontWeight: '600',
  },
});