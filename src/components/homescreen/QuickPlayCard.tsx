import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type QuickPlayCardProps = {
  gridSize: string;
  difficulty: string;
  emoji: string;
  hasCustomSettings: boolean;
  themeColors: any;
  difficultyColors: {
    [key: string]: { bg: string; text: string };
  };
  onPress: () => void;
};

const QuickPlayCard: React.FC<QuickPlayCardProps> = ({
  gridSize,
  difficulty,
  emoji,
  hasCustomSettings,
  themeColors,
  difficultyColors,
  onPress,
}) => {
  const diffColor = difficultyColors[difficulty] || difficultyColors.Medium;

  return (
    <View style={styles.singleGridContainer}>
      <TouchableOpacity 
        style={[
          styles.singleGridCard, 
          { 
            backgroundColor: themeColors.button,
            borderWidth: hasCustomSettings ? 0 : 2,
            borderColor: hasCustomSettings ? 'transparent' : '#FF9800',
          }
        ]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {!hasCustomSettings && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
          </View>
        )}
        
        <Text style={styles.singleGridEmoji}>{emoji}</Text>
        <Text style={[styles.singleGridSize, { color: themeColors.text }]}>
          {gridSize}
        </Text>
        <View style={[styles.difficultyBadge, { 
          backgroundColor: diffColor.bg 
        }]}>
          <Text style={[styles.difficultyText, { 
            color: diffColor.text 
          }]}>
            {difficulty}
          </Text>
        </View>
        <Text style={[styles.singleGridLabel, { color: themeColors.text }]}>
          {hasCustomSettings 
            ? 'Tap to play with your preferred settings'
            : 'Tap to play with default settings'
          }
        </Text>
        
        {!hasCustomSettings && (
          <Text style={[styles.customizeHint, { color: themeColors.text }]}>
            Customize in Settings
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  singleGridContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  singleGridCard: {
    alignItems: 'center',
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  defaultBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  singleGridEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  singleGridSize: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  singleGridLabel: {
    fontSize: 14,
    opacity: 0.9,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 5,
  },
  customizeHint: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

export default QuickPlayCard;