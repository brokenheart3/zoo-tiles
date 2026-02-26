// src/screens/PlayScreen.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';
import { useProfile } from '../context/ProfileContext';
import { ThemeContext, themeStyles } from '../context/ThemeContext';
import {
  fetchSequentialPuzzle,
  fetchDailyChallenge,
  fetchWeeklyChallenge,
  PuzzleResponse
} from '../services/api';
import { updateUserChallenge, getUserChallengeResult } from '../services/userService';
import { incrementChallengePlayerCount } from '../services/simpleChallengeService';
import ControlButton from '../components/play/ControlButton';
import HintButton from '../components/play/HintButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { auth } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Mode = 'sequential' | 'daily' | 'weekly';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_PADDING = 20;
const HEADER_HEIGHT = 120;
const AVAILABLE_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - 50;

// Valid grid sizes that exist in the API
const VALID_GRID_SIZES = ['6x6', '8x8', '10x10', '12x12'];

export default function PlayScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { settings } = useSettings();
  const { profile, incrementPuzzlesSolved, refreshProfile, updateProfile } = useProfile();
  const { theme } = React.useContext(ThemeContext);
  const colors = themeStyles[theme];

  // 🔥🔥🔥 MOUNT DEBUG 🔥🔥🔥
  useEffect(() => {
    console.log('🔥🔥🔥 PLAYSCREEN MOUNTED 🔥🔥🔥');
    console.log('Current time:', new Date().toISOString());
    console.log('Profile exists:', !!profile);
    console.log('Current perfectGames:', profile?.stats?.perfectGames);
  }, []);

  // Helper to get week number
  function getWeekNumber(date: Date): string {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return String(Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7));
  }

  // Extract ALL params from navigation
  const params = route.params ?? {};
  const { challengeType, gridSize, difficulty, challengeId } = params;

  console.log('🔍 PlayScreen - Raw params:', JSON.stringify(params, null, 2));
  console.log('🔍 PlayScreen - Settings from context:', JSON.stringify(settings, null, 2));

  // Determine mode from challengeType
  const mode: Mode = challengeType ?? 'sequential';

  // Validate grid size - only allow sizes that exist in API
  const requestedGridSize = gridSize || settings.gridSize || '8x8';
  const effectiveGridSize = VALID_GRID_SIZES.includes(requestedGridSize) 
    ? requestedGridSize 
    : '8x8';
    
  // Use difficulty from params if provided, otherwise from settings
  const effectiveDifficulty = difficulty || settings.difficulty || 'Medium';

  // Log grid size validation
  if (requestedGridSize !== effectiveGridSize) {
    console.log('⚠️ Grid size validation:', { 
      requested: requestedGridSize, 
      effective: effectiveGridSize,
      valid: VALID_GRID_SIZES
    });
  }

  // Get challenge ID for daily/weekly
  const getChallengeId = () => {
    if (mode === 'daily') {
      return challengeId || `daily-${new Date().toISOString().split('T')[0]}`;
    } else if (mode === 'weekly') {
      return challengeId || `weekly-${getWeekNumber(new Date())}`;
    }
    return undefined;
  };

  const currentChallengeId = getChallengeId();

  // Log week number for debugging
  if (mode === 'weekly') {
    console.log('📅 Weekly challenge - Current week number:', getWeekNumber(new Date()));
    console.log('📅 Weekly challenge ID:', currentChallengeId);
  }

  console.log('🔍 PlayScreen - Using:', {
    mode,
    gridSize: effectiveGridSize,
    difficulty: effectiveDifficulty,
    challengeId: currentChallengeId
  });

  const sizeNumber = parseInt(effectiveGridSize);
  const totalCells = sizeNumber * sizeNumber;
  
  // Calculate grid size based on screen dimensions
  const MAX_GRID_SIZE = Math.min(
    SCREEN_WIDTH - GRID_PADDING * 2,
    AVAILABLE_HEIGHT
  );
  const GRID_SIZE = MAX_GRID_SIZE * 0.7;
  const cellSize = GRID_SIZE / sizeNumber;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [puzzleData, setPuzzleData] = useState<PuzzleResponse | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [disabledCards, setDisabledCards] = useState<Set<string>>(new Set());
  const [clickedCell, setClickedCell] = useState<{ row: number; col: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [wrongMoves, setWrongMoves] = useState(0);
  const [history, setHistory] = useState<string[][][]>([]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRunning = useRef(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  // ======================
  // Load puzzle based on mode
  // ======================
  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let puzzle: PuzzleResponse | null = null;

      console.log('🎮 PlayScreen - Calling API with:', {
        mode,
        size: sizeNumber,
        difficulty: effectiveDifficulty
      });

      if (mode === 'daily') {
        puzzle = await fetchDailyChallenge(sizeNumber, effectiveDifficulty);
      } else if (mode === 'weekly') {
        puzzle = await fetchWeeklyChallenge(sizeNumber, effectiveDifficulty);
      } else {
        puzzle = await fetchSequentialPuzzle(sizeNumber, effectiveDifficulty);
      }

      if (!puzzle) throw new Error(`No puzzle returned for mode: ${mode}`);

      setPuzzleData(puzzle);
      setUserGrid(puzzle.puzzle.map(r => [...r]));
      setDisabledCards(new Set());
      setHistory([]);
      setMoves(0);
      setCorrectMoves(0);
      setWrongMoves(0);
      setClickedCell(null);
      setTimer(0);
      setGameCompleted(false);
      timerRunning.current = false;
      if (timerRef.current) clearInterval(timerRef.current);

      console.log('✅ Loaded puzzle:', puzzle.id, 'with difficulty:', puzzle.difficulty);

    } catch (err) {
      console.error('❌ Failed to load puzzle:', err);
      setError(`Failed to load puzzle. Check console.`);
    } finally {
      setLoading(false);
    }
  }, [mode, sizeNumber, effectiveDifficulty]);

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
      const isFocused = navigation.isFocused();
      
      if (isFocused) {
        const { challengeType } = route.params ?? {};
        if (challengeType) {
          navigation.setParams({ challengeType: undefined });
        } else {
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
  // Navigate to results
  // ======================
  const goToResults = (timeInSeconds: number, isPerfect: boolean, accuracy: number) => {
    if (mode === 'daily' || mode === 'weekly') {
      // For challenges, go to challenge results
      navigation.replace('ChallengeResults', {
        challengeId: currentChallengeId,
        challengeType: mode,
        time: timeInSeconds,
        isPerfect,
        moves,
        correctMoves,
        wrongMoves,
        accuracy,
        completed: true,
      });
    } else {
      // For sequential, go to game results
      navigation.replace('GameResults', {
        time: timeInSeconds,
        isPerfect,
        mode,
        difficulty: effectiveDifficulty,
        gridSize: effectiveGridSize,
        moves,
        correctMoves,
        wrongMoves,
        accuracy,
      });
    }
  };

  // ======================
  // Save challenge result
  // ======================
  const saveChallengeResult = async (timeInSeconds: number, isPerfect: boolean, accuracy: number) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('⚠️ No user logged in - challenge result not saved');
        return;
      }
      
      if (!currentChallengeId) {
        console.log('⚠️ No challenge ID - result not saved');
        return;
      }

      console.log('💾 SAVING CHALLENGE RESULT:', {
        uid: user.uid,
        email: user.email,
        challengeId: currentChallengeId,
        mode: mode,
        time: timeInSeconds,
        moves,
        correctMoves,
        wrongMoves,
        accuracy,
        isPerfect
      });

      await updateUserChallenge(
        user.uid,
        currentChallengeId,
        true,
        timeInSeconds,
        moves,
        isPerfect,
        correctMoves,
        wrongMoves,
        accuracy
      );

      console.log('✅ Challenge result saved successfully');
      
    } catch (error) {
      console.error('❌ Failed to save challenge result:', error);
    }
  };

  // ======================
  // Calculate accuracy
  // ======================
  const calculateAccuracy = () => {
    if (moves === 0) return 0;
    return (correctMoves / moves) * 100;
  };

  // ======================
  // Cell & Card Handlers
  // ======================
  const handleCellPress = (row: number, col: number) => {
    if (gameCompleted) return;
    setClickedCell({ row, col });
    startTimer();
  };

  const handleCardPress = async (animal: string) => {
    if (!clickedCell || !puzzleData || disabledCards.has(animal) || gameCompleted) return;

    const { row, col } = clickedCell;
    const newGrid = userGrid.map(r => [...r]);
    const isWrong = puzzleData.solution[row][col] !== animal;

    if (isWrong) {
      newGrid[row][col] = '❌';
      setUserGrid(newGrid);
      setWrongMoves(prev => prev + 1);
      setTimeout(() => setUserGrid(userGrid.map(r => [...r])), 500);
    } else {
      newGrid[row][col] = animal;
      setUserGrid(newGrid);
      setCorrectMoves(prev => prev + 1);

      const newDisabledCards = new Set(disabledCards);
      
      puzzleData.contents.forEach(animalType => {
        const remainingForThisAnimal = newGrid.flat().filter((cell, idx) => {
          const r = Math.floor(idx / sizeNumber);
          const c = idx % sizeNumber;
          return puzzleData.solution[r][c] === animalType && newGrid[r][c] !== animalType;
        });

        if (remainingForThisAnimal.length === 0) {
          newDisabledCards.add(animalType);
        } else {
          newDisabledCards.delete(animalType);
        }
      });

      setDisabledCards(newDisabledCards);

      const solved = newGrid.every((row, r) => row.every((cell, c) => cell === puzzleData.solution[r][c]));
      
      if (solved) {
        stopTimer();
        setGameCompleted(true);
        
        const accuracy = calculateAccuracy();
        const isPerfect = wrongMoves === 0; // SIMPLIFIED: if no wrong moves at all
        const isWeekend = [0, 6].includes(new Date().getDay());
        
        console.log('🎯 GAME COMPLETED - isPerfect:', isPerfect, 'wrongMoves:', wrongMoves);

        // ======================
        // DIRECT PERFECT GAME HANDLING - NO COMPLEX LOGIC
        // ======================
        if (isPerfect) {
          try {
            console.log('✨ PERFECT GAME ACHIEVED! Current perfectGames:', profile?.stats?.perfectGames);
            
            // Get current profile
            const currentProfile = profile;
            if (currentProfile) {
              const newPerfectGames = (currentProfile.stats.perfectGames || 0) + 1;
              
              // Create updated profile
              const updatedProfile = {
                ...currentProfile,
                stats: {
                  ...currentProfile.stats,
                  perfectGames: newPerfectGames
                }
              };
              
              // Save to AsyncStorage
              await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
              console.log('✅ Saved to AsyncStorage, new perfectGames:', newPerfectGames);
              
              // Force refresh
              await refreshProfile();
              
              // Show success
              Alert.alert('✨ Perfect Game!', `Perfect games: ${newPerfectGames}`);
            }
          } catch (error) {
            console.error('❌ Error saving perfect game:', error);
          }
        } else {
          Alert.alert('🎉 Game Completed!', `Not perfect - wrong moves: ${wrongMoves}`);
        }

        // Also call the original function for other stats
        if (profile) {
          const isDaily = mode === 'daily';
          const isWeekly = mode === 'weekly';
          
          await incrementPuzzlesSolved(
            timer,
            moves,
            correctMoves,
            wrongMoves,
            isPerfect,
            isWeekend,
            isDaily,
            isWeekly
          );
        }
        
        if (mode !== 'sequential') {
          await saveChallengeResult(timer, isPerfect, accuracy);
          await incrementChallengePlayerCount(mode);
        }
      }
    }

    setHistory(h => [...h, userGrid.map(r => [...r])]);
    setMoves(m => m + 1);
    setClickedCell(null);
  };

  // ======================
  // Reset, Hint, Undo
  // ======================
  const resetGrid = () => {
    if (!puzzleData) return;
    setUserGrid(puzzleData.puzzle.map(r => [...r]));
    setMoves(0);
    setCorrectMoves(0);
    setWrongMoves(0);
    setHistory([]);
    setClickedCell(null);
    setTimer(0);
    setDisabledCards(new Set());
    setGameCompleted(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRunning.current = false;
  };

  const hintMove = () => {
    if (!puzzleData || gameCompleted) return;
    for (let r = 0; r < sizeNumber; r++) {
      for (let c = 0; c < sizeNumber; c++) {
        if (userGrid[r][c] !== puzzleData.solution[r][c]) {
          const newGrid = userGrid.map(row => [...row]);
          newGrid[r][c] = puzzleData.solution[r][c];
          setHistory(h => [...h, userGrid.map(row => [...row])]);
          setUserGrid(newGrid);
          setMoves(m => m + 1);
          setCorrectMoves(prev => prev + 1);
          return;
        }
      }
    }
  };

  const undoMove = () => {
    if (history.length === 0 || gameCompleted) return;
    const prev = history[history.length - 1];
    setUserGrid(prev.map(r => [...r]));
    setHistory(h => h.slice(0, -1));
    setMoves(m => Math.max(0, m - 1));
  };

  const nextPuzzle = async () => {
    if (mode === 'sequential' && !gameCompleted) await loadPuzzle();
  };

  // ======================
  // Render
  // ======================
  if (loading) return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.button} />
      <Text style={[styles.loadingText, { color: colors.text }]}>Loading puzzle…</Text>
    </View>
  );

  if (error) return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
      <ControlButton title="Retry" onPress={loadPuzzle} wide />
    </View>
  );

  if (!puzzleData) return null;

  const gameTitle = mode === 'daily' ? 'Daily Challenge' : mode === 'weekly' ? 'Weekly Challenge' : 'Sequential';
  const currentAccuracy = calculateAccuracy();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ControlButton title="‹" small onPress={() => navigation.goBack()} />
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {gameTitle}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text + '80' }]}>
            {effectiveGridSize} • {effectiveDifficulty}
          </Text>
        </View>
        <Text style={[styles.timer, { color: colors.text }]}>
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </Text>
      </View>

      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.button + '20' }]}>
        <Text style={[styles.statText, { color: colors.text }]}>Moves: {moves}</Text>
        <Text style={[styles.statText, { color: colors.text }]}>
          Acc: {currentAccuracy.toFixed(1)}%
        </Text>
        <Text style={[styles.statText, { color: '#4CAF50' }]}>✓ {correctMoves}</Text>
        <Text style={[styles.statText, { color: '#f44336' }]}>✗ {wrongMoves}</Text>
      </View>

      {/* Main content area with grid and selector */}
      <View style={styles.mainContent}>
        {/* Puzzle Grid */}
        <View style={styles.gridWrapper}>
          <View style={[styles.gridContainer, { width: GRID_SIZE, height: GRID_SIZE, backgroundColor: '#FFFFFF' }]}>
            {userGrid.map((row, r) => (
              <View key={r} style={{ flexDirection: 'row' }}>
                {row.map((cell, c) => {
                  const clicked = clickedCell?.row === r && clickedCell?.col === c;
                  const sameAnimalSelected = clickedCell && cell && cell !== '❌' && cell === userGrid[clickedCell.row][clickedCell.col];

                  let bgColor = '#FFFFFF';
                  if (cell === '❌') bgColor = '#f44336';
                  else if (clicked) bgColor = colors.button;
                  else if (sameAnimalSelected) bgColor = colors.button + '80';
                  else if (clickedCell && (r === clickedCell.row || c === clickedCell.col)) bgColor = colors.button + '20';

                  let isSubgridTop = false;
                  let isSubgridBottom = false;
                  let isSubgridLeft = false;
                  let isSubgridRight = false;

                  if (sizeNumber === 6) {
                    isSubgridTop = r % 2 === 0;
                    isSubgridBottom = (r + 1) % 2 === 0;
                    isSubgridLeft = c % 3 === 0;
                    isSubgridRight = (c + 1) % 3 === 0;
                  } else if (sizeNumber === 8) {
                    isSubgridTop = r % 2 === 0;
                    isSubgridBottom = (r + 1) % 2 === 0;
                    isSubgridLeft = c % 4 === 0;
                    isSubgridRight = (c + 1) % 4 === 0;
                  } else if (sizeNumber === 10) {
                    isSubgridTop = r % 2 === 0;
                    isSubgridBottom = (r + 1) % 2 === 0;
                    isSubgridLeft = c % 5 === 0;
                    isSubgridRight = (c + 1) % 5 === 0;
                  } else if (sizeNumber === 12) {
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
                        borderTopWidth: r === 0 ? 3 : (isSubgridTop ? 2 : 0.5),
                        borderBottomWidth: r === sizeNumber - 1 ? 3 : (isSubgridBottom ? 2 : 0.5),
                        borderLeftWidth: c === 0 ? 3 : (isSubgridLeft ? 2 : 0.5),
                        borderRightWidth: c === sizeNumber - 1 ? 3 : (isSubgridRight ? 2 : 0.5),
                        borderTopColor: r === 0 || isSubgridTop ? '#000000' : colors.border,
                        borderBottomColor: r === sizeNumber - 1 || isSubgridBottom ? '#000000' : colors.border,
                        borderLeftColor: c === 0 || isSubgridLeft ? '#000000' : colors.border,
                        borderRightColor: c === sizeNumber - 1 || isSubgridRight ? '#000000' : colors.border,
                        zIndex: 2,
                      }}
                      onPress={() => handleCellPress(r, c)}
                      disabled={gameCompleted}
                    >
                      <Text style={{ fontSize: cellSize / 2, color: colors.text }}>{cell}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Animal Selector */}
        <View style={[styles.selectorContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Text style={[styles.selectorTitle, { color: colors.text }]}>Select Animal</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.animalScrollContent}
          >
            {puzzleData.contents.map(a => (
              <TouchableOpacity
                key={a}
                style={[
                  styles.animalButton,
                  {
                    width: cellSize * 0.9,
                    height: cellSize * 0.9,
                    backgroundColor: disabledCards.has(a) ? '#ccc' : colors.card,
                    borderColor: colors.border,
                    opacity: disabledCards.has(a) ? 0.5 : 1,
                  }
                ]}
                disabled={disabledCards.has(a) || gameCompleted}
                onPress={() => handleCardPress(a)}
              >
                <Text style={[styles.animalText, { fontSize: cellSize / 2.2, color: colors.text }]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <ControlButton title="Reset" onPress={resetGrid} />
        <ControlButton title="Undo" onPress={undoMove} />
        <HintButton onPress={hintMove} />
        {mode === 'sequential' && <ControlButton title="Next" onPress={nextPuzzle} />}
      </View>

      {/* Show View Results button if game completed */}
      {gameCompleted && (
        <View style={styles.resultsButtonContainer}>
          <TouchableOpacity
            style={[styles.resultsButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => goToResults(timer, wrongMoves === 0, calculateAccuracy())}
          >
            <Text style={styles.resultsButtonText}>VIEW RESULTS</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  errorText: { 
    marginTop: 8, 
    fontSize: 14, 
    textAlign: 'center', 
    paddingHorizontal: 20 
  },
  header: { 
    width: '100%',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  timer: { 
    fontSize: 16, 
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  statsBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 5,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  gridContainer: { 
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectorContainer: { 
    width: '100%',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  selectorTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  animalScrollContent: { 
    paddingHorizontal: 15,
    alignItems: 'center',
    gap: 8,
  },
  animalButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginHorizontal: 4,
  },
  animalText: {
    fontWeight: '500',
  },
  controls: { 
    flexDirection: 'row', 
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: '100%',
    justifyContent: 'space-around',
    borderTopWidth: 1,
  },
  resultsButtonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  resultsButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  resultsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});