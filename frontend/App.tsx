// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { AuthProvider } from './src/context/AuthContext';
import { GameModeProvider } from './src/context/GameModeContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { Platform } from 'react-native';
import { initializeNotifications } from './src/services/notificationService';
import ScreenContainer from './src/components/common/ScreenContainer';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import Constants from 'expo-constants';

// Get API keys from environment variables
const REVENUECAT_IOS_API_KEY = Constants.expoConfig?.extra?.REVENUECAT_IOS_API_KEY || process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const REVENUECAT_ANDROID_API_KEY = Constants.expoConfig?.extra?.REVENUECAT_ANDROID_API_KEY || process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

const App: React.FC = () => {
  useEffect(() => {
    // Initialize RevenueCat
    const initializeRevenueCat = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
        
        if (Platform.OS === 'ios') {
          if (REVENUECAT_IOS_API_KEY) {
            await Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
            console.log('✅ RevenueCat configured for iOS');
          } else {
            console.warn('⚠️ RevenueCat iOS API key not found');
          }
        } else if (Platform.OS === 'android') {
          if (REVENUECAT_ANDROID_API_KEY) {
            await Purchases.configure({ apiKey: REVENUECAT_ANDROID_API_KEY });
            console.log('✅ RevenueCat configured for Android');
          } else {
            console.warn('⚠️ RevenueCat Android API key not found');
          }
        }
      } catch (error) {
        console.error('Failed to configure RevenueCat:', error);
      }
    };
    
    initializeRevenueCat();
    
    // Initialize notifications
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
              <SubscriptionProvider>
                <GameModeProvider>
                  <NavigationContainer ref={navigationRef}>
                    <ScreenContainer extraTopPadding={20}>
                      <RootNavigator />
                    </ScreenContainer>
                  </NavigationContainer>
                </GameModeProvider>
              </SubscriptionProvider>
            </ProfileProvider>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;