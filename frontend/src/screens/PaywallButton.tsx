// src/components/PaywallButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useSubscription } from '../context/SubscriptionContext';
import { ThemeContext, themeStyles } from '../context/ThemeContext';

interface PaywallButtonProps {
  title?: string;
  compact?: boolean;
  onPress?: () => void;
}

export const PaywallButton: React.FC<PaywallButtonProps> = ({ 
  title = "Upgrade to Premium", 
  compact = false,
  onPress 
}) => {
  const { theme } = React.useContext(ThemeContext);
  const colors = themeStyles[theme];
  const { isSubscribed, presentPaywall, trialDaysRemaining } = useSubscription();

  if (isSubscribed) return null;

  const handlePress = async () => {
    if (onPress) {
      onPress();
    }
    await presentPaywall();
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        compact ? styles.compactButton : styles.fullButton,
        { backgroundColor: colors.button }
      ]}
      onPress={handlePress}
    >
      <Text style={[styles.buttonText, { color: colors.text }]}>
        {compact ? '⭐' : `🎁 ${trialDaysRemaining > 0 ? `${trialDaysRemaining} days left! ` : ''}${title}`}
      </Text>
      {!compact && trialDaysRemaining > 0 && (
        <Text style={[styles.subText, { color: colors.text + 'CC' }]}>
          Start 14-day free trial
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 200,
  },
  compactButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 12,
    marginTop: 4,
  },
});