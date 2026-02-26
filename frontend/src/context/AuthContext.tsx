// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

// Firebase imports
import { 
  auth, 
  db 
} from '../services/firebase';
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  updateProfile,
  signInWithPopup,
  OAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Types
import { User, AuthContextType } from '../types/auth';

// Configure Google Sign-in
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        await handleUserAuth(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleUserAuth = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userData: any = {};
      
      if (!userDoc.exists()) {
        // Create new user document with all stats
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          authProvider: firebaseUser.providerData[0]?.providerId || 'email',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          stats: {
            // Basic stats
            puzzlesSolved: 0,
            accuracy: 0,
            currentStreak: 0,
            totalPlayDays: 0,
            weekendPuzzles: 0,
            lastPlayDate: null,
            
            // Challenge stats
            dailyChallengesCompleted: 0,
            weeklyChallengesCompleted: 0,
            perfectGames: 0,
            bestTime: Infinity,
            averageTime: 0,
            totalPlayTime: 0,
            longestStreak: 0,
            totalMoves: 0,
            totalCorrectMoves: 0,
            totalWrongMoves: 0,
            
            // Position tracking stats
            firstPlaceWins: 0,
            secondPlaceWins: 0,
            thirdPlaceWins: 0,
            dailyFirstPlace: 0,
            dailySecondPlace: 0,
            dailyThirdPlace: 0,
            weeklyFirstPlace: 0,
            weeklySecondPlace: 0,
            weeklyThirdPlace: 0,
          },
          settings: {
            gridSize: '8x8',
            difficulty: 'Medium',
            soundEnabled: true,
            notificationsEnabled: true,
            hapticFeedback: true,
          },
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      } else {
        // Get existing user data
        userData = userDoc.data();
        
        // Update last login for existing user
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          lastLogin: new Date().toISOString(),
        });
        
        // Update displayName if it changed in Firebase Auth
        if (firebaseUser.displayName && firebaseUser.displayName !== userData.displayName) {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            displayName: firebaseUser.displayName,
          });
          userData.displayName = firebaseUser.displayName;
        }
      }

      // Set user state with all fields (including fallbacks for existing users)
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: userData.displayName || firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        authProvider: firebaseUser.providerData[0]?.providerId || 'email',
        createdAt: userData.createdAt || new Date().toISOString(),
        stats: {
          // Basic stats with fallbacks
          puzzlesSolved: userData.stats?.puzzlesSolved || 0,
          accuracy: userData.stats?.accuracy || 0,
          currentStreak: userData.stats?.currentStreak || 0,
          totalPlayDays: userData.stats?.totalPlayDays || 0,
          weekendPuzzles: userData.stats?.weekendPuzzles || 0,
          lastPlayDate: userData.stats?.lastPlayDate || null,
          
          // Challenge stats with fallbacks
          dailyChallengesCompleted: userData.stats?.dailyChallengesCompleted || 0,
          weeklyChallengesCompleted: userData.stats?.weeklyChallengesCompleted || 0,
          perfectGames: userData.stats?.perfectGames || 0,
          bestTime: userData.stats?.bestTime || Infinity,
          averageTime: userData.stats?.averageTime || 0,
          totalPlayTime: userData.stats?.totalPlayTime || 0,
          longestStreak: userData.stats?.longestStreak || 0,
          totalMoves: userData.stats?.totalMoves || 0,
          totalCorrectMoves: userData.stats?.totalCorrectMoves || 0,
          totalWrongMoves: userData.stats?.totalWrongMoves || 0,
          
          // Position tracking stats with fallbacks
          firstPlaceWins: userData.stats?.firstPlaceWins || 0,
          secondPlaceWins: userData.stats?.secondPlaceWins || 0,
          thirdPlaceWins: userData.stats?.thirdPlaceWins || 0,
          dailyFirstPlace: userData.stats?.dailyFirstPlace || 0,
          dailySecondPlace: userData.stats?.dailySecondPlace || 0,
          dailyThirdPlace: userData.stats?.dailyThirdPlace || 0,
          weeklyFirstPlace: userData.stats?.weeklyFirstPlace || 0,
          weeklySecondPlace: userData.stats?.weeklySecondPlace || 0,
          weeklyThirdPlace: userData.stats?.weeklyThirdPlace || 0,
        },
        settings: {
          gridSize: userData.settings?.gridSize || '8x8',
          difficulty: userData.settings?.difficulty || 'Medium',
          soundEnabled: userData.settings?.soundEnabled ?? true,
          notificationsEnabled: userData.settings?.notificationsEnabled ?? true,
          hapticFeedback: userData.settings?.hapticFeedback ?? true,
        },
      });
    } catch (error) {
      console.error('Error handling user auth:', error);
    }
  };

  // Email/Password Sign In
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleUserAuth(userCredential.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Email/Password Sign Up
  const signUpWithEmail = async (email: string, password: string, username: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile with username
      await updateProfile(userCredential.user, {
        displayName: username
      });

      // Create user document with all stats
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: username,
        photoURL: '',
        authProvider: 'email',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        stats: {
          // Basic stats
          puzzlesSolved: 0,
          accuracy: 0,
          currentStreak: 0,
          totalPlayDays: 0,
          weekendPuzzles: 0,
          lastPlayDate: null,
          
          // Challenge stats
          dailyChallengesCompleted: 0,
          weeklyChallengesCompleted: 0,
          perfectGames: 0,
          bestTime: Infinity,
          averageTime: 0,
          totalPlayTime: 0,
          longestStreak: 0,
          totalMoves: 0,
          totalCorrectMoves: 0,
          totalWrongMoves: 0,
          
          // Position tracking stats
          firstPlaceWins: 0,
          secondPlaceWins: 0,
          thirdPlaceWins: 0,
          dailyFirstPlace: 0,
          dailySecondPlace: 0,
          dailyThirdPlace: 0,
          weeklyFirstPlace: 0,
          weeklySecondPlace: 0,
          weeklyThirdPlace: 0,
        },
        settings: {
          gridSize: '8x8',
          difficulty: 'Medium',
          soundEnabled: true,
          notificationsEnabled: true,
          hapticFeedback: true,
        },
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      await handleUserAuth(userCredential.user);
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');

      // Update Firebase Auth profile if displayName is being updated
      if (updates.displayName && updates.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: updates.displayName
        });
      }

      // Update Firestore user document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...updates,
        lastUpdated: new Date().toISOString(),
      });

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);

      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        // Use Firebase web sign-in
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await handleUserAuth(result.user);
      } else {
        // Use native Google Sign-In for mobile
        await GoogleSignin.hasPlayServices();
        
        const signInResult = await GoogleSignin.signIn();
        
        // Handle different response structures
        let idToken: string | null = null;
        const response = signInResult as any;
        
        if (response.idToken) {
          idToken = response.idToken;
        } else if (response.data && response.data.idToken) {
          idToken = response.data.idToken;
        } else if (response.id_token) {
          idToken = response.id_token;
        }
        
        if (!idToken) {
          console.log('Google Sign-in response:', response);
          throw new Error('Could not extract ID token from Google Sign-in response');
        }

        const googleCredential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, googleCredential);
        
        await handleUserAuth(userCredential.user);
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Sign in cancelled by user');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available or outdated');
      } else {
        console.error('Google Sign-in error:', error);
        throw new Error(error.message || 'Google Sign-in failed');
      }
    }
  };

  // Apple Sign In with Expo
  const signInWithApple = async () => {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In is only available on iOS devices');
      }

      console.log('🍎 Starting Apple Sign-In with Expo...');
      
      // Use Expo's Apple Authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('🍎 Apple credential received:', credential);

      // Get the identity token
      const { identityToken, fullName, email } = credential;
      
      if (!identityToken) {
        throw new Error('No identity token returned from Apple');
      }

      // Create a Firebase credential using OAuthProvider
      const provider = new OAuthProvider('apple.com');
      const authCredential = provider.credential({
        idToken: identityToken,
      });

      // Sign in to Firebase
      const userCredential = await signInWithCredential(auth, authCredential);
      
      // Check if this is a new user by checking if user document exists
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const isNewUser = !userDoc.exists();
      
      // If this is the first sign-in and we have the user's name from Apple
      if (isNewUser && fullName) {
        // Construct the full name from Apple's response
        const displayName = [fullName.givenName, fullName.familyName]
          .filter(Boolean)
          .join(' ');
        
        if (displayName) {
          await updateProfile(userCredential.user, {
            displayName: displayName
          });
        }
      }
      
      await handleUserAuth(userCredential.user);
      
      console.log('✅ Apple Sign-In successful');
      
    } catch (error: any) {
      console.error('🍎 Apple Sign-In error:', error);
      
      // Handle specific error codes
      if (error.code === 'ERR_CANCELED') {
        // User cancelled the sign-in flow
        console.log('🍎 Apple Sign-In was cancelled');
        return;
      } else if (error.code === 'ERR_FAILED') {
        throw new Error('Apple Sign-In failed. Please try again.');
      } else {
        throw new Error(error.message || 'Apple Sign-In failed');
      }
    }
  };

  // Sign Out
  const signOut = async () => {
    console.log('🔴 AuthContext: signOut called');
    try {
      console.log('🔴 AuthContext: Attempting to sign out...');
      if (Platform.OS === 'ios') {
        console.log('🔴 AuthContext: Signing out from Google (iOS)');
        await GoogleSignin.signOut();
      }
      console.log('🔴 AuthContext: Signing out from Firebase');
      await auth.signOut();
      console.log('✅ AuthContext: Firebase sign out successful');
      setUser(null);
      console.log('✅ AuthContext: User state cleared');
    } catch (error: any) {
      console.error('❌ AuthContext: Sign out error:', error);
      throw new Error(error.message || 'Sign out failed');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};