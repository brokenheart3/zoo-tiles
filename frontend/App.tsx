// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { AuthProvider } from './src/context/AuthContext';
import { GameModeProvider } from './src/context/GameModeContext'; // Add this import
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { Platform } from 'react-native';
import { initializeNotifications } from './src/services/notificationService';
import ScreenContainer from './src/components/common/ScreenContainer';

const App: React.FC = () => {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      initializeNotifications();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>
          <ThemeProvider>
            <ProfileProvider>
              <GameModeProvider> {/* Add this provider */}
                <NavigationContainer ref={navigationRef}>
                  <ScreenContainer extraTopPadding={20}>
                    <RootNavigator />
                  </ScreenContainer>
                </NavigationContainer>
              </GameModeProvider>
            </ProfileProvider>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;