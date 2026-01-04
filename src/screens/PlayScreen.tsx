// src/screens/PlayScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { fetchPuzzle } from "../services/puzzleService";
import { Puzzle, Cell } from "../game/types";

// Animal emojis for the grid
const ANIMALS: { [key: number]: string } = {
  1: "🐶",
  2: "🐱",
  3: "🐭",
  4: "🐰",
  5: "🦊",
  6: "🐻",
  7: "🐼",
  8: "🐨",
  9: "🐯",
  10: "🦁",
  11: "🐮",
  12: "🐸",
};

const PlayScreen: React.FC = () => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);
  const [history, setHistory] = useState<Puzzle[]>([]);

  const size = puzzle?.gridSize || 6;

  // Determine subgrid dimensions based on grid size
  const getSubgridSize = (gridSize: number) => {
    switch (gridSize) {
      case 6: return { rows: 2, cols: 3 };
      case 8: return { rows: 2, cols: 4 };
      case 10: return { rows: 2, cols: 5 };
      case 12: return { rows: 4, cols: 3 };
      default: return { rows: 2, cols: 2 };
    }
  };

  const { rows: subRows, cols: subCols } = getSubgridSize(size);

  // Load a puzzle from API
  const loadPuzzle = async () => {
    setLoading(true);
    try {
      const puzzleData = await fetchPuzzle(size, "easy");
      setPuzzle(puzzleData);
      setHistory([]);
    } catch (err) {
      console.error("Error loading puzzle:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPuzzle();
  }, []);

  // Handle cell press
  const handleCellPress = (row: number, col: number) => {
    if (!puzzle) return;
    const cell = puzzle.grid[row][col];
    if (cell.fixed) return;

    setSelectedCell({ row, col });

    if (selectedAnimal !== null) {
      setHistory([...history, JSON.parse(JSON.stringify(puzzle))]);

      const newGrid = puzzle.grid.map((r, ri) =>
        r.map((c, ci) => (ri === row && ci === col ? { ...c, value: selectedAnimal } : c))
      );

      setPuzzle({ ...puzzle, grid: newGrid });
    }
  };

  // Action buttons
  const handleReset = () => loadPuzzle();
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setPuzzle(last);
    setHistory(history.slice(0, -1));
  };
  const handleNextPuzzle = () => loadPuzzle();

  // Render the grid
  const renderGrid = () => {
    if (!puzzle) return null;

    return puzzle.grid.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((cell, colIndex) => {
          const borderTop = rowIndex % subRows === 0 ? 3 : 1;
          const borderLeft = colIndex % subCols === 0 ? 3 : 1;
          const borderRight = (colIndex + 1) % subCols === 0 ? 3 : 1;
          const borderBottom = (rowIndex + 1) % subRows === 0 ? 3 : 1;

          const isSelected =
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex;

          return (
            <TouchableOpacity
              key={colIndex}
              style={[
                styles.cell,
                cell.fixed ? styles.fixedCell : styles.editableCell,
                {
                  borderTopWidth: borderTop,
                  borderLeftWidth: borderLeft,
                  borderRightWidth: borderRight,
                  borderBottomWidth: borderBottom,
                  backgroundColor: isSelected ? "#cceeff" : cell.fixed ? "#ddd" : "#fff",
                },
              ]}
              onPress={() => handleCellPress(rowIndex, colIndex)}
            >
              <Text style={styles.cellText}>
                {cell.value ? ANIMALS[cell.value] : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  if (loading || !puzzle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={{ marginTop: 10 }}>Loading puzzle...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderGrid()}

      {/* Emoji picker */}
      <View style={styles.emojiContainer}>
        {Object.entries(ANIMALS).map(([num, emoji]) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.emojiButton,
              selectedAnimal === Number(num) ? styles.selectedEmoji : null,
            ]}
            onPress={() => setSelectedAnimal(Number(num))}
          >
            <Text style={styles.cellText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleReset}>
          <Text>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleUndo}>
          <Text>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleNextPuzzle}>
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 10, alignItems: "center" },
  row: { flexDirection: "row" },
  cell: {
    width: 50,
    height: 50,
    margin: 0,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#333",
    borderRadius: 3,
  },
  fixedCell: { backgroundColor: "#ddd" },
  editableCell: { backgroundColor: "#fff" },
  cellText: { fontSize: 24 },

  emojiContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
    justifyContent: "center",
  },
  emojiButton: {
    width: 40,
    height: 40,
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,
  },
  selectedEmoji: { borderColor: "blue", borderWidth: 2 },

  actionContainer: {
    flexDirection: "row",
    marginTop: 15,
  },
  actionButton: {
    marginHorizontal: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
});

export default PlayScreen;
