import React, { useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { SettingsStackParamList } from '../navigation/SettingsStack';
import { ThemeContext, themeStyles } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext'; // Add this

type ProfileScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { theme } = useContext(ThemeContext);
  const { profile } = useProfile(); // Get profile from context
  const colors = themeStyles[theme];

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData: profile });
  };

  // Check if avatar is an emoji or URL
  const isEmojiAvatar = profile.avatar && /^[\p{Emoji}\u2000-\u3300]/u.test(profile.avatar);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.button }]}>
          {isEmojiAvatar ? (
            <View style={[styles.iconAvatar, { backgroundColor: colors.background }]}>
              <Text style={styles.iconAvatarText}>{profile.avatar}</Text>
            </View>
          ) : (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          )}
          <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
          <Text style={[styles.username, { color: colors.text }]}>{profile.username}</Text>
          <Text style={[styles.joinDate, { color: colors.text }]}>{profile.joinDate}</Text>
        </View>

        {/* Bio */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.bio, { color: colors.text }]}>{profile.bio}</Text>
        </View>

        {/* Stats */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Stats</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile.stats.puzzlesSolved}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Puzzles Solved</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile.stats.accuracy}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Accuracy</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile.stats.currentStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profile.email}</Text>
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
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
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