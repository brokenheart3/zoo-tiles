import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type SettingsLinkProps = {
  hasCustomSettings: boolean;
  themeColors: any;
  onPress: () => void;
};

const SettingsLink: React.FC<SettingsLinkProps> = ({
  hasCustomSettings,
  themeColors,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.settingsLink, { borderColor: themeColors.text + '50' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.settingsLinkText, { color: themeColors.text }]}>
        ⚙️ {hasCustomSettings ? 'Manage your settings' : 'Configure your game settings'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingsLink: {
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  settingsLinkText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SettingsLink;