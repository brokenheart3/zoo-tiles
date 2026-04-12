// src/services/subscriptionService.ts
import Purchases, { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';

// Note: The API keys are configured in RevenueCat dashboard, not in code
// You need to set them up in RevenueCat and add them to your app

class SubscriptionService {
  private static instance: SubscriptionService;
  private initialized = false;

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // For Expo, you need to configure RevenueCat in your app.json
      // The API keys are set there, not in code
      await Purchases.configure({
        apiKey: Platform.OS === 'ios' ? 'appl_xxxxxxxxxxxxx' : 'goog_xxxxxxxxxxxxx',
      });
      this.initialized = true;
      console.log('✅ RevenueCat initialized');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    }
  }

  // Rest of the service remains the same...
}

export const subscriptionService = SubscriptionService.getInstance();