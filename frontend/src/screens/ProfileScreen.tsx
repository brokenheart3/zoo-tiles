// screens/ProfileScreen.tsx
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
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { SettingsStackParamList } from '../navigation/SettingsStack';
import { ThemeContext, themeStyles } from '../context/ThemeContext';
import { useProfile, Trophy } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';

type ProfileScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { profile, getUnlockedTrophies, getLockedTrophies, isLoading } = useProfile();
  const { user, signOut } = useAuth();
  const colors = themeStyles[theme];

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.button} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData: profile });
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const mergedProfile = {
    ...profile,
    name: profile.name || user?.displayName || '',
    email: profile.email || user?.email || '',
    avatar: profile.avatar || '',
    trophies: profile.trophies || [],
    stats: profile.stats || {
      puzzlesSolved: 0,
      accuracy: 0,
      currentStreak: 0,
      totalPlayDays: 0,
    },
  };

  const isEmojiAvatar =
    mergedProfile.avatar && /^[\p{Emoji}\u2000-\u3300]/u.test(mergedProfile.avatar);
  const unlockedTrophies = getUnlockedTrophies?.() || [];
  const lockedTrophies = getLockedTrophies?.() || [];

  // ✅ Updated render function for trophies
  const renderTrophyItem = ({ item }: { item: Trophy }) => {
    // Convert requirement object to readable string
    let requirementText = '';
    if (item.requirement) {
      if (typeof item.requirement === 'string') {
        requirementText = item.requirement;
      } else if ('type' in item.requirement && 'value' in item.requirement) {
        // e.g., { type: 'puzzles_completed', value: 10 }
        requirementText = `${item.requirement.value} ${item.requirement.type.replace('_', ' ')}`;
      }
    }

    return (
      <View
        style={[
          styles.trophyItem,
          { backgroundColor: colors.button, borderColor: colors.text },
          !item.unlocked && styles.lockedTrophy,
        ]}
      >
        <Text style={styles.trophyIcon}>{item.icon}</Text>
        <View style={styles.trophyInfo}>
          <Text style={[styles.trophyName, { color: colors.text }]}>
            {item.name} {!item.unlocked && '🔒'}
          </Text>
          <Text style={[styles.trophyDescription, { color: colors.text }]}>
            {item.description}
          </Text>
          {item.unlockDate && (
            <Text style={[styles.trophyDate, { color: colors.text }]}>
              Unlocked: {item.unlockDate}
            </Text>
          )}
          {!item.unlocked && requirementText !== '' && (
            <Text style={[styles.trophyRequirement, { color: colors.text }]}>
              Requirement: {requirementText}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.button }]}>
          {isEmojiAvatar ? (
            <View style={[styles.iconAvatar, { backgroundColor: colors.background }]}>
              <Text style={styles.iconAvatarText}>{mergedProfile.avatar}</Text>
            </View>
          ) : user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.iconAvatar, { backgroundColor: colors.background }]}>
              <Text style={styles.iconAvatarText}>👤</Text>
            </View>
          )}
          <Text style={[styles.name, { color: colors.text }]}>{mergedProfile.name}</Text>
          <Text style={[styles.username, { color: colors.text }]}>{mergedProfile.username || ''}</Text>
        </View>

        {/* Stats */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Stats</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {mergedProfile.stats.puzzlesSolved}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Puzzles Solved</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {mergedProfile.stats.accuracy}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Accuracy</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {mergedProfile.stats.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Day Streak</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {mergedProfile.stats.totalPlayDays}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Total Play Days</Text>
            </View>
          </View>
        </View>

        {/* Trophies */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Unlocked Trophies</Text>
          {unlockedTrophies.length > 0 ? (
            <FlatList
              data={unlockedTrophies}
              renderItem={renderTrophyItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={[styles.noTrophiesText, { color: colors.text }]}>
              No trophies unlocked yet.
            </Text>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.button }]}
            onPress={handleEditProfile}
          >
            <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.signOutButton, { borderColor: colors.button }]}
            onPress={handleSignOut}
          >
            <Text style={[styles.signOutButtonText, { color: colors.button }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, fontSize: 16 },
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
  iconAvatarText: { fontSize: 60 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  username: { fontSize: 16, marginBottom: 10 },
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '48%', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  statLabel: { fontSize: 12 },
  trophyItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  lockedTrophy: { opacity: 0.6 },
  trophyIcon: { fontSize: 40, marginRight: 15 },
  trophyInfo: { flex: 1 },
  trophyName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  trophyDescription: { fontSize: 14, marginBottom: 4, opacity: 0.9 },
  trophyDate: { fontSize: 12, opacity: 0.7 },
  trophyRequirement: { fontSize: 12, fontStyle: 'italic', opacity: 0.8 },
  noTrophiesText: { fontSize: 16, textAlign: 'center', paddingVertical: 20, opacity: 0.7 },
  buttonContainer: { paddingHorizontal: 20, paddingVertical: 30, gap: 12 },
  editButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  editButtonText: { fontSize: 18, fontWeight: 'bold' },
  signOutButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2 },
  signOutButtonText: { fontSize: 18, fontWeight: 'bold' },
});

export default ProfileScreen;


