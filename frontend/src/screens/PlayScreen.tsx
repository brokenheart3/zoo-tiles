import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ThemeContext, themeStyles } from '../context/ThemeContext';
import { getDailyPuzzle, getWeeklyPuzzle, getSequentialPuzzle } from '../services/api';

// Define the route params type
type RootStackParamList = {
  Play: {
    gridSize: string;
    difficulty: string;
    challengeType?: 'daily' | 'weekly';
    challengeId?: string;
  };
};

type PlayScreenRouteProp = RouteProp<RootStackParamList, 'Play'>;

// Get screen dimensions for responsive sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PlayScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PlayScreenRouteProp>();
  const { theme } = useContext(ThemeContext);
  const colors = themeStyles[theme];
  
  // Get params
  const params = route.params;
  const gridSizeParam = params?.gridSize || '6x6';
  const difficultyParam = params?.difficulty || 'Medium';
  const challengeType = params?.challengeType;
  const challengeId = params?.challengeId;
  
  const gridSize = parseInt(gridSizeParam.split('x')[0]) || 6;
  
  // State
  const [loading, setLoading] = useState(true);
  const [puzzle, setPuzzle] = useState<string[][]>([]);
  const [solution, setSolution] = useState<string[][]>([]);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [animalOptions, setAnimalOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate fixed grid size that fits on screen
  const getFixedGridDimensions = () => {
    // Reserve space for header, animal selector, and controls
    const headerHeight = 80;
    const animalSelectorHeight = 120;
    const controlsHeight = 80;
    const padding = 40;
    
    const availableHeight = screenHeight - headerHeight - animalSelectorHeight - controlsHeight - padding;
    const availableWidth = screenWidth - 40; // 20 padding on each side
    
    // Use the smaller dimension to ensure grid fits
    const maxGridSize = Math.min(availableHeight, availableWidth);
    
    return {
      containerSize: maxGridSize,
      cellSize: Math.floor(maxGridSize / gridSize)
    };
  };
  
  const { containerSize, cellSize } = getFixedGridDimensions();
  
  // Fetch puzzle from API
  useEffect(() => {
    fetchPuzzle();
  }, [gridSize, difficultyParam, challengeId]);
  
  const fetchPuzzle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let apiResponse;
      
      // Determine which API endpoint to call
      if (challengeType === 'daily') {
        // Fetch daily puzzle for the specified grid size
        apiResponse = await getDailyPuzzle(gridSize);
      } else if (challengeType === 'weekly') {
        // Fetch weekly puzzle for the specified grid size
        apiResponse = await getWeeklyPuzzle(gridSize);
      } else {
        // Fetch sequential puzzle by difficulty for the specified grid size
        const difficulty = difficultyParam.toLowerCase() as 'easy' | 'medium' | 'hard' | 'expert';
        apiResponse = await getSequentialPuzzle(gridSize, difficulty);
      }
      
      if (!apiResponse || !apiResponse.puzzle) {
        throw new Error('No puzzle data received from API');
      }
      
      const puzzleData = apiResponse.puzzle;
      
      // Validate the puzzle data
      if (!Array.isArray(puzzleData.puzzle) || !Array.isArray(puzzleData.solution)) {
        throw new Error('Invalid puzzle data structure');
      }
      
      // Set the puzzle data
      setPuzzle(puzzleData.puzzle);
      setSolution(puzzleData.solution);
      setAnimalOptions(puzzleData.contents || getDefaultAnimals(gridSize));
      
      // Initialize user grid with empty cells where puzzle has empty strings
      const initialUserGrid = puzzleData.puzzle.map(row => 
        row.map(cell => cell || '')
      );
      setUserGrid(initialUserGrid);
      
      setMoves(0);
      setIsComplete(false);
      setSelectedCell(null);
      
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      setError('Failed to load puzzle. Using fallback puzzle.');
      
      // Fallback to mock puzzle
      const mockPuzzle = createMockPuzzle(gridSize, difficultyParam);
      setPuzzle(mockPuzzle.puzzle);
      setSolution(mockPuzzle.solution);
      setUserGrid(mockPuzzle.puzzle.map(row => [...row]));
      setAnimalOptions(mockPuzzle.animals);
    } finally {
      setLoading(false);
    }
  };
  
  // Get default animals based on grid size
  const getDefaultAnimals = (size: number): string[] => {
    const allAnimals = ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🦄', '🐉'];
    return allAnimals.slice(0, size);
  };
  
  // Mock puzzle generator (fallback if API fails)
  const createMockPuzzle = (size: number, difficulty: string) => {
    const animals = getDefaultAnimals(size);
    
    // Create a simple pattern
    const puzzle: string[][] = [];
    const solution: string[][] = [];
    
    for (let i = 0; i < size; i++) {
      puzzle[i] = [];
      solution[i] = [];
      for (let j = 0; j < size; j++) {
        const animal = animals[(i + j) % animals.length];
        solution[i][j] = animal;
        
        // Remove cells based on difficulty
        const removeChance = difficulty.toLowerCase() === 'easy' ? 0.3 : 
                            difficulty.toLowerCase() === 'medium' ? 0.5 :
                            difficulty.toLowerCase() === 'hard' ? 0.7 : 0.8;
        
        puzzle[i][j] = Math.random() > removeChance ? animal : '';
      }
    }
    
    return { puzzle, solution, animals };
  };
  
  const handleCellPress = (row: number, col: number) => {
    // Only allow selecting empty cells
    if (puzzle[row][col] === '') {
      setSelectedCell([row, col]);
    }
  };
  
  const handleValueSelect = (value: string) => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      
      // Only allow editing if cell was empty in original puzzle
      if (puzzle[row][col] === '') {
        const newGrid = [...userGrid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = value;
        
        setUserGrid(newGrid);
        setMoves(moves + 1);
        
        // Check if cell is correct
        const isCorrect = value === solution[row][col];
        
        if (!isCorrect) {
          Alert.alert('Incorrect', `That's not the right animal for this cell.`);
        }
        
        // Check if puzzle is complete
        checkCompletion(newGrid);
        
        // Clear selection
        setSelectedCell(null);
      }
    }
  };
  
  const checkCompletion = (grid: string[][]) => {
    const allFilled = grid.every(row => row.every(cell => cell !== ''));
    const allCorrect = grid.every((row, rIndex) => 
      row.every((cell, cIndex) => cell === solution[rIndex][cIndex])
    );
    
    if (allFilled && allCorrect) {
      setIsComplete(true);
      Alert.alert(
        '🎉 Puzzle Complete!',
        `Congratulations! You solved the puzzle in ${moves + 1} moves!`,
        [
          {
            text: 'New Puzzle',
            onPress: fetchPuzzle
          },
          {
            text: 'Continue',
            style: 'cancel'
          }
        ]
      );
    }
  };
  
  const handleHint = () => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      const correctValue = solution[row][col];
      
      Alert.alert(
        'Hint',
        `The correct animal for this cell is ${correctValue}`,
        [
          {
            text: 'Use Hint',
            onPress: () => {
              const newGrid = [...userGrid];
              newGrid[row] = [...newGrid[row]];
              newGrid[row][col] = correctValue;
              setUserGrid(newGrid);
              setMoves(moves + 1);
              checkCompletion(newGrid);
              setSelectedCell(null);
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } else {
      Alert.alert('Select a Cell', 'Select an empty cell to get a hint.');
    }
  };
  
  const handleClearCell = () => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      
      // Only allow clearing if cell was empty in original puzzle
      if (puzzle[row][col] === '') {
        const newGrid = [...userGrid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = '';
        setUserGrid(newGrid);
        setSelectedCell(null);
      }
    }
  };
  
  const handleShowSolution = () => {
    Alert.alert(
      'Show Solution',
      'This will reveal the complete solution. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Show Solution',
          style: 'destructive',
          onPress: () => {
            setUserGrid(solution.map(row => [...row]));
            setIsComplete(true);
          }
        }
      ]
    );
  };
  
  const handleBack = () => {
    if (moves > 0 && !isComplete) {
      Alert.alert(
        'Leave Puzzle',
        'You have unsaved progress. Are you sure you want to leave?',
        [
          {
            text: 'Stay',
            style: 'cancel'
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading {gridSize}x{gridSize} Puzzle...
          </Text>
          {error && (
            <Text style={[styles.errorText, { color: '#FF9800' }]}>{error}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: colors.text }]}>{gridSizeParam}</Text>
            <Text style={[styles.difficulty, { color: colors.text }]}>{difficultyParam}</Text>
            {challengeType && (
              <View style={[
                styles.challengeBadge,
                { backgroundColor: challengeType === 'daily' ? '#4CAF50' : '#2196F3' }
              ]}>
                <Text style={styles.challengeText}>{challengeType.toUpperCase()}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.movesContainer}>
            <Text style={[styles.movesText, { color: colors.text }]}>Moves: {moves}</Text>
          </View>
        </View>
        
        {/* Error message */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: '#FF980020' }]}>
            <Text style={[styles.errorText, { color: '#FF9800' }]}>{error}</Text>
          </View>
        )}
        
        {/* ✅ FIXED: Selected Cell Info - MOVED BEFORE GRID */}
        {selectedCell && (
          <View style={[styles.selectedInfo, { backgroundColor: colors.button }]}>
            <Text style={[styles.selectedText, { color: colors.text }]}>
              Selected: Row {selectedCell[0] + 1}, Col {selectedCell[1] + 1}
            </Text>
            <TouchableOpacity onPress={handleClearCell} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Game Grid - FIXED SIZE */}
        <View style={[styles.gridContainer, { 
          width: containerSize, 
          height: containerSize,
          alignSelf: 'center' // ✅ FIXED: Center the grid
        }]}>
          {userGrid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => {
                const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
                const isOriginal = puzzle[rowIndex][colIndex] !== '';
                const isCorrect = cell === solution[rowIndex][colIndex];
                
                return (
                  <TouchableOpacity
                    key={`${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      {
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: isSelected ? '#2196F330' : 
                                        isOriginal ? colors.button + '80' : colors.button,
                        borderColor: isSelected ? '#2196F3' : colors.text + '30',
                        opacity: isOriginal ? 0.7 : 1,
                      },
                    ]}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                    disabled={isOriginal || isComplete}
                  >
                    <Text style={[
                      styles.cellText,
                      { 
                        color: isCorrect || isOriginal ? colors.text : '#F44336',
                        fontSize: getFontSizeForGrid(gridSize, cellSize)
                      }
                    ]}>
                      {cell || ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
        
        {/* Animal Selector - FIXED: Center aligned */}
        <View style={styles.selectorContainer}>
          <Text style={[styles.selectorTitle, { color: colors.text }]}>
            Select Animal ({gridSize} animals):
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.animalScrollContent}
          >
            {animalOptions.slice(0, gridSize).map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.animalButton, 
                  { 
                    backgroundColor: colors.button,
                    marginHorizontal: 6, // ✅ FIXED: Proper spacing
                  }
                ]}
                onPress={() => handleValueSelect(emoji)}
                disabled={!selectedCell || isComplete}
              >
                <Text style={styles.animalText}>
                  {emoji}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Controls - FIXED: Better spacing */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#FF9800' }]}
            onPress={handleHint}
            disabled={!selectedCell || isComplete}
          >
            <Text style={styles.controlButtonText}>💡 Hint</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#2196F3' }]}
            onPress={fetchPuzzle}
          >
            <Text style={styles.controlButtonText}>🔄 New</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#F44336' }]}
            onPress={handleShowSolution}
            disabled={isComplete}
          >
            <Text style={styles.controlButtonText}>👁️ Solution</Text>
          </TouchableOpacity>
        </View>
        
        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: colors.button }]}>
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>
            How to Play:
          </Text>
          <Text style={[styles.instructionsText, { color: colors.text }]}>
            • Tap empty cells to select them{'\n'}
            • Select an animal to fill the cell{'\n'}
            • Each row, column, and {getBoxSize(gridSize)}x{getBoxSize(gridSize)} box must have all animals{'\n'}
            • Hint shows the correct animal for selected cell
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper functions
const getBoxSize = (gridSize: number): number => {
  if (gridSize === 6) return 3;
  if (gridSize === 8) return 4;
  if (gridSize === 10) return 5;
  if (gridSize === 12) return 4;
  return Math.sqrt(gridSize);
};

const getFontSizeForGrid = (gridSize: number, cellSize: number): number => {
  // Base font size on cell size
  if (cellSize < 30) return 14;
  if (cellSize < 40) return 16;
  if (cellSize < 50) return 18;
  return 20;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  difficulty: {
    fontSize: 14,
    opacity: 0.8,
  },
  challengeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  challengeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  movesContainer: {
    padding: 8,
  },
  movesText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // ✅ FIXED: Selected Cell Info styles
  selectedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F44336',
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  gridContainer: {
    marginVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  cellText: {
    fontWeight: 'bold',
  },
  selectorContainer: {
    marginTop: 10,
    marginHorizontal: 20,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  animalScrollContent: {
    paddingVertical: 10,
    justifyContent: 'center',
  },
  animalButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  animalText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginVertical: 15,
  },
  controlButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});

export default PlayScreen;