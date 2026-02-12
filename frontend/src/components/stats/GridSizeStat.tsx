import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GridSizeStatProps {
  gridSize: string;
  bestTime?: string;
  averageTime?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  backgroundColor: string;
  textColor: string;
}

const GridSizeStat: React.FC<GridSizeStatProps> = ({
  gridSize,
  bestTime = '--',
  averageTime,
  difficulty,
  backgroundColor,
  textColor,
}) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      case 'Expert': return '#9C27B0';
      default: return '#757575';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.gridSize, { color: textColor }]}>
          {gridSize} Grid
        </Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
          <Text style={styles.difficultyText}>{difficulty}</Text>
        </View>
      </View>
      
      <View style={styles.times}>
        <View style={styles.timeItem}>
          <Text style={[styles.timeLabel, { color: textColor }]}>Best</Text>
          <Text style={[styles.timeValue, { color: textColor }]}>{bestTime}</Text>
        </View>
        
        {averageTime && (
          <>
            <View style={styles.divider} />
            <View style={styles.timeItem}>
              <Text style={[styles.timeLabel, { color: textColor }]}>Average</Text>
              <Text style={[styles.timeValue, { color: textColor }]}>{averageTime}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridSize: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeItem: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#DDD',
  },
});

export default GridSizeStat;
