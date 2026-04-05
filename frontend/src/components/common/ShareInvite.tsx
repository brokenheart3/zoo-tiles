// src/components/common/ShareInvite.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Platform,
  Linking,
  Modal,
  ScrollView,
  Image,
  ImageSourcePropType,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ShareInviteProps {
  themeColors: any;
  userId?: string;
  userName?: string;
  variant?: 'button' | 'card';
  challengeName?: string;  // Add this
  challengeType?: 'daily' | 'weekly';  // Add this
}

// src/components/common/ShareInvite.tsx

// Static import of all icons (corrected path: 3 levels up to frontend, then into assets)
const ICONS = {
  whatsapp: require('../../../assets/Share/whatsapp.png'),
  telegram: require('../../../assets/Share/telegram.png'),
  messenger: require('../../../assets/Share/messenger.png'),
  facebook: require('../../../assets/Share/facebook.png'),
  twitter: require('../../../assets/Share/twitter.png'),
  instagram: require('../../../assets/Share/instagram.png'),
  tiktok: require('../../../assets/Share/tiktok.png'),
  snapchat: require('../../../assets/Share/snapchat.png'),
  linkedIn: require('../../../assets/Share/linkedIn.png'),
  reddit: require('../../../assets/Share/reddit.png'),
  discord: require('../../../assets/Share/discord.png'),
  sms: require('../../../assets/Share/sms.png'),
  email: require('../../../assets/Share/email.png'),
};

// All share apps with their respective icons
const SHARE_APPS = [
  { 
    id: 'whatsapp', 
    name: 'WhatsApp', 
    icon: ICONS.whatsapp,
    color: '#25D366', 
    action: 'whatsapp',
    urlScheme: 'whatsapp://send?text=',
  },
  { 
    id: 'telegram', 
    name: 'Telegram', 
    icon: ICONS.telegram,
    color: '#26A5E4', 
    action: 'telegram',
    urlScheme: 'tg://msg?text=',
  },
  { 
    id: 'messenger', 
    name: 'Messenger', 
    icon: ICONS.messenger,
    color: '#0084FF', 
    action: 'messenger',
    urlScheme: 'fb-messenger://share?link=',
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: ICONS.facebook,
    color: '#1877F2', 
    action: 'facebook',
    urlScheme: 'https://www.facebook.com/sharer/sharer.php?u=',
  },
  { 
    id: 'twitter', 
    name: 'Twitter', 
    icon: ICONS.twitter,
    color: '#1DA1F2', 
    action: 'twitter',
    urlScheme: 'https://twitter.com/intent/tweet?text=',
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: ICONS.instagram,
    color: '#E4405F', 
    action: 'instagram',
    urlScheme: 'instagram://library?AssetPath=',
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: ICONS.tiktok,
    color: '#000000', 
    action: 'tiktok',
    urlScheme: 'tiktok://',
  },
  { 
    id: 'snapchat', 
    name: 'Snapchat', 
    icon: ICONS.snapchat,
    color: '#FFFC00', 
    action: 'snapchat',
    urlScheme: 'snapchat://',
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: ICONS.linkedIn,
    color: '#0077B5', 
    action: 'linkedin',
    urlScheme: 'https://www.linkedin.com/sharing/share-offsite/?url=',
  },
  { 
    id: 'reddit', 
    name: 'Reddit', 
    icon: ICONS.reddit,
    color: '#FF4500', 
    action: 'reddit',
    urlScheme: 'https://reddit.com/submit?url=',
  },
  { 
    id: 'discord', 
    name: 'Discord', 
    icon: ICONS.discord,
    color: '#5865F2', 
    action: 'discord',
    urlScheme: 'discord://',
  },
  { 
    id: 'sms', 
    name: 'Text Message', 
    icon: ICONS.sms,
    color: '#34B7F1', 
    action: 'sms',
    urlScheme: Platform.OS === 'ios' ? 'sms:&body=' : 'sms:?body=',
  },
  { 
    id: 'email', 
    name: 'Email', 
    icon: ICONS.email,
    color: '#EA4335', 
    action: 'email',
    urlScheme: 'mailto:?subject=Join me on Sudoku Tiles&body=',
  },
];

// Modal for Share Apps
const ShareAppsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onShareApp: (app: typeof SHARE_APPS[0]) => void;
  themeColors: any;
}> = ({ visible, onClose, onShareApp, themeColors }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: themeColors.card || '#1a1a2e' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              Share via App
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.modalClose, { color: themeColors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            <View style={styles.platformGrid}>
              {SHARE_APPS.map((app) => (
                <TouchableOpacity
                  key={app.id}
                  style={[styles.platformItem, { backgroundColor: `${themeColors.button}15` }]}
                  onPress={() => onShareApp(app)}
                >
                  <View style={styles.platformIconContainer}>
                    <Image 
                      source={app.icon} 
                      style={styles.platformIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[styles.platformName, { color: themeColors.text }]}>
                    {app.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: themeColors.button }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelButtonText, { color: '#fff' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Modal for Share Link
const ShareLinkModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  inviteLink: string;
  inviteCode: string;
  themeColors: any;
}> = ({ visible, onClose, inviteLink, inviteCode, themeColors }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await AsyncStorage.setItem('shareLink', inviteLink);
      await Share.share({
        message: `Join me on Sudoku Tiles Pro!\n\nInvite Code: ${inviteCode}\n\nDownload: ${inviteLink}`,
        title: 'Join me on Sudoku Tiles Pro!',
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Success', 'Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.smallModalOverlay}>
        <View style={[styles.smallModalContainer, { backgroundColor: themeColors.card || '#1a1a2e' }]}>
          <View style={styles.smallModalHeader}>
            <Text style={[styles.smallModalTitle, { color: themeColors.text }]}>
              Share Link 🔗
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.smallModalClose, { color: themeColors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.linkContainer}>
            <View style={[styles.inviteCodeBox, { backgroundColor: `${themeColors.button}20` }]}>
              <Text style={[styles.inviteCodeLabel, { color: themeColors.text }]}>Your Invite Code:</Text>
              <Text style={[styles.inviteCodeValue, { color: themeColors.button }]}>{inviteCode}</Text>
            </View>

            <Text style={[styles.linkLabel, { color: themeColors.text }]}>
              Invite Link:
            </Text>
            <View style={[styles.linkBox, { backgroundColor: `${themeColors.button}20`, borderColor: themeColors.button }]}>
              <Text style={[styles.linkText, { color: themeColors.text }]} numberOfLines={2}>
                {inviteLink}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.copyButton, { backgroundColor: themeColors.button }]}
              onPress={handleCopyLink}
            >
              <Text style={styles.copyButtonText}>
                {copied ? '✓ Copied!' : '📋 Copy & Share Link'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.smallModalCancel, { backgroundColor: themeColors.button }]}
            onPress={onClose}
          >
            <Text style={[styles.smallModalCancelText, { color: '#fff' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ShareInvite: React.FC<ShareInviteProps> = ({
  themeColors,
  userId = 'player123',
  userName = 'A Player',
  variant = 'button',
  challengeName = '',  // Add default
  challengeType = 'daily',  // Add default
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareAppsModalVisible, setShareAppsModalVisible] = useState(false);
  const [shareLinkModalVisible, setShareLinkModalVisible] = useState(false);
  
  const appDownloadUrl = 'https://expo.dev/@ckayssar1/zoo-tiles';
  
  // Update invite message to include challenge name
  const inviteMessage = `🎮 ${userName} invited you to play Sudoku Tiles Pro!

${challengeName ? `🎯 Current ${challengeType === 'daily' ? 'Daily' : 'Weekly'} Challenge: ${challengeName}` : ''}

🐾 Solve fun puzzles with categories like Animals, Cars, Clothing, Sports and more!
🏆 Daily challenges with leaderboards
🎯 Weekly competitions for prizes
✨ Beautiful themes and collectible trophies

Download now and use invite code: ${userId}

${appDownloadUrl}`;

  const handleNativeShare = async () => {
    setIsExpanded(false);
    try {
      await Share.share({
        message: inviteMessage,
        title: 'Join me on Sudoku Tiles Pro!',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Share Failed', 'Could not share. Please try again.');
    }
  };

  const handleShareApp = async (app: typeof SHARE_APPS[0]) => {
    setShareAppsModalVisible(false);
    setIsExpanded(false);
    
    try {
      switch (app.action) {
        case 'whatsapp':
          const whatsappUrls = [
            `whatsapp://send?text=${encodeURIComponent(inviteMessage)}`,
            `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`
          ];
          
          let opened = false;
          for (const url of whatsappUrls) {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
              await Linking.openURL(url);
              opened = true;
              break;
            }
          }
          
          if (!opened) {
            Alert.alert('WhatsApp', 'Please make sure WhatsApp is installed.');
          }
          break;
          
        case 'telegram':
          const telegramUrls = [
            `tg://msg?text=${encodeURIComponent(inviteMessage)}`,
            `https://t.me/share/url?url=${encodeURIComponent(appDownloadUrl)}&text=${encodeURIComponent(inviteMessage)}`
          ];
          
          opened = false;
          for (const url of telegramUrls) {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
              await Linking.openURL(url);
              opened = true;
              break;
            }
          }
          
          if (!opened) {
            Alert.alert('Telegram', 'Please make sure Telegram is installed.');
          }
          break;
          
        case 'messenger':
          const messengerUrls = [
            `fb-messenger://share?link=${encodeURIComponent(appDownloadUrl)}`,
            `fb-messenger://share?text=${encodeURIComponent(inviteMessage)}`
          ];
          
          opened = false;
          for (const url of messengerUrls) {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
              await Linking.openURL(url);
              opened = true;
              break;
            }
          }
          
          if (!opened) {
            Alert.alert('Messenger', 'Please make sure Messenger is installed.');
          }
          break;
          
        case 'facebook':
          const facebookUrls = [
            `fb://share/?link=${encodeURIComponent(appDownloadUrl)}`,
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appDownloadUrl)}`
          ];
          
          opened = false;
          for (const url of facebookUrls) {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
              await Linking.openURL(url);
              opened = true;
              break;
            }
          }
          
          if (!opened) {
            await Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appDownloadUrl)}`);
          }
          break;
          
        case 'twitter':
          const twitterUrls = [
            `twitter://post?message=${encodeURIComponent(inviteMessage)}`,
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(inviteMessage)}`
          ];
          
          opened = false;
          for (const url of twitterUrls) {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
              await Linking.openURL(url);
              opened = true;
              break;
            }
          }
          
          if (!opened) {
            await Linking.openURL(`https://twitter.com/intent/tweet?text=${encodeURIComponent(inviteMessage)}`);
          }
          break;
          
        case 'instagram':
          Alert.alert(
            'Instagram',
            'Please share your invite code manually in Instagram.\n\nInvite Code: ' + userId,
            [{ text: 'OK', style: 'default' }]
          );
          break;
          
        case 'tiktok':
          Alert.alert(
            'TikTok',
            'Please share your invite code manually in TikTok.\n\nInvite Code: ' + userId,
            [{ text: 'OK', style: 'default' }]
          );
          break;
          
        case 'snapchat':
          Alert.alert(
            'Snapchat',
            'Please share your invite code manually in Snapchat.\n\nInvite Code: ' + userId,
            [{ text: 'OK', style: 'default' }]
          );
          break;
          
        case 'linkedin':
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appDownloadUrl)}&title=${encodeURIComponent('Join me on Sudoku Tiles Pro!')}&summary=${encodeURIComponent(inviteMessage)}`;
          await Linking.openURL(linkedinUrl);
          break;
          
        case 'reddit':
          const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(appDownloadUrl)}&title=${encodeURIComponent('Join me on Sudoku Tiles Pro!')}`;
          await Linking.openURL(redditUrl);
          break;
          
        case 'discord':
          Alert.alert(
            'Discord',
            'Please share your invite code manually in Discord.\n\nInvite Code: ' + userId,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Copy Code', onPress: () => {
                AsyncStorage.setItem('shareLink', userId);
                Alert.alert('Copied!', 'Invite code copied to clipboard.');
              }}
            ]
          );
          break;
          
        case 'sms':
          const smsUrl = Platform.OS === 'ios' 
            ? `sms:&body=${encodeURIComponent(inviteMessage)}`
            : `sms:?body=${encodeURIComponent(inviteMessage)}`;
          
          const canOpenSms = await Linking.canOpenURL(smsUrl);
          if (canOpenSms) {
            await Linking.openURL(smsUrl);
          } else {
            Alert.alert('SMS not available', 'Your device does not support SMS.');
          }
          break;
          
        case 'email':
          const emailUrl = `mailto:?subject=${encodeURIComponent('Join me on Sudoku Tiles Pro!')}&body=${encodeURIComponent(inviteMessage)}`;
          const canOpenEmail = await Linking.canOpenURL(emailUrl);
          if (canOpenEmail) {
            await Linking.openURL(emailUrl);
          } else {
            Alert.alert('Email not configured', 'Please set up an email account on your device.');
          }
          break;
          
        default:
          await Share.share({
            message: inviteMessage,
            title: 'Join me on Sudoku Tiles Pro!',
          });
      }
      
      console.log(`📱 Shared via ${app.name}`);
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Share Failed', 'Could not share. Please try again.');
    }
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const openShareAppsModal = () => {
    setShareAppsModalVisible(true);
  };

  const openShareLinkModal = () => {
    setShareLinkModalVisible(true);
  };

  if (variant === 'card') {
    return (
      <View style={[styles.card, { backgroundColor: themeColors.button }]}>
        <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🎮</Text>
            <Text style={[styles.cardTitle, { color: '#fff' }]}>
              Share Invite
            </Text>
            <Text style={[styles.expandIcon, { color: '#fff' }]}>
              {isExpanded ? '▲' : '▼'}
            </Text>
          </View>
          
          <Text style={[styles.cardDescription, { color: '#fff', opacity: 0.9 }]}>
            Share with friends and family to play together!
          </Text>

          <Text style={[styles.inviteCode, { color: '#fff', opacity: 0.8 }]}>
            Your Invite Code: <Text style={{ fontWeight: 'bold' }}>{userId}</Text>
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: `${themeColors.button}20` }]}
              onPress={openShareAppsModal}
            >
              <Text style={styles.optionIcon}>📱</Text>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: '#fff' }]}>Share via App</Text>
                <Text style={[styles.optionDescription, { color: '#fff', opacity: 0.7 }]}>
                  WhatsApp, Telegram, Facebook, etc.
                </Text>
              </View>
              <Text style={[styles.optionArrow, { color: '#fff' }]}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: `${themeColors.button}20` }]}
              onPress={handleNativeShare}
            >
              <Text style={styles.optionIcon}>📤</Text>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: '#fff' }]}>System Share</Text>
                <Text style={[styles.optionDescription, { color: '#fff', opacity: 0.7 }]}>
                  Use your device's native sharing
                </Text>
              </View>
              <Text style={[styles.optionArrow, { color: '#fff' }]}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: `${themeColors.button}20` }]}
              onPress={openShareLinkModal}
            >
              <Text style={styles.optionIcon}>🔗</Text>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: '#fff' }]}>Share Link</Text>
                <Text style={[styles.optionDescription, { color: '#fff', opacity: 0.7 }]}>
                  Copy and share your invite link
                </Text>
              </View>
              <Text style={[styles.optionArrow, { color: '#fff' }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        <ShareAppsModal
          visible={shareAppsModalVisible}
          onClose={() => setShareAppsModalVisible(false)}
          onShareApp={handleShareApp}
          themeColors={themeColors}
        />

        <ShareLinkModal
          visible={shareLinkModalVisible}
          onClose={() => setShareLinkModalVisible(false)}
          inviteLink={appDownloadUrl}
          inviteCode={userId}
          themeColors={themeColors}
        />
      </View>
    );
  }

  // Simple button variant
  return (
    <>
      <TouchableOpacity
        style={[styles.simpleButton, { backgroundColor: themeColors.button }]}
        onPress={toggleExpand}
      >
        <Text style={[styles.simpleButtonText, { color: '#fff' }]}>
          🤝 Share Invite {isExpanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.simpleExpandedSection, { backgroundColor: themeColors.card || '#1a1a2e' }]}>
          <TouchableOpacity
            style={[styles.simpleOptionButton, { backgroundColor: `${themeColors.button}15` }]}
            onPress={openShareAppsModal}
          >
            <Text style={styles.simpleOptionIcon}>📱</Text>
            <View style={styles.simpleOptionTextContainer}>
              <Text style={[styles.simpleOptionTitle, { color: themeColors.text }]}>Share via App</Text>
              <Text style={[styles.simpleOptionDescription, { color: themeColors.text, opacity: 0.7 }]}>
                WhatsApp, Telegram, Facebook, etc.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.simpleOptionButton, { backgroundColor: `${themeColors.button}15` }]}
            onPress={handleNativeShare}
          >
            <Text style={styles.simpleOptionIcon}>📤</Text>
            <View style={styles.simpleOptionTextContainer}>
              <Text style={[styles.simpleOptionTitle, { color: themeColors.text }]}>System Share</Text>
              <Text style={[styles.simpleOptionDescription, { color: themeColors.text, opacity: 0.7 }]}>
                Use your device's native sharing
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.simpleOptionButton, { backgroundColor: `${themeColors.button}15` }]}
            onPress={openShareLinkModal}
          >
            <Text style={styles.simpleOptionIcon}>🔗</Text>
            <View style={styles.simpleOptionTextContainer}>
              <Text style={[styles.simpleOptionTitle, { color: themeColors.text }]}>Share Link</Text>
              <Text style={[styles.simpleOptionDescription, { color: themeColors.text, opacity: 0.7 }]}>
                Copy and share your invite link
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <ShareAppsModal
        visible={shareAppsModalVisible}
        onClose={() => setShareAppsModalVisible(false)}
        onShareApp={handleShareApp}
        themeColors={themeColors}
      />

      <ShareLinkModal
        visible={shareLinkModalVisible}
        onClose={() => setShareLinkModalVisible(false)}
        inviteLink={appDownloadUrl}
        inviteCode={userId}
        themeColors={themeColors}
      />
    </>
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
  simpleExpandedSection: {
    marginTop: 10,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  simpleOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  simpleOptionIcon: {
    fontSize: 28,
  },
  simpleOptionTextContainer: {
    flex: 1,
  },
  simpleOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  simpleOptionDescription: {
    fontSize: 11,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  expandIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
    textAlign: 'center',
    color: '#fff',
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
  expandedSection: {
    marginTop: 15,
    gap: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    color: '#fff',
  },
  optionDescription: {
    fontSize: 11,
    color: '#fff',
  },
  optionArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  },
  modalContent: {
    paddingBottom: 10,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  platformItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  platformIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  platformIcon: {
    width: 32,
    height: 32,
  },
  platformName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  smallModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallModalContainer: {
    width: '85%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  smallModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  smallModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  smallModalClose: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  },
  linkContainer: {
    marginBottom: 20,
  },
  inviteCodeBox: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  inviteCodeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  inviteCodeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  linkBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
  },
  linkText: {
    fontSize: 12,
    textAlign: 'center',
  },
  copyButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  smallModalCancel: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  smallModalCancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ShareInvite;