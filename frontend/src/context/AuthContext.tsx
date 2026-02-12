// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

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
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Types
import { User, AuthContextType } from '../types/auth';

// Configure Google Sign-in
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // REPLACE WITH YOUR ACTUAL WEB CLIENT ID
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
      
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          authProvider: firebaseUser.providerData[0]?.providerId || 'email',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
      } else {
        // Update last login for existing user
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          lastLogin: new Date().toISOString(),
        }, { merge: true });
      }

      // Set user state
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        authProvider: firebaseUser.providerData[0]?.providerId || 'email',
        createdAt: new Date().toISOString(),
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
  const signUpWithEmail = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document with username
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: username,
        photoURL: '',
        authProvider: 'email',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });

      await handleUserAuth(userCredential.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Google Sign In - Universal approach that works with all versions
  const signInWithGoogle = async () => {
    try {
      // Check if Google Play Services are available (Android)
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google - the response structure varies by version
      const signInResult = await GoogleSignin.signIn();
      
      // Handle different response structures
      let idToken: string | null = null;
      
      // Type the response to access properties safely
      const response = signInResult as any;
      
      // Try multiple possible locations for the ID token
      if (response.idToken) {
        // Version 10+ - idToken is a direct property
        idToken = response.idToken;
      } else if (response.data && response.data.idToken) {
        // Some versions have nested data property
        idToken = response.data.idToken;
      } else if (response.id_token) {
        // Alternative property name
        idToken = response.id_token;
      }
      
      // Debug logging if we can't find the token
      if (!idToken) {
        console.log('Google Sign-in response structure for debugging:', {
          keys: Object.keys(response),
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : null,
          fullResponse: JSON.stringify(response, null, 2)
        });
        throw new Error('Could not extract ID token from Google Sign-in response');
      }

      // Create Firebase credential with Google token
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // Sign in to Firebase with Google credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      
      await handleUserAuth(userCredential.user);
    } catch (error: any) {
      // Handle specific Google Sign-in errors
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

  // Sign Out
  const signOut = async () => {
    try {
      // Sign out from Google (iOS only)
      if (Platform.OS === 'ios') {
        await GoogleSignin.signOut();
      }
      
      // Sign out from Firebase
      await auth.signOut();
      
      // Clear user state
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
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};