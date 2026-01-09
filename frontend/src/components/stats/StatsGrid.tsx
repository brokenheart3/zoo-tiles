import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StatsGridProps {
  children: React.ReactNode;
  columns?: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({ children, columns = 2 }) => {
  return (
    <View style={[styles.container, { flexDirection: 'row', flexWrap: 'wrap' }]}>
      {React.Children.map(children, (child, index) => (
        <View style={[styles.item, { width: `${100 / columns}%` }]}>
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -8,
  },
  item: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
});

export default StatsGrid;