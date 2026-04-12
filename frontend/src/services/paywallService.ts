// src/services/paywallService.ts
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

export interface PaywallResult {
  completed: boolean;
  purchased: boolean;
  restored: boolean;
  cancelled: boolean;
  error?: string;
}

/**
 * Present the RevenueCat paywall for the current offering
 */
export async function presentPaywall(): Promise<PaywallResult> {
  try {
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
        console.log('✅ User purchased successfully');
        return { completed: true, purchased: true, restored: false, cancelled: false };
        
      case PAYWALL_RESULT.RESTORED:
        console.log('✅ User restored purchases');
        return { completed: true, purchased: false, restored: true, cancelled: false };
        
      case PAYWALL_RESULT.CANCELLED:
        console.log('❌ User cancelled');
        return { completed: false, purchased: false, restored: false, cancelled: true };
        
      case PAYWALL_RESULT.NOT_PRESENTED:
        console.log('⚠️ Paywall not presented');
        return { completed: false, purchased: false, restored: false, cancelled: true, error: 'Paywall not presented' };
        
      case PAYWALL_RESULT.ERROR:
        console.log('❌ Paywall error');
        return { completed: false, purchased: false, restored: false, cancelled: true, error: 'Paywall error' };
        
      default:
        return { completed: false, purchased: false, restored: false, cancelled: true };
    }
  } catch (error: any) {
    console.error('Error presenting paywall:', error);
    return { 
      completed: false, 
      purchased: false, 
      restored: false, 
      cancelled: true, 
      error: error.message 
    };
  }
}

/**
 * Get offerings and present paywall for a specific offering
 * First fetch the offering by ID, then present the paywall for that offering
 */
export async function presentPaywallForOffering(offeringIdentifier: string): Promise<PaywallResult> {
  try {
    // First, get the offerings
    const offerings = await Purchases.getOfferings();
    const offering = offerings.current;
    
    // Check if we have the requested offering
    if (!offering || offering.identifier !== offeringIdentifier) {
      console.log(`Offering ${offeringIdentifier} not found, using current offering`);
      return await presentPaywall();
    }
    
    // Present paywall for the specific offering
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
      offering,
    });

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
        return { completed: true, purchased: true, restored: false, cancelled: false };
      case PAYWALL_RESULT.RESTORED:
        return { completed: true, purchased: false, restored: true, cancelled: false };
      default:
        return { completed: false, purchased: false, restored: false, cancelled: true };
    }
  } catch (error) {
    console.error('Error presenting paywall for offering:', error);
    return { completed: false, purchased: false, restored: false, cancelled: true, error: String(error) };
  }
}

/**
 * Present paywall for a specific package (e.g., monthly, yearly)
 */
export async function presentPaywallForPackage(packageIdentifier: string): Promise<PaywallResult> {
  try {
    const offerings = await Purchases.getOfferings();
    const offering = offerings.current;
    
    if (!offering) {
      return await presentPaywall();
    }
    
    // Find the specific package
    const targetPackage = offering.availablePackages.find(
      pkg => pkg.identifier === packageIdentifier
    );
    
    if (!targetPackage) {
      console.log(`Package ${packageIdentifier} not found`);
      return await presentPaywall();
    }
    
    // Present paywall with the specific package
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
      offering,
    });
    
    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
        return { completed: true, purchased: true, restored: false, cancelled: false };
      case PAYWALL_RESULT.RESTORED:
        return { completed: true, purchased: false, restored: true, cancelled: false };
      default:
        return { completed: false, purchased: false, restored: false, cancelled: true };
    }
  } catch (error) {
    console.error('Error presenting paywall for package:', error);
    return { completed: false, purchased: false, restored: false, cancelled: true, error: String(error) };
  }
}