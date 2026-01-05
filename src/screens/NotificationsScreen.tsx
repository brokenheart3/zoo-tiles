// Notifications.tsx

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NotificationsScreen = () => {
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyChallenge, setWeeklyChallenge] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(true);

  // Load saved preferences
  useEffect(() => {
    (async () => {
      const daily = await AsyncStorage.getItem("dailyReminder");
      const weekly = await AsyncStorage.getItem("weeklyChallenge");
      const promo = await AsyncStorage.getItem("promoAlerts");

      if (daily !== null) setDailyReminder(daily === "true");
      if (weekly !== null) setWeeklyChallenge(weekly === "true");
      if (promo !== null) setPromoAlerts(promo === "true");
    })();
  }, []);

  const toggleSwitch = async (key: string, value: boolean, setter: Function) => {
    setter(value);
    await AsyncStorage.setItem(key, value.toString());
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Notification Settings</Text>

      {/* Daily Reminder */}
      <View style={styles.option}>
        <Text style={styles.label}>Daily Game Reminder</Text>
        <Switch
          value={dailyReminder}
          onValueChange={(val) => toggleSwitch("dailyReminder", val, setDailyReminder)}
          trackColor={{ true: "#81C784", false: "#ccc" }}
          thumbColor={dailyReminder ? "#4FC3F7" : "#f4f3f4"}
        />
      </View>

      {/* Weekly Challenge */}
      <View style={styles.option}>
        <Text style={styles.label}>Weekly Challenge Alerts</Text>
        <Switch
          value={weeklyChallenge}
          onValueChange={(val) => toggleSwitch("weeklyChallenge", val, setWeeklyChallenge)}
          trackColor={{ true: "#81C784", false: "#ccc" }}
          thumbColor={weeklyChallenge ? "#4FC3F7" : "#f4f3f4"}
        />
      </View>

      {/* Promotions */}
      <View style={styles.option}>
        <Text style={styles.label}>Promotional Notifications</Text>
        <Switch
          value={promoAlerts}
          onValueChange={(val) => toggleSwitch("promoAlerts", val, setPromoAlerts)}
          trackColor={{ true: "#81C784", false: "#ccc" }}
          thumbColor={promoAlerts ? "#4FC3F7" : "#f4f3f4"}
        />
      </View>

      <Text style={styles.note}>
        Note: You can customize which notifications you want to receive. Daily and weekly
        alerts will help you stay engaged with the game.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF3E0" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#3E2723" },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#AAA",
  },
  label: { fontSize: 16, color: "#3E2723" },
  note: { fontSize: 12, color: "#555", marginTop: 30, lineHeight: 18 },
});

export default NotificationsScreen;
