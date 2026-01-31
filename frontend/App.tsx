import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ProfileProvider } from './src/context/ProfileContext';
import AppNavigator from './src/navigation/AppNavigator';
import { auth, db } from './src/services/firebase';

const App: React.FC = () => {
  console.log('Firebase Auth:', auth);
  console.log('Firestore DB:', db);

  return (
    <SettingsProvider>
      <ThemeProvider>
        <ProfileProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ProfileProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
};

export default App;

