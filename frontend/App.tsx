// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { AuthProvider } from './src/context/AuthContext';
import { GameModeProvider } from './src/context/GameModeContext';
import { SubscriptionProvider, useSubscription } from './src/context/SubscriptionContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { Platform } from 'react-native';
import { initializeNotifications } from './src/services/notificationService';
import ScreenContainer from './src/components/common/ScreenContainer';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import Constants from 'expo-constants';
import PaywallScreen from './src/screens/PaywallScreen';
import { ThemeContext, themeStyles } from './src/context/ThemeContext';

// Get API keys from environment variables
const REVENUECAT_IOS_API_KEY = Constants.expoConfig?.extra?.REVENUECAT_IOS_API_KEY || process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const REVENUECAT_ANDROID_API_KEY = Constants.expoConfig?.extra?.REVENUECAT_ANDROID_API_KEY || process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

// Loading screen component
const LoadingScreen = () => {
  const { theme } = React.useContext(ThemeContext);
  const colors = themeStyles[theme];
  
  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.button} />
      <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
    </View>
  );
};

// Main app content with subscription check
const AppContent = () => {
  const { isSubscribed, isLoading, showPaywall, setShowPaywall } = useSubscription();
  const { theme } = React.useContext(ThemeContext);
  const colors = themeStyles[theme];
  
  // Show loading screen while checking subscription
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // Show paywall for non-subscribed users
  if (!isSubscribed && showPaywall) {
    return <PaywallScreen />;
  }
  
  // Show main app for subscribed users or when paywall is dismissed
  return (
    <NavigationContainer ref={navigationRef}>
      <ScreenContainer extraTopPadding={20}>
        <RootNavigator />
      </ScreenContainer>
    </NavigationContainer>
  );
};

// Wrapper component that provides all contexts
const AppWithProviders = () => {
  const [isReady, setIsReady] = useState(false);

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
    
    const initialize = async () => {
      await initializeRevenueCat();
      
      // Initialize notifications
      if (Platform.OS !== 'web') {
        initializeNotifications();
      }
      
      setIsReady(true);
    };
    
    initialize();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>
          <ThemeProvider>
            <ProfileProvider>
              <SubscriptionProvider>
                <GameModeProvider>
                  <AppContent />
                </GameModeProvider>
              </SubscriptionProvider>
            </ProfileProvider>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

const App: React.FC = () => {
  return <AppWithProviders />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default App;