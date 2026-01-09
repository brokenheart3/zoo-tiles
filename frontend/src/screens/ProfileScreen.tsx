import React, { useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { SettingsStackParamList } from '../navigation/SettingsStack';
import { ThemeContext, themeStyles } from '../context/ThemeContext';
import { useProfile, Trophy } from '../context/ProfileContext';

type ProfileScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { profile, getUnlockedTrophies, getLockedTrophies, isLoading } = useProfile();
  const colors = themeStyles[theme];

  // Show loading indicator while profile is loading
  if (isLoading || !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.button} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData: profile });
  };

  const isEmojiAvatar = profile?.avatar && /^[\p{Emoji}\u2000-\u3300]/u.test(profile.avatar);

  // Use helper functions with fallbacks
  const unlockedTrophies = getUnlockedTrophies?.() || [];
  const lockedTrophies = getLockedTrophies?.() || [];
  const allTrophies = profile?.trophies || [];

  const renderTrophyItem = ({ item }: { item: Trophy }) => (
    <View style={[
      styles.trophyItem, 
      { backgroundColor: colors.button, borderColor: colors.text },
      !item.unlocked && styles.lockedTrophy
    ]}>
      <Text style={styles.trophyIcon}>{item.icon}</Text>
      <View style={styles.trophyInfo}>
        <Text style={[styles.trophyName, { color: colors.text }]}>
          {item.name}
          {!item.unlocked && ' 🔒'}
        </Text>
        <Text style={[styles.trophyDescription, { color: colors.text }]}>
          {item.description}
        </Text>
        {item.unlockDate && (
          <Text style={[styles.trophyDate, { color: colors.text }]}>
            Unlocked: {item.unlockDate}
          </Text>
        )}
        {!item.unlocked && (
          <Text style={[styles.trophyRequirement, { color: colors.text }]}>
            Requirement: {getRequirementText(item)}
          </Text>
        )}
      </View>
    </View>
  );

  const getRequirementText = (trophy: Trophy) => {
    switch (trophy.requirement.type) {
      case 'puzzles_completed':
        return `Complete ${trophy.requirement.value} puzzles`;
      case 'accuracy':
        return `Achieve ${trophy.requirement.value}% accuracy`;
      case 'streak':
        return `${trophy.requirement.value}-day streak`;
      case 'daily_play':
        return `Play for ${trophy.requirement.value} days`;
      case 'weekend_play':
        return `Complete ${trophy.requirement.value} weekend puzzles`;
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.button }]}>
          {isEmojiAvatar ? (
            <View style={[styles.iconAvatar, { backgroundColor: colors.background }]}>
              <Text style={styles.iconAvatarText}>{profile.avatar}</Text>
            </View>
          ) : profile.avatar?.startsWith('http') ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.iconAvatar, { backgroundColor: colors.background }]}>
              <Text style={styles.iconAvatarText}>{profile.avatar || '👤'}</Text>
            </View>
          )}
          <Text style={[styles.name, { color: colors.text }]}>{profile.name || 'User'}</Text>
          <Text style={[styles.username, { color: colors.text }]}>{profile.username || '@username'}</Text>
          <Text style={[styles.joinDate, { color: colors.text }]}>{profile.joinDate || 'Joined recently'}</Text>
          
          {/* Trophy Summary */}
          <View style={styles.trophySummary}>
            <View style={styles.trophyCount}>
              <Text style={[styles.trophyCountNumber, { color: colors.text }]}>
                {unlockedTrophies.length}
              </Text>
              <Text style={[styles.trophyCountLabel, { color: colors.text }]}>
                Trophies Unlocked
              </Text>
            </View>
            <View style={styles.trophyDivider} />
            <View style={styles.trophyCount}>
              <Text style={[styles.trophyCountNumber, { color: colors.text }]}>
                {allTrophies.length}
              </Text>
              <Text style={[styles.trophyCountLabel, { color: colors.text }]}>
                Total Trophies
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Stats</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.stats?.puzzlesSolved || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Puzzles Solved</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.stats?.accuracy || 0}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Accuracy</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.stats?.currentStreak || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Day Streak</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.stats?.totalPlayDays || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Total Play Days</Text>
            </View>
          </View>
        </View>

        {/* Unlocked Trophies */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Unlocked Trophies</Text>
            <Text style={[styles.trophyCountBadge, { backgroundColor: colors.button }]}>
              {unlockedTrophies.length}/{allTrophies.length}
            </Text>
          </View>
          
          {unlockedTrophies.length > 0 ? (
            <FlatList
              data={unlockedTrophies}
              renderItem={renderTrophyItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={[styles.noTrophiesText, { color: colors.text }]}>
              No trophies unlocked yet. Keep playing!
            </Text>
          )}
        </View>

        {/* Locked Trophies */}
        {lockedTrophies.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Trophies</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
              {lockedTrophies.length} trophies to unlock
            </Text>
            
            <FlatList
              data={lockedTrophies.slice(0, 3)}
              renderItem={renderTrophyItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
            
            {lockedTrophies.length > 3 && (
              <Text style={[styles.moreTrophiesText, { color: colors.text }]}>
                +{lockedTrophies.length - 3} more trophies to unlock
              </Text>
            )}
          </View>
        )}

        {/* Bio */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.bio, { color: colors.text }]}>
            {profile.bio || 'No bio yet. Edit your profile to add one!'}
          </Text>
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {profile.email || 'No email provided'}
            </Text>
          </View>
        </View>

        {/* Edit Profile Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.button }]}
            onPress={handleEditProfile}
          >
            <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  iconAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  iconAvatarText: {
    fontSize: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    marginBottom: 10,
  },
  joinDate: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
  },
  trophySummary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 15,
    width: '100%',
    justifyContent: 'space-around',
  },
  trophyCount: {
    alignItems: 'center',
  },
  trophyCountNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  trophyCountLabel: {
    fontSize: 12,
    opacity: 0.9,
  },
  trophyDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 15,
  },
  trophyCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
  },
  trophyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  lockedTrophy: {
    opacity: 0.6,
  },
  trophyIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  trophyInfo: {
    flex: 1,
  },
  trophyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trophyDescription: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.9,
  },
  trophyDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  trophyRequirement: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  noTrophiesText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
    opacity: 0.7,
  },
  moreTrophiesText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  editButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;