import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import SettingsMenuScreen from "../screens/SettingsMenuScreen";
import AppSettingsScreen from "../screens/AppSettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import AboutScreen from "../screens/AboutScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import TermsScreen from "../screens/TermsScreen";

export type SettingsStackParamList = {
  SettingsMenu: undefined;
  AppSettings: undefined;
  Profile: undefined;
  EditProfile: { userData: any };
  Notifications: undefined;
  About: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: '#667eea',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        // Remove headerBackTitleVisible - it's not supported in newer versions
        cardStyle: { backgroundColor: '#f5f5f7' },
      }}
    >
      <Stack.Screen 
        name="SettingsMenu" 
        component={SettingsMenuScreen} 
        options={{ headerShown: false }} // Hide header for main menu
      />
      <Stack.Screen 
        name="AppSettings" 
        component={AppSettingsScreen} 
        options={{ title: 'App Settings' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'About' }}
      />
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen} 
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen 
        name="Terms" 
        component={TermsScreen} 
        options={{ title: 'Terms of Use' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsStack;