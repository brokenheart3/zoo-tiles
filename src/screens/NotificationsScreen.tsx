import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext, themeStyles, ThemeType } from "../context/ThemeContext";

const NotificationsScreen = () => {
  const { theme } = useContext(ThemeContext);
  const colors = themeStyles[theme];
  
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyChallenge, setWeeklyChallenge] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [badgeCount, setBadgeCount] = useState(true);

  // Load saved preferences
  useEffect(() => {
    (async () => {
      const daily = await AsyncStorage.getItem("dailyReminder");
      const weekly = await AsyncStorage.getItem("weeklyChallenge");
      const promo = await AsyncStorage.getItem("promoAlerts");
      const sound = await AsyncStorage.getItem("soundEffects");
      const vib = await AsyncStorage.getItem("vibration");
      const badge = await AsyncStorage.getItem("badgeCount");

      if (daily !== null) setDailyReminder(daily === "true");
      if (weekly !== null) setWeeklyChallenge(weekly === "true");
      if (promo !== null) setPromoAlerts(promo === "true");
      if (sound !== null) setSoundEffects(sound === "true");
      if (vib !== null) setVibration(vib === "true");
      if (badge !== null) setBadgeCount(badge === "true");
    })();
  }, []);

  const toggleSwitch = async (key: string, value: boolean, setter: Function) => {
    setter(value);
    await AsyncStorage.setItem(key, value.toString());
  };

  const getSwitchColor = (isEnabled: boolean) => {
    return isEnabled ? colors.button : colors.text === "#000000" ? "#ccc" : "#666";
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.header, { color: colors.text }]}>Notification Settings</Text>

        {/* Game Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Notifications</Text>
          
          {/* Daily Reminder */}
          <View style={[styles.option, { borderBottomColor: colors.text }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>Daily Game Reminder</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                Remind you to play daily
              </Text>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={(val) => toggleSwitch("dailyReminder", val, setDailyReminder)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={dailyReminder ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Weekly Challenge */}
          <View style={[styles.option, { borderBottomColor: colors.text }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>Weekly Challenge Alerts</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                Notify about weekly challenges
              </Text>
            </View>
            <Switch
              value={weeklyChallenge}
              onValueChange={(val) => toggleSwitch("weeklyChallenge", val, setWeeklyChallenge)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={weeklyChallenge ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Promotions */}
          <View style={[styles.option, { borderBottomColor: colors.text }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>Promotional Notifications</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                News, updates, and offers
              </Text>
            </View>
            <Switch
              value={promoAlerts}
              onValueChange={(val) => toggleSwitch("promoAlerts", val, setPromoAlerts)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={promoAlerts ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Notification Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Preferences</Text>
          
          {/* Sound Effects */}
          <View style={[styles.option, { borderBottomColor: colors.text }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>Sound Effects</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                Play sounds for notifications
              </Text>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={(val) => toggleSwitch("soundEffects", val, setSoundEffects)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={soundEffects ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Vibration */}
          <View style={[styles.option, { borderBottomColor: colors.text }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>Vibration</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                Vibrate on notifications
              </Text>
            </View>
            <Switch
              value={vibration}
              onValueChange={(val) => toggleSwitch("vibration", val, setVibration)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={vibration ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Badge Count */}
          <View style={[styles.option, { borderBottomColor: colors.text }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.label, { color: colors.text }]}>App Icon Badge</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                Show unread count on app icon
              </Text>
            </View>
            <Switch
              value={badgeCount}
              onValueChange={(val) => toggleSwitch("badgeCount", val, setBadgeCount)}
              trackColor={{ true: colors.button, false: `${colors.button}40` }}
              thumbColor={badgeCount ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Notification Summary */}
        <View style={[styles.summaryCard, { backgroundColor: `${colors.button}20` }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Current Settings</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Enabled Notifications:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {[dailyReminder, weeklyChallenge, promoAlerts].filter(Boolean).length}/3
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Sound:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {soundEffects ? "On" : "Off"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Vibration:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {vibration ? "On" : "Off"}
            </Text>
          </View>
        </View>

        <Text style={[styles.note, { color: colors.text }]}>
          Note: You can customize which notifications you want to receive. Daily and weekly
          alerts will help you stay engaged with the game. Changes take effect immediately.
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
