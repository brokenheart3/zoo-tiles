import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SettingsScreen from "../screens/SettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AboutScreen from "../screens/AboutScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import TermsScreen from "../screens/TermsScreen";

const Stack = createNativeStackNavigator();

const SettingsStack = () => {
  return (
    <Stack.Navigator>
      {/* Main Settings Menu */}
      <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: "Settings" }} />
      
      {/* Stack screens */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: "Privacy Policy" }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ title: "Terms of Use" }} />
    </Stack.Navigator>
  );
};

export default SettingsStack;

