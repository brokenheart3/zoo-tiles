// App.tsx
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { Platform } from 'react-native';
import { initializeNotifications } from './src/services/notificationService';
import ScreenContainer from './src/components/common/ScreenContainer'; // Add this import

const App: React.FC = () => {
  useEffect(() => {
  if (Platform.OS !== 'web') {
    initializeNotifications();
  }
}, []);

  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          <ProfileProvider>
            <NavigationContainer ref={navigationRef}>
              <ScreenContainer> {/* Wrap with ScreenContainer */}
                <RootNavigator />
              </ScreenContainer>
            </NavigationContainer>
          </ProfileProvider>
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;