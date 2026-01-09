import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime } from '../../utils/formatters'; // Import from shared utils

interface TimeDisplayProps {
  minutes: number;
  label?: string;
  textColor: string;
  showLabel?: boolean;
  compact?: boolean;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  minutes,
  label = 'Play Time',
  textColor,
  showLabel = true,
  compact = false,
}) => {
  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
      <Text style={[styles.time, { color: textColor }]}>
        {formatTime(minutes, compact)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TimeDisplay;