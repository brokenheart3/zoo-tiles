// src/components/PaywallButton.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { presentPaywall } from '../services/paywallService';
import { useSubscription } from '../context/SubscriptionContext';

interface PaywallButtonProps {
  title?: string;
  buttonStyle?: object;
  textStyle?: object;
  onPurchaseComplete?: () => void;
  onPurchaseCancelled?: () => void;
}

export const PaywallButton: React.FC<PaywallButtonProps> = ({
  title = 'Unlock Premium',
  buttonStyle,
  textStyle,
  onPurchaseComplete,
  onPurchaseCancelled,
}) => {
  const [loading, setLoading] = useState(false);
  const { refreshStatus, isSubscribed } = useSubscription();

  const handlePress = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await presentPaywall();
      
      if (result.purchased || result.restored) {
        await refreshStatus();
        Alert.alert('Success!', 'Thank you for subscribing!');
        onPurchaseComplete?.();
      } else if (result.cancelled) {
        onPurchaseCancelled?.();
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error in paywall:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if already subscribed
  if (isSubscribed) return null;

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});