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
  isUrgent?: boolean; // NEW: Urgency flag for timer styling
  isLoading?: boolean; // NEW: Loading state for players
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
  isUrgent = false, // Default to false
  isLoading = false, // Default to false
  onPress,
  onPlayPress,
  challengeColors,
}) => {
  const isDaily = type === 'daily';
  const colors = challengeColors[type];
  
  // Helper to determine if timer is in final countdown
  const isFinalHour = (timeStr: string): boolean => {
    if (!timeStr || timeStr === 'Loading...') return false;
    // Check if less than 1 hour remaining (format: "Xh Ym Zs" or "Xm Ys")
    return timeStr.includes('0h') || 
           (!timeStr.includes('h') && !timeStr.includes('d')); // Just minutes and seconds
  };
  
  // Helper to determine if challenge has ended
  const hasEnded = (timeStr: string): boolean => {
    return timeStr === 'Expired!' || timeStr.includes('Expired');
  };

  const timerIsUrgent = isUrgent || isFinalHour(remainingTime) || hasEnded(remainingTime);

  return (
    <TouchableOpacity 
      style={[
        styles.challengeCard, 
        { backgroundColor: themeColors.button },
        hasEnded(remainingTime) && styles.endedChallenge // Dim if expired
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.challengeHeader}>
        <View style={[styles.badge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {type.toUpperCase()}
          </Text>
        </View>
        
        {/* Urgency indicator */}
        {timerIsUrgent && !hasEnded(remainingTime) && (
          <View style={[styles.urgencyBadge, { backgroundColor: '#FF5722' }]}>
            <Text style={styles.urgencyText}>⏰ ENDING SOON</Text>
          </View>
        )}
        
        {hasEnded(remainingTime) && (
          <View style={[styles.urgencyBadge, { backgroundColor: '#9E9E9E' }]}>
            <Text style={styles.urgencyText}>⏹️ ENDED</Text>
          </View>
        )}
        
        {!timerIsUrgent && !hasEnded(remainingTime) && isDaily ? (
          <Text style={styles.challengeEmoji}>{emoji}</Text>
        ) : !timerIsUrgent && !hasEnded(remainingTime) && !isDaily ? (
          <View style={[styles.progressContainer, { backgroundColor: `${colors.bg}30` }]}>
            <Text style={[styles.progressText, { color: themeColors.text }]}>
              {progress}
            </Text>
          </View>
        ) : null}
      </View>
      
      {!isDaily && (
        <Text style={styles.challengeEmojiLarge}>{emoji}</Text>
      )}
      
      <Text style={[styles.cardTitle, { color: themeColors.text }]}>{title}</Text>
      <Text style={[styles.cardDesc, { color: themeColors.text }]}>
        {description}
      </Text>
      
      {/* Timer and Players Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[
            styles.timerLabel, 
            { color: themeColors.text, opacity: 0.7 }
          ]}>
            Time Remaining
          </Text>
          <View style={[
            styles.timerValueContainer,
            timerIsUrgent && styles.urgentTimerContainer
          ]}>
            <Text style={[
              styles.timerValue,
              timerIsUrgent && { color: '#FF5722' },
              hasEnded(remainingTime) && { color: '#9E9E9E' }
            ]}>
              {hasEnded(remainingTime) ? '⏹️ ' : '⏰ '}
              {remainingTime}
            </Text>
            {timerIsUrgent && !hasEnded(remainingTime) && (
              <View style={styles.pulsingDot} />
            )}
          </View>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[
            styles.playersLabel, 
            { color: themeColors.text, opacity: 0.7 }
          ]}>
            Players
          </Text>
          <View style={styles.playersValueContainer}>
            {isLoading ? (
              <View style={styles.loadingPlayers}>
                <View style={[styles.loadingDot, { backgroundColor: themeColors.text }]} />
                <View style={[styles.loadingDot, { backgroundColor: themeColors.text }]} />
                <View style={[styles.loadingDot, { backgroundColor: themeColors.text }]} />
              </View>
            ) : (
              <Text style={[styles.playersValue, { color: themeColors.text }]}>
                🎮 {players}
              </Text>
            )}
          </View>
        </View>
      </View>
      
      {/* Direct Play Button */}
      <TouchableOpacity 
        style={[
          styles.actionButton, 
          { backgroundColor: colors.bg },
          hasEnded(remainingTime) && styles.disabledButton
        ]}
        onPress={hasEnded(remainingTime) ? undefined : onPlayPress}
        activeOpacity={hasEnded(remainingTime) ? 1 : 0.8}
        disabled={hasEnded(remainingTime)}
      >
        <Text style={[styles.actionText, { color: colors.text }]}>
          {hasEnded(remainingTime) 
            ? `CHALLENGE ENDED` 
            : `PLAY ${type.toUpperCase()} CHALLENGE`}
        </Text>
        {hasEnded(remainingTime) && (
          <Text style={styles.endedSubText}>
            New challenge starts soon
          </Text>
        )}
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
  endedChallenge: {
    opacity: 0.9,
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
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  urgencyText: {
    color: '#FFFFFF',
    fontSize: 10,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
  },
  timerLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  timerValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgentTimerContainer: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timerValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5722',
    marginLeft: 6,
  },
  playersLabel: {
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'right',
  },
  playersValueContainer: {
    alignItems: 'flex-end',
  },
  loadingPlayers: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  playersValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  endedSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
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