// src/components/play/HintButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface HintButtonProps {
  onPress: () => void;
}

export default function HintButton({ onPress }: HintButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>Hint</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: '600',
  },
});
