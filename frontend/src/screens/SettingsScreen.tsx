// src/screens/SettingsScreen.tsx
import React, { useState, useContext } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSubscription } from "../context/SubscriptionContext";
import { ThemeContext, themeStyles } from "../context/ThemeContext";

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
  const { theme } = useContext(ThemeContext);
  const colors = themeStyles[theme];
  const { isSubscribed, presentPaywall, trialDaysRemaining, restorePurchases, isLoading } = useSubscription();
  const [selected, setSelected] = useState<string | null>(null);

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      alert("Purchases restored successfully!");
    } else {
      alert("No previous purchases found.");
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Subscription Section */}
      <View style={[styles.subscriptionSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
          {isSubscribed ? "✨ Premium Member" : "🔓 Upgrade to Premium"}
        </Text>
        
        {isSubscribed ? (
          <View style={styles.premiumCard}>
            <Text style={[styles.premiumText, { color: colors.text }]}>
              ✅ You have full access to all features!
            </Text>
            {trialDaysRemaining > 0 && (
              <Text style={[styles.trialText, { color: colors.text }]}>
                🎁 {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} left in your free trial
              </Text>
            )}
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>⭐ PREMIUM ACTIVE</Text>
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.benefitsText, { color: colors.text }]}>
              Get unlimited access to:
            </Text>
            <View style={styles.benefitsList}>
              <Benefit text="✓ All daily challenges" colors={colors} />
              <Benefit text="✓ Weekly challenges" colors={colors} />
              <Benefit text="✓ Unlimited quick play" colors={colors} />
              <Benefit text="✓ All 40+ categories" colors={colors} />
              <Benefit text="✓ Leaderboards & rankings" colors={colors} />
              <Benefit text="✓ Detailed statistics" colors={colors} />
              <Benefit text="✓ Position tracking" colors={colors} />
            </View>
            
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={presentPaywall}
              disabled={isLoading}
            >
              <Text style={styles.upgradeButtonText}>
                🎁 Start 14-Day Free Trial
              </Text>
            </TouchableOpacity>
            
            {trialDaysRemaining === 0 && (
              <Text style={[styles.trialNote, { color: colors.text + '80' }]}>
                First 14 days free, then ${isSubscribed ? '' : '4.99/month'}
              </Text>
            )}
          </>
        )}
        
        <TouchableOpacity 
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isLoading}
        >
          <Text style={[styles.restoreButtonText, { color: colors.text }]}>
            Restore Purchases
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings Items */}
      <View style={styles.divider} />
      
      {settingsItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={[
            styles.item,
            { borderBottomColor: colors.border },
            selected === item.label ? styles.selectedItem : null,
          ]}
          onPress={() => {
            setSelected(item.label);
            navigation.navigate(item.screen as never); 
          }}
        >
          <Ionicons name={item.icon} size={24} color={selected === item.label ? colors.button : colors.text} />
          <Text style={[styles.text, { color: colors.text }, selected === item.label ? styles.selectedText : null]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Benefit component
const Benefit = ({ text, colors }: { text: string; colors: any }) => (
  <Text style={[styles.benefitText, { color: colors.text }]}>{text}</Text>
);

const styles = StyleSheet.create({
  container: { 
    padding: 20,
    flexGrow: 1,
  },
  subscriptionSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subscriptionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  benefitsText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
    opacity: 0.8,
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitText: {
    fontSize: 14,
    marginBottom: 6,
  },
  premiumCard: {
    alignItems: "center",
  },
  premiumText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  trialText: {
    fontSize: 14,
    marginBottom: 12,
  },
  premiumBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  premiumBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  upgradeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  trialNote: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  restoreButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  restoreButtonText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  text: { 
    fontSize: 18, 
    marginLeft: 15 
  },
  selectedItem: {
    backgroundColor: "#e0f0ff",
  },
  selectedText: {
    fontWeight: "600",
  },
});

export default SettingsScreen;
