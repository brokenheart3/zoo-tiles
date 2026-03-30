// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { auth, db } from '../services/firebase';
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Conditionally import Google Sign-in only for mobile
let GoogleSignin: any = null;
let statusCodes: any = null;

if (Platform.OS !== 'web') {
  try {
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleSigninModule.GoogleSignin;
    statusCodes = GoogleSigninModule.statusCodes;
    
    // Configure for mobile
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
      scopes: ['profile', 'email'],
    });
  } catch (error) {
    console.log('Google Sign-in module not available on this platform');
  }
}

// Types
export interface UserStats {
  puzzlesSolved: number;
  accuracy: number;
  currentStreak: number;
  totalPlayDays: number;
  weekendPuzzles: number;
  lastPlayDate: string | null;
  dailyChallengesCompleted: number;
  weeklyChallengesCompleted: number;
  perfectGames: number;
  bestTime: number;
  averageTime: number;
  totalPlayTime: number;
  longestStreak: number;
  totalMoves: number;
  totalCorrectMoves: number;
  totalWrongMoves: number;
  firstPlaceWins: number;
  secondPlaceWins: number;
  thirdPlaceWins: number;
  dailyFirstPlace: number;
  dailySecondPlace: number;
  dailyThirdPlace: number;
  weeklyFirstPlace: number;
  weeklySecondPlace: number;
  weeklyThirdPlace: number;
}

export interface UserSettings {
  gridSize: string;
  difficulty: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  authProvider: string;
  createdAt: string;
  stats: UserStats;
  settings: UserSettings;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  const handleUserAuth = async (firebaseUser: FirebaseUser): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userData: User;
      
      if (!userDoc.exists()) {
        // Create new user document
        const newUserData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          authProvider: firebaseUser.providerData[0]?.providerId || 'email',
          createdAt: new Date().toISOString(),
          stats: {
            puzzlesSolved: 0,
            accuracy: 0,
            currentStreak: 0,
            totalPlayDays: 0,
            weekendPuzzles: 0,
            lastPlayDate: null,
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
        
        await setDoc(userDocRef, newUserData);
        userData = newUserData;
      } else {
        userData = userDoc.data() as User;
        
        // Update last login
        await updateDoc(userDocRef, {
          lastLogin: new Date().toISOString(),
        });
      }

      setUser(userData);
    } catch (error) {
      console.error('Error handling user auth:', error);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        // Web sign-in - works without native module
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await signInWithPopup(auth, provider);
        await handleUserAuth(result.user);
      } else {
        // Mobile sign-in - requires native module
        if (!GoogleSignin) {
          throw new Error('Google Sign-in is not available. Please use email sign-in or sign in on web.');
        }
        
        if (Platform.OS === 'android') {
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        }
        
        const userInfo = await GoogleSignin.signIn();
        const idToken = (userInfo as any).idToken;
        
        if (!idToken) {
          throw new Error('No idToken found');
        }
        
        const googleCredential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, googleCredential);
        await handleUserAuth(userCredential.user);
      }
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      
      if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
        throw new Error('Sign in cancelled by user');
      }
      throw new Error(error.message || 'Google Sign-in failed');
    }
  };

  const signInWithApple = async (): Promise<void> => {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In is only available on iOS devices');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken, fullName } = credential;
      
      if (!identityToken) {
        throw new Error('No identity token returned from Apple');
      }

      const { OAuthProvider, signInWithCredential } = await import('firebase/auth');
      const provider = new OAuthProvider('apple.com');
      const authCredential = provider.credential({
        idToken: identityToken,
      });

      const userCredential = await signInWithCredential(auth, authCredential);
      await handleUserAuth(userCredential.user);
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        throw new Error(error.message || 'Apple Sign-In failed');
      }
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await handleUserAuth(result.user);
  };

  const signUpWithEmail = async (email: string, password: string, username: string): Promise<void> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: username });
    await handleUserAuth(result.user);
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No user');
    
    if (updates.displayName) {
      await updateProfile(currentUser, { displayName: updates.displayName });
    }
    
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, updates);
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const signOut = async (): Promise<void> => {
    try {
      if (Platform.OS !== 'web' && GoogleSignin) {
        await GoogleSignin.signOut();
      }
      await auth.signOut();
      setUser(null);
    } catch (error: any) {
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