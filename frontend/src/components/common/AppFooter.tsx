// src/components/common/AppFooter.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

type AppFooterProps = {
  textColor?: string;
  version?: string;
};

const AppFooter: React.FC<AppFooterProps> = ({
  textColor = '#333',
  version = '1.0.0',
}) => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:sudokutiles1@gmail.com?subject=Zootiles%20Support');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.appName, { color: textColor }]}>
        🦓 Zoo-Tiles - Animal Puzzle Adventure
      </Text>
      
      {/* Add contact email here */}
      <TouchableOpacity onPress={handleEmailPress} activeOpacity={0.7}>
        <Text style={[styles.contact, { color: textColor, opacity: 0.7 }]}>
          📧 sudokutiles1@gmail.com
        </Text>
      </TouchableOpacity>
      
      <Text style={[styles.version, { color: textColor, opacity: 0.7 }]}>
        Version {version}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  contact: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  version: {
    fontSize: 12,
  },
});

export default AppFooter;