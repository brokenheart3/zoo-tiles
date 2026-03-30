// src/components/common/ShareInvite.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Platform
} from 'react-native';

interface ShareInviteProps {
  themeColors: any;
  userId?: string;
  userName?: string;
  variant?: 'button' | 'card';
}

const ShareInvite: React.FC<ShareInviteProps> = ({
  themeColors,
  userId = 'player123',
  userName = 'A Player',
  variant = 'button',
}) => {
  
  const inviteMessage = `🎮 ${userName} invited you to play Sudoku Tiles!

🐾 Solve fun animal puzzles
🏆 Daily challenges
🎯 Weekly competitions
✨ Beautiful themes

Download now and use invite code: ${userId}

https://expo.dev/@ckayssar1/sudoku-tiles;

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: inviteMessage,
        title: 'Invite to Sudoku Tiles',
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Invitation shared successfully');
        Alert.alert('Success', 'Thanks for sharing! 🎮');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error: any) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share invitation. Please try again.');
    }
  };

  if (variant === 'card') {
    return (
      <View style={[styles.card, { backgroundColor: themeColors.button }]}>
        <Text style={[styles.cardTitle, { color: '#fff' }]}>
          🎮 Invite Friends
        </Text>
        <Text style={[styles.cardDescription, { color: '#fff', opacity: 0.9 }]}>
          Share with friends and family to play together!
        </Text>
        
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: '#2E7D32' }]}
          onPress={handleShare}
        >
          <Text style={styles.buttonText}>📱 Share Invite Link</Text>
        </TouchableOpacity>

        <Text style={[styles.inviteCode, { color: '#fff', opacity: 0.8 }]}>
          Your Invite Code: <Text style={{ fontWeight: 'bold' }}>{userId}</Text>
        </Text>
      </View>
    );
  }

  // Simple button variant
  return (
    <TouchableOpacity
      style={[styles.simpleButton, { backgroundColor: themeColors.button }]}
      onPress={handleShare}
    >
      <Text style={[styles.simpleButtonText, { color: '#fff' }]}>
        🤝 Invite Friends
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  simpleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
    color: '#fff',
  },
  shareButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inviteCode: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    color: '#fff',
  },
});

export default ShareInvite;