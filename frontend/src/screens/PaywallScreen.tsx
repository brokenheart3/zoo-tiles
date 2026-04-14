// src/screens/PaywallScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSubscription } from '../context/SubscriptionContext';
import { ThemeContext, themeStyles } from '../context/ThemeContext';

const PaywallScreen = () => {
  const { theme } = React.useContext(ThemeContext);
  const colors = themeStyles[theme];
  const { presentPaywall, isLoading, isSubscribed, restorePurchases } = useSubscription();

  if (isSubscribed) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>✨ Sudoku Tiles Pro</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>Unlock the Full Experience</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Feature icon="🎮" text="Unlimited Puzzles" colors={colors} />
          <Feature icon="📅" text="Daily Challenges" colors={colors} />
          <Feature icon="📆" text="Weekly Challenges" colors={colors} />
          <Feature icon="🏆" text="Global Leaderboards" colors={colors} />
          <Feature icon="📊" text="Advanced Statistics" colors={colors} />
          <Feature icon="🎨" text="All 40+ Categories" colors={colors} />
          <Feature icon="🥇" text="Position Tracking" colors={colors} />
          <Feature icon="🔄" text="Sync Across Devices" colors={colors} />
        </View>

        {/* Trial Banner */}
        <View style={[styles.trialBanner, { backgroundColor: colors.button + '20' }]}>
          <Text style={[styles.trialTitle, { color: colors.text }]}>🎁 14-Day Free Trial</Text>
          <Text style={[styles.trialText, { color: colors.text }]}>
            Then only $4.99/month or $49.99/year
          </Text>
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingContainer}>
          {/* Monthly Plan */}
          <TouchableOpacity
            style={[styles.pricingCard, { backgroundColor: colors.button }]}
            onPress={presentPaywall}
            disabled={isLoading}
          >
            <Text style={[styles.planName, { color: colors.text }]}>Monthly</Text>
            <Text style={[styles.planPrice, { color: colors.text }]}>$4.99</Text>
            <Text style={[styles.planPeriod, { color: colors.text + '80' }]}>per month</Text>
            <View style={styles.trialBadge}>
              <Text style={styles.trialBadgeText}>14 days free</Text>
            </View>
          </TouchableOpacity>

          {/* Yearly Plan (Highlighted - Best Value) */}
          <TouchableOpacity
            style={[styles.pricingCard, styles.yearlyCard, { backgroundColor: colors.button, borderColor: '#4CAF50', borderWidth: 2 }]}
            onPress={presentPaywall}
            disabled={isLoading}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            <Text style={[styles.planName, { color: colors.text }]}>Yearly</Text>
            <Text style={[styles.planPrice, { color: colors.text }]}>$49.99</Text>
            <Text style={[styles.planPeriod, { color: colors.text + '80' }]}>per year</Text>
            <Text style={[styles.savingsText, { color: '#4CAF50' }]}>Save 16% vs monthly</Text>
            <Text style={[styles.effectivePrice, { color: colors.text + '80' }]}>Just $4.17/month</Text>
          </TouchableOpacity>

          {/* Lifetime Plan */}
          <TouchableOpacity
            style={[styles.pricingCard, { backgroundColor: colors.button }]}
            onPress={presentPaywall}
            disabled={isLoading}
          >
            <Text style={[styles.planName, { color: colors.text }]}>Lifetime</Text>
            <Text style={[styles.planPrice, { color: colors.text }]}>$99.99</Text>
            <Text style={[styles.planPeriod, { color: colors.text + '80' }]}>one-time payment</Text>
            <Text style={[styles.savingsText, { color: '#4CAF50' }]}>Best long-term value</Text>
          </TouchableOpacity>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, { backgroundColor: '#4CAF50' }]}
          onPress={presentPaywall}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.subscribeButtonText}>Start 14-Day Free Trial</Text>
          )}
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity onPress={restorePurchases} disabled={isLoading}>
          <Text style={[styles.restoreText, { color: colors.text }]}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={[styles.termsText, { color: colors.text + '60' }]}>
          Auto-renews. Cancel anytime. {`\n`}
          Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const Feature = ({ icon, text, colors }: { icon: string; text: string; colors: any }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 30 },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, opacity: 0.7 },
  features: { paddingHorizontal: 24, marginVertical: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  featureIcon: { fontSize: 28, marginRight: 16, width: 40 },
  featureText: { fontSize: 16 },
  trialBanner: { margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  trialTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  trialText: { fontSize: 14, opacity: 0.8 },
  pricingContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  pricingCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
  },
  yearlyCard: {
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bestValueText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 14,
    marginBottom: 8,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  effectivePrice: {
    fontSize: 12,
    marginTop: 2,
  },
  trialBadge: {
    marginTop: 8,
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trialBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  subscribeButton: { margin: 20, marginTop: 10, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  subscribeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  restoreText: { textAlign: 'center', fontSize: 14, marginTop: 10 },
  termsText: { textAlign: 'center', fontSize: 12, marginTop: 20, paddingHorizontal: 20, opacity: 0.6 },
});

export default PaywallScreen;