import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

interface SettingItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
}

const settingsItems: SettingItem[] = [
  { label: "Profile", icon: "person-circle", screen: "Profile" },
  { label: "About", icon: "information-circle", screen: "About" },
  { label: "Privacy Policy", icon: "lock-closed", screen: "PrivacyPolicy" },
  { label: "Terms of Use", icon: "document-text", screen: "Terms" },
];

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {settingsItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={[
            styles.item,
            selected === item.label ? styles.selectedItem : null,
          ]}
          onPress={() => {
            setSelected(item.label);
            navigation.navigate(item.screen as never); 
          }}
        >
          <Ionicons name={item.icon} size={24} color={selected === item.label ? "blue" : "#333"} />
          <Text style={[styles.text, selected === item.label ? styles.selectedText : null]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  text: { fontSize: 18, marginLeft: 15 },
  selectedItem: {
    backgroundColor: "#e0f0ff",
  },
  selectedText: {
    color: "blue",
    fontWeight: "600",
  },
});

export default SettingsScreen;
