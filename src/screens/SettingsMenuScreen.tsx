import React, { useContext } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { SettingsStackParamList } from "../navigation/SettingsStack";
import { ThemeContext, ThemeType, themeStyles } from "../context/ThemeContext"; // Fixed import

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

const SettingsMenuScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useContext(ThemeContext);

  // Use exported themeStyles
  const currentTheme = themeStyles[theme];

  // List of settings pages - Add Terms to the list
  const pages: { label: string; screen: keyof SettingsStackParamList }[] = [
    { label: "App Settings", screen: "AppSettings" },
    { label: "Profile", screen: "Profile" },
    { label: "Notifications", screen: "Notifications" },
    { label: "About", screen: "About" },
    { label: "Privacy Policy", screen: "PrivacyPolicy" },
    { label: "Terms of Use", screen: "Terms" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      contentContainerStyle={{ padding: 20 }}
    >
      {pages.map((page) => (
        <TouchableOpacity
          key={page.screen}
          style={[styles.button, { backgroundColor: currentTheme.button }]}
          onPress={() => navigation.navigate(page.screen as any)} // Cast to any for now
        >
          <Text style={[styles.buttonText, { color: currentTheme.text }]}>{page.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default SettingsMenuScreen;
