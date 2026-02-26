// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './RootNavigator'; // This is a default export
import ScreenContainer from '../components/common/ScreenContainer';

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <ScreenContainer>
        <RootNavigator />
      </ScreenContainer>
    </NavigationContainer>
  );
};

export default AppNavigator;