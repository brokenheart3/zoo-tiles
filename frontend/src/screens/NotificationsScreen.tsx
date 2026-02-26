// src/screens/NotificationsScreen.tsx
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext, themeStyles } from "../context/ThemeContext";
import { Platform } from 'react-native';

const NotificationsScreen = () => {
  const { theme } = useContext(ThemeContext);
  const colors = themeStyles[theme];
  
  // Simple state
  const [daily, setDaily] = useState(true);
  const [weekly, setWeekly] = useState(true);
  const [promo, setPromo] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibe, setVibe] = useState(true);
  const [badge, setBadge] = useState(true);

  // Load on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const daily = await AsyncStorage.getItem("dailyReminder");
      const weekly = await AsyncStorage.getItem("weeklyChallenge");
      const promo = await AsyncStorage.getItem("promoAlerts");
      const sound = await AsyncStorage.getItem("soundEffects");
      const vib = await AsyncStorage.getItem("vibration");
      const badge = await AsyncStorage.getItem("badgeCount");

      if (daily !== null) setDaily(daily === "true");
      if (weekly !== null) setWeekly(weekly === "true");
      if (promo !== null) setPromo(promo === "true");
      if (sound !== null) setSound(sound === "true");
      if (vib !== null) setVibe(vib === "true");
      if (badge !== null) setBadge(badge === "true");
    } catch (error) {
      console.error('Error loading:', error);
    }
  };

  const toggleSwitch = async (key: string, value: boolean, setter: Function) => {
    try {
      console.log(`Toggling ${key} to ${value}`);
      
      // Update UI immediately
      setter(value);
      
      // Save to storage
      await AsyncStorage.setItem(key, value.toString());
      
      // Verify it was saved
      const saved = await AsyncStorage.getItem(key);
      console.log(`Saved ${key}=${saved}`);
      
    } catch (error) {
      console.error('Error toggling:', error);
      // Revert on error
      setter(!value);
    }
  };

  const turnAllOff = async () => {
      await toggleSwitch('dailyReminder', false, setDaily);
      await toggleSwitch('weeklyChallenge', false, setWeekly);
      await toggleSwitch('promoAlerts', false, setPromo);
      await toggleSwitch('soundEffects', false, setSound);
      await toggleSwitch('vibration', false, setVibe);
      await toggleSwitch('badgeCount', false, setBadge);
      Alert.alert('✅ All notifications disabled');
    };
  
    const resetAll = async () => {
      await toggleSwitch('dailyReminder', true, setDaily);
      await toggleSwitch('weeklyChallenge', true, setWeekly);
      await toggleSwitch('promoAlerts', true, setPromo);
      await toggleSwitch('soundEffects', true, setSound);
      await toggleSwitch('vibration', true, setVibe);
      await toggleSwitch('badgeCount', true, setBadge);
      Alert.alert('✅ All notifications enabled');
    };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.header, { color: colors.text }]}>Notification Settings</Text>

        {/* Game Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Notifications</Text>
          
          {/* Daily Reminder */}
          <View style={[styles.option, { borderBottomColor: colors.text + '30' }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>Daily Game Reminder</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                Remind you to play daily at 9 AM
              </Text>
            </View>
            <Switch
              value={daily}
              onValueChange={(val) => toggleSwitch("dailyReminder", val, setDaily)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={daily ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Weekly Challenge */}
          <View style={[styles.option, { borderBottomColor: colors.text + '30' }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>Weekly Challenge Alerts</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                Notify about new weekly challenges on Sundays
              </Text>
            </View>
            <Switch
              value={weekly}
              onValueChange={(val) => toggleSwitch("weeklyChallenge", val, setWeekly)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={weekly ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Promotions */}
          <View style={[styles.option, { borderBottomColor: colors.text + '30' }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>Promotional Notifications</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                News, updates, and special offers
              </Text>
            </View>
            <Switch
              value={promo}
              onValueChange={(val) => toggleSwitch("promoAlerts", val, setPromo)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={promo ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Notification Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Preferences</Text>
          
          {/* Sound Effects */}
          <View style={[styles.option, { borderBottomColor: colors.text + '30' }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>Sound Effects</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                Play sounds for notifications
              </Text>
            </View>
            <Switch
              value={sound}
              onValueChange={(val) => toggleSwitch("soundEffects", val, setSound)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={sound ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Vibration */}
          <View style={[styles.option, { borderBottomColor: colors.text + '30' }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>Vibration</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                Vibrate on notifications
              </Text>
            </View>
            <Switch
              value={vibe}
              onValueChange={(val) => toggleSwitch("vibration", val, setVibe)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={vibe ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Badge Count */}
          <View style={[styles.option, { borderBottomColor: colors.text + '30' }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>App Icon Badge</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                Show unread count on app icon
              </Text>
            </View>
            <Switch
              value={badge}
              onValueChange={(val) => toggleSwitch("badgeCount", val, setBadge)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={badge ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#f44336' }]}
            onPress={turnAllOff}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Turn All Off</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#4CAF50' }]}
            onPress={resetAll}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Reset to Default</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: `${colors.button}20` }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Current Settings</Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Daily Reminder:</Text>
            <Text style={[styles.summaryValue, { color: daily ? '#4CAF50' : '#f44336' }]}>
              {daily ? "9:00 AM" : "Off"}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Weekly Challenge:</Text>
            <Text style={[styles.summaryValue, { color: weekly ? '#4CAF50' : '#f44336' }]}>
              {weekly ? "Sunday 10:00 AM" : "Off"}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Sound:</Text>
            <Text style={[styles.summaryValue, { color: sound ? '#4CAF50' : '#f44336' }]}>
              {sound ? "On" : "Off"}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Vibration:</Text>
            <Text style={[styles.summaryValue, { color: vibe ? '#4CAF50' : '#f44336' }]}>
              {vibe ? "On" : "Off"}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Badge Count:</Text>
            <Text style={[styles.summaryValue, { color: badge ? '#4CAF50' : '#f44336' }]}>
              {badge ? "On" : "Off"}
            </Text>
          </View>
        </View>

        <Text style={[styles.note, { color: colors.text }]}>
          Note: Notification times are based on your device's local time. 
          Make sure to enable notifications in your device settings for the best experience.
          {Platform.OS === 'ios' && ' Vibration may not be available on all iOS devices.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionInfo: {
    flex: 1,
    marginRight: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    marginTop: 10,
  },
  button: {
    flex: 0.48,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  summaryCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  note: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 20,
  },
});

export default NotificationsScreen;