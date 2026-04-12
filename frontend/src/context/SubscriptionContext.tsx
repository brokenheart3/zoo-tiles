// src/context/SubscriptionContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { auth } from '../services/firebase';

interface SubscriptionStatus {
  isSubscribed: boolean;
  isInTrial: boolean;
  trialEndDate: Date | null;
  productId: string | null;
}

interface SubscriptionContextType {
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

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

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

  const refreshStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      // Check if user has active entitlement for 'premium'
      const entitlement = customerInfo.entitlements.active['premium'];
      const isSubscribed = entitlement !== undefined;
      
      // Safely check for trial period (supports different property names across SDK versions)
      let isInTrial = false;
      if (entitlement) {
        // Try different possible property names
        isInTrial = (entitlement as any)?.isTrialPeriod || 
                    (entitlement as any)?.isTrial || 
                    (entitlement as any)?.isInTrial || 
                    (entitlement as any)?.trialPeriod || false;
      }
      
      setSubscriptionStatus({
        isSubscribed,
        isInTrial,
        trialEndDate: entitlement?.expirationDate ? new Date(entitlement.expirationDate) : null,
        productId: entitlement?.productIdentifier ?? null,
      });
      
      // Show paywall if not subscribed
      if (!isSubscribed) {
        setShowPaywall(true);
      } else {
        setShowPaywall(false);
      }
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
    }
  };

  const loadOfferings = async () => {
    try {
      const offeringsData = await Purchases.getOfferings();
      if (offeringsData.current) {
        setOfferings(offeringsData.current);
        console.log('📦 Offerings loaded:', offeringsData.current.identifier);
        
        // Log available packages for debugging
        if (offeringsData.current.availablePackages) {
          offeringsData.current.availablePackages.forEach((pkg: any) => {
            console.log(`📦 Package: ${pkg.identifier} - ${pkg.product?.title}`);
          });
        }
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    }
  };

  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isSubscribed = customerInfo.entitlements.active['premium'] !== undefined;
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

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const customerInfo = await Purchases.restorePurchases();
      const isSubscribed = customerInfo.entitlements.active['premium'] !== undefined;
      await refreshStatus();
      return isSubscribed;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Present the RevenueCat paywall
  const presentPaywall = async (): Promise<boolean> => {
    try {
      const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
      
      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await refreshStatus();
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
    const linkUser = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          await Purchases.logIn(user.uid);
          console.log('RevenueCat user linked:', user.uid);
        } catch (error) {
          console.error('Error linking RevenueCat user:', error);
        }
      }
    };
    
    linkUser();
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await Purchases.logIn(user.uid);
      } else {
        await Purchases.logOut();
      }
      await refreshStatus();
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    refreshStatus();
    loadOfferings();
  }, []);

  const trialDaysRemaining = (() => {
    if (!subscriptionStatus.isInTrial || !subscriptionStatus.trialEndDate) return 0;
    const now = new Date();
    const end = new Date(subscriptionStatus.trialEndDate);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  })();

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed: subscriptionStatus.isSubscribed,
        isInTrial: subscriptionStatus.isInTrial,
        trialDaysRemaining,
        isLoading,
        offerings,
        purchasePackage,
        restorePurchases,
        refreshStatus,
        showPaywall,
        setShowPaywall,
        presentPaywall,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};