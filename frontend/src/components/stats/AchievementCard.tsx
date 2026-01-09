import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AchievementCardProps {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedDate?: string;
  backgroundColor: string;
  textColor: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  name,
  description,
  icon,
  unlocked,
  progress,
  maxProgress,
  unlockedDate,
  backgroundColor,
  textColor,
}) => {
  const showProgress = progress !== undefined && maxProgress !== undefined && maxProgress > 1;
  const progressPercentage = showProgress ? (progress / maxProgress) * 100 : 0;

  return (
    <View style={[styles.container, { 
      backgroundColor,
      opacity: unlocked ? 1 : 0.7
    }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: textColor }]}>{name}</Text>
          {unlocked && (
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedText}>UNLOCKED</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.description, { color: textColor }]}>
          {description}
        </Text>
        
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: unlocked ? '#4CAF50' : '#2196F3'
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: textColor }]}>
              {progress}/{maxProgress}
            </Text>
          </View>
        )}
        
        {unlocked && unlockedDate && (
          <Text style={[styles.date, { color: textColor }]}>
            Unlocked: {unlockedDate}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  unlockedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  unlockedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  date: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});

export default AchievementCard;