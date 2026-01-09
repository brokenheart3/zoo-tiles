import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type AppFooterProps = {
  textColor?: string;
  version?: string;
};

const AppFooter: React.FC<AppFooterProps> = ({
  textColor = '#333',
  version = '1.0.0',
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.appName, { color: textColor }]}>
        🦓 Zoo-Tiles - Animal Puzzle Adventure
      </Text>
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
    marginBottom: 4,
  },
  version: {
    fontSize: 12,
  },
});

export default AppFooter;