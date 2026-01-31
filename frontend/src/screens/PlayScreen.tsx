import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  getDailyPuzzle,
  getWeeklyPuzzle,
  getSequentialPuzzle,
  PuzzleResponse,
} from '../services/api';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export default function PlayScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    size = 6,
    difficulty = 'easy',
    mode = 'sequential', // 'daily' | 'weekly' | 'sequential'
  } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [puzzle, setPuzzle] = useState<string[][]>([]);
  const [solution, setSolution] = useState<string[][]>([]);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [animalOptions, setAnimalOptions] = useState<string[]>([]);

  const [moves, setMoves] = useState(0);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);

  const [showStats, setShowStats] = useState(false);

  // ============================================
  // LOAD PUZZLE (API ONLY)
  // ============================================

  const loadPuzzle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response: PuzzleResponse;

      if (mode === 'daily') {
        response = await getDailyPuzzle(size);
      } else if (mode === 'weekly') {
        response = await getWeeklyPuzzle(size);
      } else {
        response = await getSequentialPuzzle(
          size,
          difficulty.toLowerCase() as Difficulty
        );
      }

      const apiPuzzle = response.puzzle;

      setPuzzle(apiPuzzle.puzzle);
      setSolution(apiPuzzle.solution);
      setUserGrid(apiPuzzle.puzzle.map(row => [...row]));
      setAnimalOptions(apiPuzzle.contents);

      setMoves(0);
      setSelectedAnimal(null);
    } catch (err) {
      console.error('Puzzle load failed:', err);
      setError('Failed to load puzzle from server.');
      setPuzzle([]);
      setSolution([]);
      setUserGrid([]);
      setAnimalOptions([]);
    } finally {
      setLoading(false);
    }
  }, [size, difficulty, mode]);

  useEffect(() => {
    loadPuzzle();
  }, [loadPuzzle]);

  // ============================================
  // GRID INTERACTION
  // ============================================

  const handleCellPress = (row: number, col: number) => {
    if (!selectedAnimal) return;
    if (solution[row][col] !== selectedAnimal) return;

    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = selectedAnimal;

    setUserGrid(newGrid);
    setMoves(prev => prev + 1);
  };

  const clearGrid = () => {
    setUserGrid(puzzle.map(row => [...row]));
    setMoves(0);
    setSelectedAnimal(null);
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading puzzle…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadPuzzle}>
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Animals</Text>
          <Text style={styles.difficulty}>
            {difficulty.toUpperCase()} · {size}×{size}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.movesText}>Moves: {moves}</Text>
        </View>
      </View>

      {/* GRID */}
      <View style={styles.gridContainer}>
        {userGrid.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => (
              <TouchableOpacity
                key={c}
                style={styles.cell}
                onPress={() => handleCellPress(r, c)}
              >
                <View style={styles.animalContainer}>
                  <Text style={styles.animalEmoji}>{cell}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* SELECTOR */}
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>Select Animal</Text>
        <ScrollView horizontal contentContainerStyle={styles.animalScrollContent}>
          {animalOptions.map(animal => (
            <TouchableOpacity
              key={animal}
              style={styles.animalButton}
              onPress={() => setSelectedAnimal(animal)}
            >
              <Text style={styles.animalButtonText}>{animal}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* CONTROLS */}
      <View style={styles.controls}>
        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.controlButton} onPress={clearGrid}>
            <Text style={styles.controlButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowStats(true)}
          >
            <Text style={styles.controlButtonText}>Stats</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* STATS MODAL */}
      <Modal visible={showStats} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.statsModal}>
            <Text style={styles.statsTitle}>Game Stats</Text>
            <Text>Moves: {moves}</Text>

            <View style={styles.statsButtons}>
              <TouchableOpacity
                style={styles.statsButton}
                onPress={() => setShowStats(false)}
              >
                <Text style={styles.statsButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
   STYLES — UNCHANGED (YOUR ORIGINAL BLOCK)
========================================================= */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 5,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 8 },
  backButton: { padding: 6 },
  backButtonText: { fontSize: 24, fontWeight: 'bold' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRight: { alignItems: 'flex-end' },
  title: { fontSize: 20, fontWeight: 'bold' },
  difficulty: { fontSize: 12, opacity: 0.8, marginTop: 2 },
  timerContainer: { marginBottom: 4 },
  timerText: { fontSize: 14, fontWeight: '600' },
  movesContainer: { padding: 4 },
  movesText: { fontSize: 14, fontWeight: '600' },
  selectedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
  },
  selectedText: { fontSize: 14, fontWeight: '600' },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F44336',
    borderRadius: 6,
  },
  clearButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  gridContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    padding: 3,
  },
  row: { flexDirection: 'row' },
  cell: { justifyContent: 'center', alignItems: 'center', margin: 0 },
  animalContainer: { justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },
  animalEmoji: { fontWeight: 'bold' },
  selectorContainer: { marginTop: 5, marginHorizontal: 20 },
  selectorTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  animalScrollContent: { paddingVertical: 8, justifyContent: 'center' },
  animalButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animalButtonText: { fontWeight: 'bold' },
  controls: { marginHorizontal: 20, marginVertical: 10 },
  mainControls: { flexDirection: 'row', justifyContent: 'space-between' },
  controlButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlButtonText: { color: 'white', fontSize: 13, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsModal: {
    width: '85%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  statsTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  statsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statsButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statsButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
});

