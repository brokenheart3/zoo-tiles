// src/screens/PaywallScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useSubscription } from '../context/SubscriptionContext';
import { ThemeContext, themeStyles } from '../context/ThemeContext';

const PaywallScreen = () => {
  const { theme } = React.useContext(ThemeContext);
  const colors = themeStyles[theme];
  const { presentPaywall, isLoading, isSubscribed } = useSubscription();

  const handleSubscribe = async () => {
    const success = await presentPaywall();
    if (success) {
      // Subscription successful - screen will close due to state change
    }
  };

  const handleRestore = async () => {
    // This is handled by the paywall's restore button
    await presentPaywall();
  };

  if (isSubscribed) {
    // If already subscribed, we shouldn't be here
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Unlock Premium</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Get access to all features
        </Text>

        <View style={styles.features}>
          <Feature text="✓ Unlimited puzzles" colors={colors} />
          <Feature text="✓ All daily challenges" colors={colors} />
          <Feature text="✓ Weekly challenges" colors={colors} />
          <Feature text="✓ Compete on leaderboards" colors={colors} />
          <Feature text="✓ Advanced statistics" colors={colors} />
          <Feature text="✓ All 40+ categories" colors={colors} />
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, { backgroundColor: '#4CAF50' }]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.subscribeButtonText}>Start 14-Day Free Trial</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} disabled={isLoading}>
          <Text style={[styles.restoreText, { color: colors.text + '80' }]}>
            Restore Purchases
          </Text>
        </TouchableOpacity>

        <Text style={[styles.termsText, { color: colors.text + '60' }]}>
          Auto-renews. Cancel anytime.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const Feature = ({ text, colors }: { text: string; colors: any }) => (
  <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, opacity: 0.7 },
  features: { marginBottom: 30 },
  featureText: { fontSize: 16, marginBottom: 12, textAlign: 'center' },
  subscribeButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  subscribeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  restoreText: { textAlign: 'center', fontSize: 14, marginTop: 10 },
  termsText: { textAlign: 'center', fontSize: 12, marginTop: 20 },
});

export default PaywallScreen;