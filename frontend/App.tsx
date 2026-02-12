// App.tsx
import React from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { AuthProvider } from './src/context/AuthContext'; // Add this
import AppNavigator from './src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          <ProfileProvider>
            <AppNavigator />
          </ProfileProvider>
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
