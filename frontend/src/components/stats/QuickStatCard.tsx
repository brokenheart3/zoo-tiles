import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface QuickStatCardProps {
  value?: string | number;
  label: string;
  icon?: string;
  valueColor?: string;
  backgroundColor: string;
  textColor: string;
  size?: 'small' | 'medium' | 'large';
}

const QuickStatCard: React.FC<QuickStatCardProps> = ({
  value = '-', // default to '-' if undefined
  label,
  icon,
  valueColor,
  backgroundColor,
  textColor,
  size = 'medium',
}) => {
  const getFontSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 32;
      default: return 28;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.value, { 
        color: valueColor || textColor,
        fontSize: getFontSize()
      }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: 120,
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  value: {
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default QuickStatCard;
