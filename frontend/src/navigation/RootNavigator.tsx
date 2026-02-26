// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import BottomTabs from './BottomTabs';
import ChallengeResults from '../screens/ChallengeResults';
import PlayScreen from '../screens/PlayScreen';
import GameResultsScreen from '../screens/GameResultsScreen';

// Update the type to include navigation for notifications
export type RootStackParamList = {
  Main: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ChallengeResults: {
    challengeId: string;
    challengeType: 'daily' | 'weekly';
    time?: number;
    isPerfect?: boolean;
    moves?: number;
    correctMoves?: number;
    wrongMoves?: number;
    accuracy?: number;
    completed?: boolean;
  };
  Play: {
    gridSize: string;
    difficulty: string;
    challengeType?: 'daily' | 'weekly';
    challengeId?: string;
  };
  GameResults: {
    time: number;
    isPerfect: boolean;
    mode: string;
    difficulty: string;
    gridSize: string;
    moves: number;
  };
  Home: undefined;
  Settings: undefined;
  Profile: undefined;
  Challenge: {
    screen: 'Daily' | 'Weekly';
    challengeId?: string;
    viewResults?: boolean;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { user, loading } = useAuth();

  console.log('🔥 RootNavigator - user:', user);
  console.log('🔥 RootNavigator - loading:', loading);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={BottomTabs} />
          <Stack.Screen name="ChallengeResults" component={ChallengeResults} />
          <Stack.Screen name="Play" component={PlayScreen} />
          <Stack.Screen name="GameResults" component={GameResultsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen 
            name="SignUp" 
            component={SignUpScreen} 
            options={{
              headerShown: true,
              title: 'Create Account',
              headerBackTitle: 'Back',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;