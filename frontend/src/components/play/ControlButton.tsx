// src/components/play/ControlButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  small?: boolean; // optional prop
  wide?: boolean;  // optional prop
}

export default function ControlButton({ title, onPress, disabled, small, wide }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        small && styles.small,
        wide && styles.wide,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, small && styles.smallText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  text: { color: 'white', fontWeight: '600' },
  small: { paddingVertical: 5, paddingHorizontal: 8, width: 30 },
  smallText: { fontSize: 14 },
  wide: { minWidth: 60, paddingHorizontal: 12 },
  disabled: { opacity: 0.5 },
});
