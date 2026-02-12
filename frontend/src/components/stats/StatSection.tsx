import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatSectionProps {
  title: string;
  children: React.ReactNode;
  textColor: string;
  showDivider?: boolean;
}

const StatSection: React.FC<StatSectionProps> = ({
  title,
  children,
  textColor,
  showDivider = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {showDivider && <View style={styles.divider} />}
      <View>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
});

export default StatSection;
