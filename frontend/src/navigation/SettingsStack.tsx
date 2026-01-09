import React, { useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet 
} from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { ThemeContext, themeStyles } from "../context/ThemeContext";
import type { ThemeType } from "../context/ThemeContext";

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

// Custom back button component with proper typing
const CustomBackButton = ({ theme }: { theme: ThemeType }) => {
  const colors = themeStyles[theme]; // Now theme is guaranteed to be ThemeType
  
  return (
    <View style={styles.backButtonContainer}>
      <Text style={[styles.backButtonText, { color: colors.text }]}>‹</Text>
    </View>
  );
};

const SettingsStack = () => {
  const { theme } = useContext(ThemeContext);
  const colors = themeStyles[theme]; // theme is already ThemeType from context

  // Function to get header title based on route
  const getHeaderTitle = (route: any) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'SettingsMenu';
    
    switch (routeName) {
      case 'SettingsMenu':
        return 'Settings';
      case 'AppSettings':
        return 'App Settings';
      case 'Profile':
        return 'My Profile';
      case 'EditProfile':
        return 'Edit Profile';
      case 'Notifications':
        return 'Notifications';
      case 'About':
        return 'About';
      case 'PrivacyPolicy':
        return 'Privacy Policy';
      case 'Terms':
        return 'Terms of Use';
      default:
        return 'Settings';
    }
  };

  // Fixed screen options with proper typing
  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.button,
      elevation: 0,
      shadowOpacity: 0,
      height: 60,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: '600' as const,
      fontSize: 18,
    },
    headerBackTitleVisible: false,
    headerTitleAlign: 'center' as const,
    cardStyle: { backgroundColor: colors.background },
    headerBackImage: () => <CustomBackButton theme={theme} />,
  };

  return (
    <Stack.Navigator 
      initialRouteName="SettingsMenu"
      screenOptions={screenOptions}
    >
      <Stack.Screen 
        name="SettingsMenu" 
        component={SettingsMenuScreen} 
        options={{ 
          headerShown: true,
          title: 'Settings',
        }}
      />
      
      <Stack.Screen 
        name="AppSettings" 
        component={AppSettingsScreen} 
        options={{ 
          title: 'App Settings',
        }}
      />
      
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'My Profile',
        }}
      />
      
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ 
          title: 'Edit Profile',
        }}
      />
      
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ 
          title: 'Notifications',
        }}
      />
      
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ 
          title: 'About',
        }}
      />
      
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen} 
        options={{ 
          title: 'Privacy Policy',
        }}
      />
      
      <Stack.Screen 
        name="Terms" 
        component={TermsScreen} 
        options={{ 
          title: 'Terms of Use',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  backButtonContainer: {
    marginLeft: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    fontWeight: '300' as const,
  },
});

export default SettingsStack;