import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  fillColor: string;
  textColor: string;
  showLabel?: boolean;
  showPercentage?: boolean;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  total,
  fillColor,
  textColor,
  showLabel = true,
  showPercentage = true,
  height = 8,
}) => {
  const percentage = Math.min((current / total) * 100, 100);
  const isComplete = current >= total;

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.header}>
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          {showPercentage && (
            <Text style={[styles.percentage, { color: textColor }]}>
              {isComplete ? '✓ ' : ''}{Math.round(percentage)}%
            </Text>
          )}
        </View>
      )}
      <View style={[styles.bar, { height }]}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${percentage}%`,
              backgroundColor: fillColor
            }
          ]} 
        />
      </View>
      <View style={styles.stats}>
        <Text style={[styles.current, { color: textColor }]}>{current}</Text>
        <Text style={[styles.total, { color: textColor }]}>/ {total}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  bar: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  current: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  total: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default ProgressBar;