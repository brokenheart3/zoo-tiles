// src/screen/ChallengeScreen.tsx
import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import DailyChallengeScreen from "./DailyChallengeScreen";
import WeeklyChallengeScreen from "./WeeklyChallengeScreen";

const Tab = createMaterialTopTabNavigator();

const ChallengeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
        tabBarIndicatorStyle: { backgroundColor: "blue" },
        tabBarLabelStyle: { fontWeight: "bold" },
      }}
    >
      <Tab.Screen name="Daily" component={DailyChallengeScreen} />
      <Tab.Screen name="Weekly" component={WeeklyChallengeScreen} />
    </Tab.Navigator>
  );
};

export default ChallengeScreen;
