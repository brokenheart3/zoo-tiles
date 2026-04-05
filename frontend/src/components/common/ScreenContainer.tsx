// src/components/common/ScreenContainer.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Different max widths for different platforms
const getMaxWidth = () => {
  const { width } = Dimensions.get('window');

  if (Platform.OS === 'web') {
    if (width > 1200) return 1000; // Desktop
    if (width > 800) return 800;   // Tablet / small desktop
    return width;
  }

  if (width > 600) return 500; // Tablet
  return width; // Phone
};

interface ScreenContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  extraTopPadding?: number; // Add this prop to control extra spacing
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  backgroundColor = '#fff',
  extraTopPadding = 0, // Default to 0, can be increased
}) => {
  const [maxWidth, setMaxWidth] = useState(getMaxWidth());
  const insets = useSafeAreaInsets(); // Get safe area insets

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setMaxWidth(getMaxWidth());
    });

    return () => subscription?.remove();
  }, []);

  const containerWidth = Math.min(maxWidth, 1200);
  const isWeb = Platform.OS === 'web';

  // Calculate total top padding (safe area + extra)
  const topPadding = insets.top + extraTopPadding;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['left', 'right']} // Remove 'top' from edges to allow custom padding
    >
      <View style={styles.outerContainer}>
        <View
          style={[
            styles.innerContainer,
            isWeb && { maxWidth: containerWidth, alignSelf: 'center' },
            { paddingTop: topPadding }, // Add custom top padding
          ]}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  outerContainer: {
    flex: 1,
    width: '100%',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
  },
});

export default ScreenContainer;