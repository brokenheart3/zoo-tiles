import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Settings: undefined;
  Profile: undefined;
};

type GreetingHeaderProps = {
  greeting: string;
  subtitle: string;
  showSettingsPrompt: boolean;
  showProfilePrompt: boolean;
  settingsPromptText: string;
  profilePromptText: string;
  themeColors: any;
  onSettingsPress: () => void;
  onProfilePress: () => void;
};

const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  greeting,
  subtitle,
  showSettingsPrompt,
  showProfilePrompt,
  settingsPromptText,
  profilePromptText,
  themeColors,
  onSettingsPress,
  onProfilePress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={[styles.greeting, { color: themeColors.text }]}>
          {greeting}
        </Text>
        
        <Text style={[styles.greetingSubtitle, { color: themeColors.text }]}>
          {subtitle}
        </Text>
        
        {/* Settings prompt for new users */}
        {showSettingsPrompt && (
          <TouchableOpacity 
            style={[styles.settingsPrompt, { backgroundColor: themeColors.button }]}
            onPress={onSettingsPress}
          >
            <Text style={[styles.settingsPromptText, { color: themeColors.text }]}>
              ⚙️ {settingsPromptText}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Profile completion prompt */}
        {showProfilePrompt && (
          <TouchableOpacity 
            style={[styles.profilePrompt, { backgroundColor: themeColors.button }]}
            onPress={onProfilePress}
          >
            <Text style={[styles.profilePromptText, { color: themeColors.text }]}>
              ✨ {profilePromptText}
            </Text>
          </TouchableOpacity>
        )}
        
        <Text style={[styles.date, { color: themeColors.text }]}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>
      <View style={[styles.logoContainer, { backgroundColor: themeColors.button }]}>
        <Text style={styles.logoEmoji}>🦓</Text>
        <Text style={[styles.logoText, { color: themeColors.text }]}>Zoo-Tiles</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContent: {
    flex: 1,
    marginRight: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  settingsPrompt: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  settingsPromptText: {
    fontSize: 12,
    fontWeight: '600',
  },
  profilePrompt: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  profilePromptText: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  logoEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GreetingHeader;