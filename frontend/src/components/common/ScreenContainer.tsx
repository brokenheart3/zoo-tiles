// src/components/common/ScreenContainer.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';

// Different max widths for different platforms
const getMaxWidth = () => {
  const { width } = Dimensions.get('window');
  
  if (Platform.OS === 'web') {
    // On web, use larger max widths
    if (width > 1200) return 1000; // Desktop
    if (width > 800) return 800;    // Small desktop / large tablet
    return width; // Mobile web
  }
  
  // On mobile, use standard mobile widths
  if (width > 600) return 500; // Tablet
  return width; // Phone
};

interface ScreenContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({ 
  children, 
  backgroundColor = '#fff' 
}) => {
  const [maxWidth, setMaxWidth] = useState(getMaxWidth());

  useEffect(() => {
    // Update on orientation changes
    const subscription = Dimensions.addEventListener('change', () => {
      setMaxWidth(getMaxWidth());
    });

    return () => subscription?.remove();
  }, []);

  const containerWidth = Math.min(maxWidth, 1200); // Absolute max of 1200px

  return (
    <View style={[styles.outerContainer, { backgroundColor }]}>
      <View style={[styles.innerContainer, { maxWidth: containerWidth }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
  },
});

export default ScreenContainer;