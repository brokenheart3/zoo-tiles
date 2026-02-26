// src/navigation/navigationRef.ts
import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './RootNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}

// Helper function to navigate to challenge screens
export function navigateToChallenge(type: 'daily' | 'weekly') {
  if (navigationRef.isReady()) {
    // First navigate to Main (BottomTabs)
    navigationRef.navigate('Main');
    // Then we need to navigate to the Challenge tab and specific screen
    // This will be handled by the notification listener with a slight delay
    setTimeout(() => {
      // You might need to use a different approach here
      console.log(`Navigating to ${type} challenge`);
    }, 500);
  }
}