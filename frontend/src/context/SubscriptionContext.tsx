// src/context/SubscriptionContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, { PurchasesPackage, LOG_LEVEL, CustomerInfo } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { auth } from '../services/firebase';

// ============================
// TYPES
// ============================

interface SubscriptionStatus {
  isSubscribed: boolean;
  isInTrial: boolean;
  trialEndDate: Date | null;
  productId: string | null;
}

export interface SubscriptionContextType {
  isSubscribed: boolean;
  isInTrial: boolean;
  trialDaysRemaining: number;
  isLoading: boolean;
  offerings: any | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  presentPaywall: () => Promise<boolean>;
}

// ============================
// API KEYS FROM ENVIRONMENT VARIABLES
// ============================

// Read from process.env (set by babel-plugin-transform-inline-environment-variables)
const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '';
const REVENUECAT_ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '';

console.log('🔑 RevenueCat keys loaded:', {
  ios: REVENUECAT_IOS_API_KEY ? '✅ Present' : '❌ Missing',
  android: REVENUECAT_ANDROID_API_KEY ? '✅ Present' : '❌ Missing',
});

// Flag to track initialization
let isRevenueCatConfigured = false;
let initializationPromise: Promise<void> | null = null;

// ============================
// REVENUECAT INITIALIZATION
// ============================

const configureRevenueCat = async (): Promise<void> => {
  // Skip on web platform
  if (Platform.OS === 'web') {
    console.log('🌐 RevenueCat not available on web');
    isRevenueCatConfigured = false;
    return;
  }
  
  if (isRevenueCatConfigured) return;
  
  // Prevent multiple concurrent initializations
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    try {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
      
      if (Platform.OS === 'ios') {
        if (REVENUECAT_IOS_API_KEY && REVENUECAT_IOS_API_KEY !== 'appl_xxxxxxxxxxxxx') {
          await Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
          console.log('✅ RevenueCat configured for iOS');
          isRevenueCatConfigured = true;
        } else {
          console.warn('⚠️ RevenueCat iOS API key not found or still using placeholder');
          isRevenueCatConfigured = false;
        }
      } else if (Platform.OS === 'android') {
        if (REVENUECAT_ANDROID_API_KEY && REVENUECAT_ANDROID_API_KEY !== 'goog_xxxxxxxxxxxxx') {
          await Purchases.configure({ apiKey: REVENUECAT_ANDROID_API_KEY });
          console.log('✅ RevenueCat configured for Android');
          isRevenueCatConfigured = true;
        } else {
          console.warn('⚠️ RevenueCat Android API key not found or still using placeholder');
          isRevenueCatConfigured = false;
        }
      }
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
      isRevenueCatConfigured = false;
    } finally {
      initializationPromise = null;
    }
  })();
  
  return initializationPromise;
};

// ============================
// CONTEXT
// ============================

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

// ============================
// PROVIDER
// ============================

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    isInTrial: false,
    trialEndDate: null,
    productId: null,
  });
  const [offerings, setOfferings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refresh subscription status from RevenueCat
  const refreshStatus = async () => {
    // Skip on web platform
    if (Platform.OS === 'web') {
      setSubscriptionStatus({
        isSubscribed: false,
        isInTrial: false,
        trialEndDate: null,
        productId: null,
      });
      return;
    }
    
    // If RevenueCat is not configured yet, don't try to get customer info
    if (!isRevenueCatConfigured) {
      console.log('⏳ RevenueCat not configured yet, skipping refresh');
      return;
    }
    
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      
      // Safe access using optional chaining and type assertion
      const activeEntitlements = customerInfo?.entitlements?.active;
      const entitlement = activeEntitlements ? (activeEntitlements as any)['premium'] : undefined;
      const isSubscribed = entitlement !== undefined;
      
      let isInTrial = false;
      if (entitlement) {
        isInTrial = entitlement?.isTrialPeriod || false;
      }
      
      setSubscriptionStatus({
        isSubscribed,
        isInTrial,
        trialEndDate: entitlement?.expirationDate ? new Date(entitlement.expirationDate) : null,
        productId: entitlement?.productIdentifier ?? null,
      });
      
      // Show paywall if not subscribed (but not in development with bypass)
      const shouldShowPaywall = !isSubscribed && !(__DEV__ && process.env.EXPO_PUBLIC_BYPASS_PAYWALL === 'true');
      setShowPaywall(shouldShowPaywall);
      
      console.log('📊 Subscription status refreshed:', { isSubscribed, isInTrial });
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
    }
  };

  // Load offerings (products) from RevenueCat
  const loadOfferings = async () => {
    if (Platform.OS === 'web' || !isRevenueCatConfigured) return;
    
    try {
      const offeringsData = await Purchases.getOfferings();
      if (offeringsData?.current) {
        setOfferings(offeringsData.current);
        console.log('📦 Offerings loaded:', offeringsData.current.identifier);
        
        // Log available packages for debugging
        if (offeringsData.current.availablePackages) {
          offeringsData.current.availablePackages.forEach((pkg: any) => {
            console.log(`  📦 Package: ${pkg.identifier} - ${pkg.product?.title || pkg.product?.priceString}`);
          });
        }
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    }
  };

  // Purchase a package
  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    if (Platform.OS === 'web') {
      console.log('🌐 Purchases not available on web');
      return false;
    }
    
    if (!isRevenueCatConfigured) {
      console.log('⏳ RevenueCat not configured, cannot purchase');
      return false;
    }
    
    try {
      setIsLoading(true);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const activeEntitlements = customerInfo?.entitlements?.active;
      const isSubscribed = activeEntitlements ? !!(activeEntitlements as any)['premium'] : false;
      await refreshStatus();
      return isSubscribed;
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Purchase error:', error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Restore previous purchases
  const restorePurchases = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      console.log('🌐 Purchases not available on web');
      return false;
    }
    
    if (!isRevenueCatConfigured) {
      console.log('⏳ RevenueCat not configured, cannot restore');
      return false;
    }
    
    try {
      setIsLoading(true);
      const customerInfo = await Purchases.restorePurchases();
      const activeEntitlements = customerInfo?.entitlements?.active;
      const isSubscribed = activeEntitlements ? !!(activeEntitlements as any)['premium'] : false;
      await refreshStatus();
      return isSubscribed;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Present the RevenueCat paywall UI
  const presentPaywall = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      console.log('🌐 Paywall not available on web');
      if (__DEV__) {
        setShowPaywall(false);
        return true;
      }
      return false;
    }
    
    if (!isRevenueCatConfigured) {
      console.log('⏳ RevenueCat not configured, cannot show paywall');
      return false;
    }
    
    try {
      const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
      
      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await refreshStatus();
          setShowPaywall(false);
          return true;
        case PAYWALL_RESULT.CANCELLED:
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        default:
          return false;
      }
    } catch (error) {
      console.error('Error presenting paywall:', error);
      return false;
    }
  };

  // Link RevenueCat user with Firebase user
  useEffect(() => {
    if (!isInitialized || Platform.OS === 'web' || !isRevenueCatConfigured) return;
    
    const linkUser = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          await Purchases.logIn(user.uid);
          console.log('🔗 RevenueCat user linked:', user.uid);
          await refreshStatus();
        } catch (error) {
          console.error('Error linking RevenueCat user:', error);
        }
      }
    };
    
    linkUser();
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && isRevenueCatConfigured) {
        await Purchases.logIn(user.uid);
        await refreshStatus();
      } else if (!user && isRevenueCatConfigured) {
        await Purchases.logOut();
        await refreshStatus();
      }
    });
    
    return () => unsubscribe();
  }, [isInitialized]);

  // Initialize RevenueCat on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await configureRevenueCat();
      setIsInitialized(true);
      await refreshStatus();
      await loadOfferings();
      setIsLoading(false);
    };
    
    initialize();
  }, []);

  // Calculate remaining trial days
  const trialDaysRemaining = (() => {
    if (!subscriptionStatus.isInTrial || !subscriptionStatus.trialEndDate) return 0;
    const now = new Date();
    const end = new Date(subscriptionStatus.trialEndDate);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  })();

  const contextValue: SubscriptionContextType = {
    isSubscribed: subscriptionStatus.isSubscribed,
    isInTrial: subscriptionStatus.isInTrial,
    trialDaysRemaining,
    isLoading: isLoading || (!isInitialized && Platform.OS !== 'web'),
    offerings,
    purchasePackage,
    restorePurchases,
    refreshStatus,
    showPaywall,
    setShowPaywall,
    presentPaywall,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;