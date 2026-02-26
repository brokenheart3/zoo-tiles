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
  isUrgent?: boolean;
  isLoading?: boolean;
  onPress: () => void;
  onPlayPress: () => void;
  played?: boolean;
  result?: any;
  buttonText?: string;
  buttonColor?: string; // Add optional button color
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
  isUrgent = false,
  isLoading = false,
  onPress,
  onPlayPress,
  played = false,
  result,
  buttonText,
  buttonColor, // New prop
}) => {
  const isDaily = type === 'daily';

  console.log('🎴 ChallengeCard - type:', type, 'played:', played, 'buttonText:', buttonText);
  
  // Type badge colors
  const typeBadgeColors = {
    daily: { bg: '#2E7D32', text: '#ffffff' },
    weekly: { bg: '#1565C0', text: '#ffffff' },
  };

  // Helper to determine if timer is in final countdown
  const isFinalHour = (timeStr: string): boolean => {
    if (!timeStr || timeStr === 'Loading...') return false;
    return timeStr.includes('0h') || 
           (!timeStr.includes('h') && !timeStr.includes('d'));
  };
  
  // Helper to determine if challenge has ended
  const hasEnded = (timeStr: string): boolean => {
    return timeStr === 'Expired!' || timeStr.includes('Expired');
  };

  const timerIsUrgent = isUrgent || isFinalHour(remainingTime) || hasEnded(remainingTime);

  // Use buttonText if provided, otherwise fall back to internal logic
  const displayButtonText = buttonText || (() => {
    if (played) return 'SEE RESULTS';
    if (hasEnded(remainingTime)) return 'CHALLENGE ENDED';
    return `PLAY ${type.toUpperCase()} CHALLENGE`;
  })();

  // Use buttonColor if provided, otherwise fall back to internal logic
  const displayButtonColor = buttonColor || (() => {
    if (played) return '#9C27B0'; // Purple for results
    if (hasEnded(remainingTime)) return '#9E9E9E'; // Gray for ended
    return typeBadgeColors[type].bg;
  })();

  // Format result time if available
  const getResultTime = () => {
    if (!result?.bestTime) return null;
    const mins = Math.floor(result.bestTime / 60);
    const secs = result.bestTime % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resultTime = getResultTime();

  return (
    <TouchableOpacity 
      style={[
        styles.challengeCard, 
        { backgroundColor: themeColors.button },
        hasEnded(remainingTime) && styles.endedChallenge,
        played && !hasEnded(remainingTime) && styles.playedCard 
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.challengeHeader}>
        <View style={[styles.badge, { backgroundColor: typeBadgeColors[type].bg }]}>
          <Text style={[styles.badgeText, { color: typeBadgeColors[type].text }]}>
            {type.toUpperCase()}
          </Text>
        </View>
        
        {/* Show played badge only if not expired */}
        {played && !hasEnded(remainingTime) && (
          <View style={[styles.playedBadge, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.playedBadgeText}>✓ COMPLETED</Text>
          </View>
        )}
        
        {/* Show emoji in header for all challenges */}
        <Text style={styles.headerEmoji}>{emoji}</Text>
      </View>
      
      {/* Large emoji for all challenges */}
      <Text style={styles.largeEmoji}>{emoji}</Text>
      
      <Text style={[styles.cardTitle, { color: themeColors.text }]}>{title}</Text>
      <Text style={[styles.cardDesc, { color: themeColors.text }]}>
        {description}
      </Text>
      
      {/* Show result if played and not expired */}
      {played && !hasEnded(remainingTime) && result && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultLabel, { color: themeColors.text }]}>Your Result:</Text>
          <View style={styles.resultStats}>
            {resultTime && (
              <View style={styles.resultItem}>
                <Text style={[styles.resultIcon, { color: themeColors.text }]}>⏱️</Text>
                <Text style={[styles.resultValue, { color: themeColors.text }]}>{resultTime}</Text>
              </View>
            )}
            {result.isPerfect && (
              <View style={styles.resultItem}>
                <Text style={[styles.resultIcon, { color: themeColors.text }]}>✨</Text>
                <Text style={[styles.resultValue, { color: themeColors.text }]}>Perfect!</Text>
              </View>
            )}
          </View>
        </View>
      )}
      
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

      {/* Progress for weekly challenges */}
      {!isDaily && progress && !played && (
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: themeColors.text }]}>
            Progress: {progress}
          </Text>
        </View>
      )}
      
      {/* Urgency badge for ending soon - hide if played and not expired */}
      {timerIsUrgent && !hasEnded(remainingTime) && !played && (
        <View style={[styles.urgencyBadge, { backgroundColor: '#FF5722' }]}>
          <Text style={styles.urgencyText}>⏰ ENDING SOON</Text>
        </View>
      )}
      
      {/* Direct Action Button - uses props from parent */}
      <TouchableOpacity 
        style={[
          styles.actionButton, 
          { 
            backgroundColor: displayButtonColor,
          }
        ]}
        onPress={onPlayPress}
        activeOpacity={0.8}
        disabled={false} 
      >
        <Text style={styles.actionText}>
          {displayButtonText}
        </Text>
        {hasEnded(remainingTime) && (
          <Text style={styles.endedSubText}>
            New challenge starts at UTC midnight
          </Text>
        )}
        {played && !hasEnded(remainingTime) && (
          <Text style={styles.playedSubText}>
            Tap to view your results
          </Text>
        )}
      </TouchableOpacity>
      
      {/* View Details Button */}
      <TouchableOpacity 
        style={[styles.viewDetailsButton, { borderTopColor: themeColors.text + '50' }]}
        onPress={onPress}
      >
        <Text style={[styles.viewDetailsText, { color: themeColors.text }]}>
          {played && !hasEnded(remainingTime) ? 'View Full Results →' : 'View Challenge Details →'}
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
    position: 'relative',
  },
  playedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
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
  playedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  playedBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerEmoji: {
    fontSize: 24,
  },
  largeEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultIcon: {
    fontSize: 16,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
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
  progressContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  urgencyBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  urgencyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  endedSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  playedSubText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
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