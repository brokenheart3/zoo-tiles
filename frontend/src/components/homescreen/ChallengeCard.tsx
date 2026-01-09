import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type ChallengeType = 'daily' | 'weekly';

type ChallengeCardProps = {
  type: ChallengeType;
  title: string;
  description: string;
  remainingTime: string;
  players: string;
  emoji: string;
  progress?: string;
  themeColors: any;
  onPress: () => void;
  onPlayPress: () => void;
  challengeColors: {
    daily: { bg: string; text: string };
    weekly: { bg: string; text: string };
  };
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  type,
  title,
  description,
  remainingTime,
  players,
  emoji,
  progress,
  themeColors,
  onPress,
  onPlayPress,
  challengeColors,
}) => {
  const isDaily = type === 'daily';
  const colors = challengeColors[type];

  return (
    <TouchableOpacity 
      style={[styles.challengeCard, { backgroundColor: themeColors.button }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.challengeHeader}>
        <View style={[styles.badge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {type.toUpperCase()}
          </Text>
        </View>
        {isDaily ? (
          <Text style={styles.challengeEmoji}>{emoji}</Text>
        ) : (
          <View style={[styles.progressContainer, { backgroundColor: `${colors.bg}30` }]}>
            <Text style={[styles.progressText, { color: themeColors.text }]}>
              {progress}
            </Text>
          </View>
        )}
      </View>
      
      {!isDaily && (
        <Text style={styles.challengeEmojiLarge}>{emoji}</Text>
      )}
      
      <Text style={[styles.cardTitle, { color: themeColors.text }]}>{title}</Text>
      <Text style={[styles.cardDesc, { color: themeColors.text }]}>
        {description}
      </Text>
      
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { color: themeColors.text }]}>
          ⏰ {remainingTime} remaining
        </Text>
        <Text style={[styles.playersText, { color: themeColors.text }]}>
          🎮 {players} players
        </Text>
      </View>
      
      {/* Direct Play Button */}
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: colors.bg }]}
        onPress={onPlayPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.actionText, { color: colors.text }]}>
          PLAY {type.toUpperCase()} CHALLENGE
        </Text>
      </TouchableOpacity>
      
      {/* View Details Button */}
      <TouchableOpacity 
        style={[styles.viewDetailsButton, { borderTopColor: themeColors.text + '50' }]}
        onPress={onPress}
      >
        <Text style={[styles.viewDetailsText, { color: themeColors.text }]}>
          View Challenge Details →
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  challengeCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  challengeEmoji: {
    fontSize: 24,
  },
  challengeEmojiLarge: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 15,
    lineHeight: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  playersText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewDetailsButton: {
    paddingVertical: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    opacity: 0.8,
  },
});

export default ChallengeCard;