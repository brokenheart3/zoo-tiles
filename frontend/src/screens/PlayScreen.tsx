// src/screens/PlayScreen.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';
import { useProfile } from '../context/ProfileContext';
import {
  fetchSequentialPuzzle,
  fetchDailyChallenge,
  fetchWeeklyChallenge,
  PuzzleResponse
} from '../services/api';
import ControlButton from '../components/play/ControlButton';
import HintButton from '../components/play/HintButton';
import { TouchableOpacity } from 'react-native-gesture-handler';

type Mode = 'sequential' | 'daily' | 'weekly';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 20;
const GRID_SCALE = 0.75;

export default function PlayScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { settings } = useSettings();
  const { profile, updateProfile } = useProfile();

  // Extract challengeType from params, default to sequential
  const { challengeType } = route.params ?? {};
  const mode: Mode = challengeType ?? 'sequential';

  const sizeNumber = parseInt(settings.gridSize);
  const subgridSize = Math.sqrt(sizeNumber);
  const GRID_SIZE = SCREEN_WIDTH * GRID_SCALE;
  const cellSize = GRID_SIZE / sizeNumber;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [puzzleData, setPuzzleData] = useState<PuzzleResponse | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [disabledCards, setDisabledCards] = useState<Set<string>>(new Set());
  const [clickedCell, setClickedCell] = useState<{ row: number; col: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<string[][][]>([]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRunning = useRef(false);

  // ======================
  // Load puzzle based on mode
  // ======================
  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let puzzle: PuzzleResponse | null = null;

      if (mode === 'daily') puzzle = await fetchDailyChallenge(sizeNumber);
      else if (mode === 'weekly') puzzle = await fetchWeeklyChallenge(sizeNumber);
      else puzzle = await fetchSequentialPuzzle(sizeNumber);

      if (!puzzle) throw new Error(`No puzzle returned for mode: ${mode}`);

      setPuzzleData(puzzle);
      setUserGrid(puzzle.puzzle.map(r => [...r]));
      setDisabledCards(new Set());
      setHistory([]);
      setMoves(0);
      setClickedCell(null);
      setTimer(0);
      timerRunning.current = false;
      if (timerRef.current) clearInterval(timerRef.current);

      console.log('✅ Loaded puzzle:', puzzle.id);

    } catch (err) {
      console.error('❌ Failed to load puzzle:', err);
      setError(`Failed to load puzzle. Check console.`);
    } finally {
      setLoading(false);
    }
  }, [mode, sizeNumber]);

  // Initial load
  useEffect(() => {
    loadPuzzle();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRunning.current = false;
    };
  }, [loadPuzzle]);

  // ======================
  // Handle returning to Play screen (tab focus)
  // ======================
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const { challengeType } = route.params ?? {};
      // If no challengeType in params, ensure we're in sequential mode
      if (!challengeType && mode !== 'sequential') {
        loadPuzzle();
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.challengeType, mode, loadPuzzle]);

  // ======================
  // Handle tab press when already on Play screen
  // ======================
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e: any) => {
      // Check if this tab is already focused
      const isFocused = navigation.isFocused();
      
      if (isFocused) {
        // User tapped the Play tab while already on it — reset to sequential
        const { challengeType } = route.params ?? {};
        if (challengeType) {
          // Clear params and reload sequential
          navigation.setParams({ challengeType: undefined });
        } else {
          // Already sequential, just reload fresh puzzle
          loadPuzzle();
        }
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.challengeType, loadPuzzle]);

  // ======================
  // Timer
  // ======================
  const startTimer = () => {
    if (!timerRunning.current) {
      timerRunning.current = true;
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
  };

  const stopTimer = () => {
    if (timerRunning.current && timerRef.current) {
      clearInterval(timerRef.current);
      timerRunning.current = false;
    }
  };

  // ======================
  // Cell & Card Handlers
  // ======================
  const handleCellPress = (row: number, col: number) => {
    setClickedCell({ row, col });
    startTimer();
  };

  const handleCardPress = (animal: string) => {
    if (!clickedCell || !puzzleData || disabledCards.has(animal)) return;

    const { row, col } = clickedCell;
    const newGrid = userGrid.map(r => [...r]);
    const isWrong = puzzleData.solution[row][col] !== animal;

    if (isWrong) {
      newGrid[row][col] = '❌';
      setUserGrid(newGrid);
      setTimeout(() => setUserGrid(userGrid.map(r => [...r])), 500);
    } else {
      newGrid[row][col] = animal;
      setUserGrid(newGrid);

      const remaining = newGrid.flat().filter((v, idx) => {
        const r = Math.floor(idx / sizeNumber);
        const c = idx % sizeNumber;
        return puzzleData.solution[r][c] === animal && newGrid[r][c] !== animal;
      });

      if (remaining.length === 0) setDisabledCards(prev => new Set(prev).add(animal));

      const solved = newGrid.every((row, r) => row.every((cell, c) => cell === puzzleData.solution[r][c]));
      if (solved) {
        stopTimer();
        Alert.alert('🎉 Puzzle Completed!', `You solved the puzzle in ${Math.floor(timer/60)}:${(timer%60).toString().padStart(2,'0')}`);
      }
    }

    setHistory(h => [...h, userGrid.map(r => [...r])]);
    setMoves(m => m + 1);
    setClickedCell(null);

    // Update profile stats
    if (profile && !isWrong) {
      const now = new Date();
      const lastPlayedDate = profile.stats.lastPlayDate ? new Date(profile.stats.lastPlayDate) : null;
      let streak = profile.stats.currentStreak ?? 0;
      let totalPlayDays = profile.stats.totalPlayDays ?? 0;

      if (!lastPlayedDate || now.toDateString() !== lastPlayedDate.toDateString()) {
        streak += 1;
        totalPlayDays += 1;
      }

      updateProfile({
        stats: {
          ...profile.stats,
          puzzlesSolved: (profile.stats.puzzlesSolved ?? 0) + 1,
          currentStreak: streak,
          totalPlayDays,
          lastPlayDate: now.toISOString(),
        },
      });
    }
  };

  // ======================
  // Reset, Hint, Undo
  // ======================
  const resetGrid = () => {
    if (!puzzleData) return;
    setUserGrid(puzzleData.puzzle.map(r => [...r]));
    setMoves(0);
    setHistory([]);
    setClickedCell(null);
    setTimer(0);
    setDisabledCards(new Set());
    if (timerRef.current) clearInterval(timerRef.current);
    timerRunning.current = false;
  };

  const hintMove = () => {
    if (!puzzleData) return;
    for (let r = 0; r < sizeNumber; r++) {
      for (let c = 0; c < sizeNumber; c++) {
        if (userGrid[r][c] !== puzzleData.solution[r][c]) {
          const newGrid = userGrid.map(row => [...row]);
          newGrid[r][c] = puzzleData.solution[r][c];
          setHistory(h => [...h, userGrid.map(row => [...row])]);
          setUserGrid(newGrid);
          setMoves(m => m + 1);
          return;
        }
      }
    }
  };

  const undoMove = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setUserGrid(prev.map(r => [...r]));
    setHistory(h => h.slice(0, -1));
    setMoves(m => Math.max(0, m - 1));
  };

  const nextPuzzle = async () => {
    if (mode === 'sequential') await loadPuzzle();
  };

  // ======================
  // Render
  // ======================
  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Loading puzzle…</Text>
    </View>
  );

  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <ControlButton title="Retry" onPress={loadPuzzle} wide />
    </View>
  );

  if (!puzzleData) return null;

  const gameTitle = mode === 'daily' ? 'Daily Challenge' : mode === 'weekly' ? 'Weekly Challenge' : 'Sequential';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ControlButton title="‹" small onPress={() => navigation.goBack()} />
        <Text style={styles.title}>{gameTitle}</Text>
        <Text style={styles.timer}>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</Text>
      </View>

      {/* Puzzle Grid - Updated with bold borders */}
      <View style={[styles.gridContainer, { width: GRID_SIZE, height: GRID_SIZE }]}>
        {userGrid.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {row.map((cell, c) => {
              const clicked = clickedCell?.row === r && clickedCell?.col === c;
              const sameAnimalSelected = clickedCell && cell && cell !== '❌' && cell === userGrid[clickedCell.row][clickedCell.col];

              let bgColor = 'white';
              if (cell === '❌') bgColor = '#f44336';
              else if (clicked) bgColor = '#006400';
              else if (sameAnimalSelected) bgColor = '#004d00';
              else if (clickedCell && (r === clickedCell.row || c === clickedCell.col)) bgColor = '#90ee90';

              // Determine subgrid boundaries based on grid size
              let isSubgridTop = false;
              let isSubgridBottom = false;
              let isSubgridLeft = false;
              let isSubgridRight = false;

              if (sizeNumber === 6) { // 2x3 subgrids
                isSubgridTop = r % 2 === 0;
                isSubgridBottom = (r + 1) % 2 === 0;
                isSubgridLeft = c % 3 === 0;
                isSubgridRight = (c + 1) % 3 === 0;
              } else if (sizeNumber === 8) { // 2x4 subgrids
                isSubgridTop = r % 2 === 0;
                isSubgridBottom = (r + 1) % 2 === 0;
                isSubgridLeft = c % 4 === 0;
                isSubgridRight = (c + 1) % 4 === 0;
              } else if (sizeNumber === 10) { // 2x5 subgrids
                isSubgridTop = r % 2 === 0;
                isSubgridBottom = (r + 1) % 2 === 0;
                isSubgridLeft = c % 5 === 0;
                isSubgridRight = (c + 1) % 5 === 0;
              } else if (sizeNumber === 12) { // 3x4 subgrids
                isSubgridTop = r % 3 === 0;
                isSubgridBottom = (r + 1) % 3 === 0;
                isSubgridLeft = c % 4 === 0;
                isSubgridRight = (c + 1) % 4 === 0;
              }

              return (
                <TouchableOpacity
                  key={c}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: bgColor,
                    // Outer border - 3px solid black
                    borderTopWidth: r === 0 ? 3 : (isSubgridTop ? 2 : 0.5),
                    borderBottomWidth: r === sizeNumber - 1 ? 3 : (isSubgridBottom ? 2 : 0.5),
                    borderLeftWidth: c === 0 ? 3 : (isSubgridLeft ? 2 : 0.5),
                    borderRightWidth: c === sizeNumber - 1 ? 3 : (isSubgridRight ? 2 : 0.5),
                    // Border colors: black for outer/subgrid, grey for inner
                    borderTopColor: r === 0 || isSubgridTop ? '#000' : '#ccc',
                    borderBottomColor: r === sizeNumber - 1 || isSubgridBottom ? '#000' : '#ccc',
                    borderLeftColor: c === 0 || isSubgridLeft ? '#000' : '#ccc',
                    borderRightColor: c === sizeNumber - 1 || isSubgridRight ? '#000' : '#ccc',
                  }}
                  onPress={() => handleCellPress(r, c)}
                >
                  <Text style={{ fontSize: cellSize / 2 }}>{cell}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Animal Selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>Select Animal</Text>
        <ScrollView horizontal contentContainerStyle={styles.animalScrollContent}>
          {puzzleData.contents.map(a => (
            <TouchableOpacity
              key={a}
              style={{
                width: cellSize,
                height: cellSize,
                marginHorizontal: 5,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: disabledCards.has(a) ? '#ccc' : '#eee',
                borderWidth: 1,
                borderColor: '#999',
                borderRadius: 4,
              }}
              disabled={disabledCards.has(a)}
              onPress={() => handleCardPress(a)}
            >
              <Text style={{ fontSize: cellSize / 2 }}>{a}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <ControlButton title="Reset" onPress={resetGrid} wide />
        <ControlButton title="Undo" onPress={undoMove} wide />
        <HintButton onPress={hintMove} />
        {mode === 'sequential' && <ControlButton title="Next" onPress={nextPuzzle} wide />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  errorText: { marginTop: 8, fontSize: 14, textAlign: 'center', paddingHorizontal: 20, color: 'red' },
  header: { width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold' },
  timer: { fontSize: 16, fontWeight: '600' },
  gridContainer: { backgroundColor: '#ddd', padding: 0 },
  selectorContainer: { marginTop: 10, width: '90%' },
  selectorTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  animalScrollContent: { paddingVertical: 5, justifyContent: 'center', alignItems: 'center' },
  controls: { flexDirection: 'row', marginTop: 15, width: '90%', justifyContent: 'space-between' },
});