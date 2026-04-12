// src/screens/PlayScreen.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';
import { useProfile } from '../context/ProfileContext';
import { useGameMode } from '../context/GameModeContext';
import { ThemeContext, themeStyles } from '../context/ThemeContext';
import {
  fetchSequentialPuzzle,
  fetchDailyChallenge,
  fetchWeeklyChallenge,
  PuzzleResponse,
  Category
} from '../services/api';
import { updateUserChallenge, getUserChallengeResult, getPlayerRank } from '../services/userService';
import { incrementChallengePlayerCount } from '../services/simpleChallengeService';
import ControlButton from '../components/play/ControlButton';
import HintButton from '../components/play/HintButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getCategoryDisplayName } from '../utils/categoryHelpers';
import { getUTCDateString, getWeekNumber } from '../utils/timeUtils';
import { ChallengeCategory } from '../types/challenge';

type Mode = 'sequential' | 'daily' | 'weekly';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_PADDING = 20;
const HEADER_HEIGHT = 120;
const AVAILABLE_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - 50;

const VALID_GRID_SIZES = ['5x5', '6x6', '7x7', '8x8', '9x9', '10x10', '11x11', '12x12', '16x16'];

export default function PlayScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { settings } = useSettings();
  const { profile, incrementPuzzlesSolved, refreshProfile } = useProfile();
  const { markChallengeCompleted, refreshChallengeStatus } = useGameMode();
  const { theme } = React.useContext(ThemeContext);
  const colors = themeStyles[theme];

  const getSubgridDimensions = (size: number) => {
    if (size === 5) return { rows: 1, cols: 5 };
    if (size === 6) return { rows: 2, cols: 3 };
    if (size === 7) return { rows: 1, cols: 7 };
    if (size === 8) return { rows: 2, cols: 4 };
    if (size === 9) return { rows: 3, cols: 3 };
    if (size === 10) return { rows: 2, cols: 5 };
    if (size === 11) return { rows: 1, cols: 11 };
    if (size === 12) return { rows: 3, cols: 4 };
    if (size === 16) return { rows: 4, cols: 4 };
    
    const sqrt = Math.sqrt(size);
    const rows = Math.floor(sqrt);
    const cols = Math.ceil(size / rows);
    return { rows, cols };
  };

  const params = route.params ?? {};
  const { challengeType, gridSize, difficulty, challengeId, category: routeCategory } = params;

  const mode: Mode = challengeType ?? 'sequential';
  const selectedCategory: Category = routeCategory || (settings as any).category || 'animals';

  const requestedGridSize = gridSize || settings.gridSize || '8x8';
  const effectiveGridSize = VALID_GRID_SIZES.includes(requestedGridSize) 
    ? requestedGridSize 
    : '8x8';
    
  const effectiveDifficulty = difficulty || settings.difficulty || 'Medium';

  const getChallengeId = () => {
    if (mode === 'daily') {
      return challengeId || `daily-${getUTCDateString()}-${selectedCategory}`;
    } else if (mode === 'weekly') {
      return challengeId || `weekly-${getWeekNumber(new Date())}-${selectedCategory}`;
    }
    return undefined;
  };

  const currentChallengeId = getChallengeId();
  const sizeNumber = parseInt(effectiveGridSize);
  
  const MAX_GRID_SIZE = Math.min(SCREEN_WIDTH - GRID_PADDING * 2, AVAILABLE_HEIGHT);
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
  const timerRef = useRef<number | null>(null);
  const timerRunning = useRef(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [hasSavedResult, setHasSavedResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rankAchieved, setRankAchieved] = useState<number | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Save challenge result with position tracking
  const saveChallengeResult = async (timeInSeconds: number, isPerfect: boolean, accuracy: number) => {
    if (isSaving) return false;
    
    try {
      const user = auth.currentUser;
      if (!user || !currentChallengeId) {
        console.log('❌ Cannot save: No user or challenge ID');
        return false;
      }

      setIsSaving(true);
      console.log('💾 SAVING CHALLENGE RESULT:', { 
        challengeId: currentChallengeId, 
        time: timeInSeconds,
        mode,
        category: selectedCategory,
        moves,
        correctMoves,
        wrongMoves,
        isPerfect
      });

      // Save the challenge result
      const saveResult = await updateUserChallenge(
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

      if (!saveResult) {
        console.error('❌ Failed to save challenge result');
        return false;
      }

      console.log('✅ Challenge result saved successfully');

      // Get user's rank for this challenge
      const rank = await getPlayerRank(currentChallengeId, user.uid);
      console.log('🏆 User rank for this challenge:', rank);
      setRankAchieved(rank);

      // Update position stats based on rank
      if (rank === 1 || rank === 2 || rank === 3) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const currentStats = userDoc.data()?.stats || {};
        
        const updateData: any = {};
        
        // Overall position counts
        if (rank === 1) {
          updateData['stats.firstPlaceWins'] = (currentStats.firstPlaceWins || 0) + 1;
          console.log('🥇 FIRST PLACE! Total first place wins:', (currentStats.firstPlaceWins || 0) + 1);
        } else if (rank === 2) {
          updateData['stats.secondPlaceWins'] = (currentStats.secondPlaceWins || 0) + 1;
          console.log('🥈 SECOND PLACE! Total second place wins:', (currentStats.secondPlaceWins || 0) + 1);
        } else if (rank === 3) {
          updateData['stats.thirdPlaceWins'] = (currentStats.thirdPlaceWins || 0) + 1;
          console.log('🥉 THIRD PLACE! Total third place wins:', (currentStats.thirdPlaceWins || 0) + 1);
        }
        
        // Challenge-specific position counts
        if (mode === 'daily') {
          if (rank === 1) updateData['stats.dailyFirstPlace'] = (currentStats.dailyFirstPlace || 0) + 1;
          if (rank === 2) updateData['stats.dailySecondPlace'] = (currentStats.dailySecondPlace || 0) + 1;
          if (rank === 3) updateData['stats.dailyThirdPlace'] = (currentStats.dailyThirdPlace || 0) + 1;
          console.log(`📅 Daily challenge ${rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'} place recorded`);
        } else if (mode === 'weekly') {
          if (rank === 1) updateData['stats.weeklyFirstPlace'] = (currentStats.weeklyFirstPlace || 0) + 1;
          if (rank === 2) updateData['stats.weeklySecondPlace'] = (currentStats.weeklySecondPlace || 0) + 1;
          if (rank === 3) updateData['stats.weeklyThirdPlace'] = (currentStats.weeklyThirdPlace || 0) + 1;
          console.log(`📆 Weekly challenge ${rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'} place recorded`);
        }
        
        if (Object.keys(updateData).length > 0) {
          await updateDoc(userRef, updateData);
          console.log('✅ Position stats updated successfully!');
          
          // Refresh profile to show updated stats
          await refreshProfile();
        }
      }

      return true;
      
    } catch (error) {
      console.error('❌ Failed to save challenge result:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if challenge already completed before loading
      if (mode !== 'sequential') {
        const user = auth.currentUser;
        if (user && currentChallengeId) {
          console.log('🔍 Checking if challenge already completed:', currentChallengeId);
          const existingResult = await getUserChallengeResult(user.uid, currentChallengeId);
          
          console.log('📊 Existing result:', existingResult);
          
          if (existingResult && existingResult.completed === true) {
            console.log('🔒 Challenge already completed! Redirecting to results...');
            navigation.replace('ChallengeResults', {
              challengeId: currentChallengeId,
              challengeType: mode,
              time: existingResult.bestTime || existingResult.time,
              isPerfect: existingResult.isPerfect,
              moves: existingResult.moves,
              correctMoves: existingResult.correctMoves,
              wrongMoves: existingResult.wrongMoves,
              accuracy: existingResult.accuracy,
              completed: true,
              category: selectedCategory,
            });
            return;
          }
        }
      }

      let puzzle: PuzzleResponse | null = null;

      if (mode === 'daily') {
        console.log('📅 Fetching daily challenge for:', selectedCategory);
        puzzle = await fetchDailyChallenge(selectedCategory, sizeNumber);
      } else if (mode === 'weekly') {
        console.log('📆 Fetching weekly challenge for:', selectedCategory);
        puzzle = await fetchWeeklyChallenge(selectedCategory, sizeNumber);
      } else {
        console.log('🎮 Fetching sequential puzzle for:', selectedCategory);
        puzzle = await fetchSequentialPuzzle(selectedCategory, sizeNumber, effectiveDifficulty);
      }

      if (!puzzle) {
        throw new Error(`No puzzle available for ${getCategoryDisplayName(selectedCategory)} category.`);
      }

      console.log('✅ Loaded puzzle:', puzzle.id);
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
      setHasSavedResult(false);
      setIsSaving(false);
      setRankAchieved(null);
      timerRunning.current = false;
      if (timerRef.current) clearInterval(timerRef.current);

    } catch (err: any) {
      console.error('❌ Failed to load puzzle:', err);
      setError(err.message || 'Failed to load puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mode, selectedCategory, sizeNumber, effectiveDifficulty, currentChallengeId, navigation]);

  useEffect(() => {
    loadPuzzle();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRunning.current = false;
    };
  }, [loadPuzzle]);

  const startTimer = () => {
    if (!timerRunning.current && !gameCompleted) {
      timerRunning.current = true;
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000) as unknown as number;
    }
  };

  const stopTimer = () => {
    if (timerRunning.current && timerRef.current) {
      clearInterval(timerRef.current);
      timerRunning.current = false;
    }
  };

  const calculateAccuracy = () => {
    if (moves === 0) return 0;
    return (correctMoves / moves) * 100;
  };

  const handleCellPress = (row: number, col: number) => {
    if (gameCompleted) return;
    setClickedCell({ row, col });
    startTimer();
  };

  const handleCardPress = async (item: string) => {
    if (!clickedCell || !puzzleData || disabledCards.has(item) || gameCompleted) return;

    const { row, col } = clickedCell;
    const newGrid = userGrid.map(r => [...r]);
    const isWrong = puzzleData.solution[row][col] !== item;

    if (isWrong) {
      newGrid[row][col] = '❌';
      setUserGrid(newGrid);
      setWrongMoves(prev => prev + 1);
      setTimeout(() => setUserGrid(userGrid.map(r => [...r])), 500);
    } else {
      newGrid[row][col] = item;
      setUserGrid(newGrid);
      setCorrectMoves(prev => prev + 1);

      const newDisabledCards = new Set(disabledCards);
      
      puzzleData.contents.forEach(itemType => {
        const remainingForThisItem = newGrid.flat().filter((cell, idx) => {
          const r = Math.floor(idx / sizeNumber);
          const c = idx % sizeNumber;
          return puzzleData.solution[r][c] === itemType && newGrid[r][c] !== itemType;
        });

        if (remainingForThisItem.length === 0) {
          newDisabledCards.add(itemType);
        } else {
          newDisabledCards.delete(itemType);
        }
      });

      setDisabledCards(newDisabledCards);

      const solved = newGrid.every((row, r) => row.every((cell, c) => cell === puzzleData.solution[r][c]));
      
      if (solved && !hasSavedResult && !isSaving) {
        setHasSavedResult(true);
        stopTimer();
        
        const accuracy = calculateAccuracy();
        const isPerfect = wrongMoves === 0;
        const isWeekend = [0, 6].includes(new Date().getDay());
        
        console.log('🎯 GAME COMPLETED - Time:', timer, 'Perfect:', isPerfect, 'Mode:', mode);

        Alert.alert('🎉 Challenge Completed!', `You solved the puzzle!\nTime: ${formatTime(timer)}`);

        // Update stats
        if (profile) {
          await incrementPuzzlesSolved(timer, moves, correctMoves, wrongMoves, isPerfect, isWeekend, mode === 'daily', mode === 'weekly');
          await refreshProfile();
        }
        
        // For challenges - save completion to prevent replay
        if (mode !== 'sequential') {
          const saved = await saveChallengeResult(timer, isPerfect, accuracy);
          
          if (saved) {
            console.log('✅ Challenge marked as completed - cannot be played again');
            
            // Update the context
            markChallengeCompleted(mode, {
              bestTime: timer,
              isPerfect: isPerfect,
              moves,
              correctMoves,
              wrongMoves,
              accuracy,
              completed: true,
              completedAt: new Date().toISOString()
            }, selectedCategory);
            
            // Refresh challenge status
            await refreshChallengeStatus(selectedCategory);
            
            // Increment player count
            await incrementChallengePlayerCount(mode, selectedCategory);
          } else {
            console.error('❌ Failed to save challenge completion');
          }
        }
        
        setGameCompleted(true);
        
        // Navigate to results after delay
        setTimeout(() => {
          if (mode === 'daily' || mode === 'weekly') {
            navigation.replace('ChallengeResults', {
              challengeId: currentChallengeId,
              challengeType: mode,
              time: timer,
              isPerfect: isPerfect,
              moves,
              correctMoves,
              wrongMoves,
              accuracy,
              completed: true,
              category: selectedCategory,
              rank: rankAchieved,
            });
          } else {
            navigation.replace('GameResults', {
              time: timer,
              isPerfect,
              mode,
              difficulty: effectiveDifficulty,
              gridSize: effectiveGridSize,
              category: selectedCategory,
              moves,
              correctMoves,
              wrongMoves,
              accuracy,
            });
          }
        }, 1500);
      }
    }

    setHistory(h => [...h, userGrid.map(r => [...r])]);
    setMoves(m => m + 1);
    setClickedCell(null);
  };

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
    setHasSavedResult(false);
    setIsSaving(false);
    setRankAchieved(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRunning.current = false;
  };

  const hintMove = () => {
    if (!puzzleData || gameCompleted) return;
    
    const incorrectCells: { row: number; col: number }[] = [];
    for (let r = 0; r < sizeNumber; r++) {
      for (let c = 0; c < sizeNumber; c++) {
        if (userGrid[r][c] !== puzzleData.solution[r][c]) {
          incorrectCells.push({ row: r, col: c });
        }
      }
    }
    
    if (incorrectCells.length === 0) {
      Alert.alert('Hint', 'No hints available! The puzzle is complete!');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * incorrectCells.length);
    const { row, col } = incorrectCells[randomIndex];
    
    const newGrid = userGrid.map(rowArr => [...rowArr]);
    newGrid[row][col] = puzzleData.solution[row][col];
    setHistory(h => [...h, userGrid.map(rowArr => [...rowArr])]);
    setUserGrid(newGrid);
    setMoves(m => m + 1);
    setCorrectMoves(prev => prev + 1);
    startTimer();
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

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.button} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading {getCategoryDisplayName(selectedCategory)} puzzle...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <View style={styles.errorButtons}>
          <ControlButton title="Go Back" onPress={() => navigation.goBack()} wide />
          <View style={{ height: 10 }} />
          <ControlButton title="Try Again" onPress={loadPuzzle} wide />
        </View>
      </View>
    );
  }

  if (!puzzleData) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          No puzzle data available for {getCategoryDisplayName(selectedCategory)}.
        </Text>
        <View style={styles.errorButtons}>
          <ControlButton title="Go Back" onPress={() => navigation.goBack()} wide />
          <View style={{ height: 10 }} />
          <ControlButton title="Change Category" onPress={() => navigation.navigate('Settings')} wide />
        </View>
      </View>
    );
  }

  const gameTitle = mode === 'daily' 
    ? `Daily ${getCategoryDisplayName(selectedCategory)} Challenge` 
    : mode === 'weekly' 
    ? `Weekly ${getCategoryDisplayName(selectedCategory)} Challenge` 
    : `${getCategoryDisplayName(selectedCategory)} Puzzle`;
    
  const currentAccuracy = calculateAccuracy();
  const subgridDims = getSubgridDimensions(sizeNumber);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ControlButton title="‹" small onPress={() => navigation.goBack()} />
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{gameTitle}</Text>
          <Text style={[styles.subtitle, { color: colors.text + '80' }]}>{effectiveGridSize} • {effectiveDifficulty}</Text>
        </View>
        <Text style={[styles.timer, { color: colors.text }]}>
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </Text>
      </View>

      <View style={[styles.statsBar, { backgroundColor: colors.button + '20' }]}>
        <Text style={[styles.statText, { color: colors.text }]}>Moves: {moves}</Text>
        <Text style={[styles.statText, { color: colors.text }]}>Acc: {currentAccuracy.toFixed(1)}%</Text>
        <Text style={[styles.statText, { color: '#4CAF50' }]}>✓ {correctMoves}</Text>
        <Text style={[styles.statText, { color: '#f44336' }]}>✗ {wrongMoves}</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.gridWrapper}>
          <View style={[styles.gridContainer, { width: GRID_SIZE, height: GRID_SIZE, backgroundColor: '#FFFFFF' }]}>
            {userGrid.map((row, r) => (
              <View key={r} style={{ flexDirection: 'row' }}>
                {row.map((cell, c) => {
                  const clicked = clickedCell?.row === r && clickedCell?.col === c;
                  const sameItemSelected = clickedCell && cell && cell !== '❌' && cell === userGrid[clickedCell.row][clickedCell.col];

                  let bgColor = '#FFFFFF';
                  if (cell === '❌') bgColor = '#f44336';
                  else if (clicked) bgColor = colors.button;
                  else if (sameItemSelected) bgColor = colors.button + '80';
                  else if (clickedCell && (r === clickedCell.row || c === clickedCell.col)) bgColor = colors.button + '20';

                  const isSubgridTop = r > 0 && r % subgridDims.rows === 0;
                  const isSubgridBottom = r === sizeNumber - 1 || (r + 1) % subgridDims.rows === 0;
                  const isSubgridLeft = c > 0 && c % subgridDims.cols === 0;
                  const isSubgridRight = c === sizeNumber - 1 || (c + 1) % subgridDims.cols === 0;

                  const borderTopWidth = r === 0 ? 3 : (isSubgridTop ? 2 : 0.5);
                  const borderBottomWidth = r === sizeNumber - 1 ? 3 : (isSubgridBottom ? 2 : 0.5);
                  const borderLeftWidth = c === 0 ? 3 : (isSubgridLeft ? 2 : 0.5);
                  const borderRightWidth = c === sizeNumber - 1 ? 3 : (isSubgridRight ? 2 : 0.5);

                  return (
                    <TouchableOpacity
                      key={c}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: bgColor,
                        borderTopWidth,
                        borderBottomWidth,
                        borderLeftWidth,
                        borderRightWidth,
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

        <View style={[styles.selectorContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Text style={[styles.selectorTitle, { color: colors.text }]}>Select {getCategoryDisplayName(selectedCategory)} Card</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.itemScrollContent}>
            {puzzleData.contents.map(item => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.itemButton,
                  {
                    width: cellSize * 0.9,
                    height: cellSize * 0.9,
                    backgroundColor: disabledCards.has(item) ? '#ccc' : colors.card,
                    borderColor: colors.border,
                    opacity: disabledCards.has(item) ? 0.5 : 1,
                  }
                ]}
                disabled={disabledCards.has(item) || gameCompleted}
                onPress={() => handleCardPress(item)}
              >
                <Text style={[styles.itemText, { fontSize: cellSize / 2.2, color: colors.text }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={[styles.controls, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <ControlButton title="Reset" onPress={resetGrid} />
        <ControlButton title="Undo" onPress={undoMove} />
        <HintButton onPress={hintMove} />
        {mode === 'sequential' && <ControlButton title="Next" onPress={nextPuzzle} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  mainContent: { flex: 1, width: '100%', justifyContent: 'space-between' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  errorButtons: { width: '100%', maxWidth: 300 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1 },
  titleContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 12, marginTop: 2, textAlign: 'center' },
  timer: { fontSize: 16, fontWeight: '600', minWidth: 60, textAlign: 'right' },
  statsBar: { width: '100%', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, paddingHorizontal: 15, marginTop: 5 },
  statText: { fontSize: 14, fontWeight: '600' },
  gridWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  gridContainer: { padding: 0, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  selectorContainer: { width: '100%', paddingVertical: 10, borderTopWidth: 1 },
  selectorTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  itemScrollContent: { paddingHorizontal: 15, alignItems: 'center', gap: 8 },
  itemButton: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, marginHorizontal: 4 },
  itemText: { fontWeight: '500' },
  controls: { flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 10, width: '100%', justifyContent: 'space-around', borderTopWidth: 1 },
});