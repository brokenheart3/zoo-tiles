// services/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

// Explicitly typed variables
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

const getFirebaseConfig = () => {
  if (Platform.OS === 'web') {
    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    };
  } else if (Platform.OS === 'ios') {
    return {
      apiKey: process.env.API_KEY_IOS,
      authDomain: process.env.AUTH_DOMAIN_IOS,
      projectId: process.env.PROJECT_ID_IOS,
      storageBucket: process.env.STORAGE_BUCKET_IOS,
      messagingSenderId: process.env.MESSAGING_SENDER_ID_IOS,
      appId: process.env.APP_ID_IOS,
    };
  } else {
    // Android
    return {
      apiKey: process.env.API_KEY_ANDROID,
      authDomain: process.env.AUTH_DOMAIN_ANDROID,
      projectId: process.env.PROJECT_ID_ANDROID,
      storageBucket: process.env.STORAGE_BUCKET_ANDROID,
      messagingSenderId: process.env.MESSAGING_SENDER_ID_ANDROID,
      appId: process.env.APP_ID_ANDROID,
    };
  }
};

// Get and validate config
const firebaseConfig = getFirebaseConfig();

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is missing. Please check your .env file.');
}

// Initialize app
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize auth and db (NO react-native/auth imports!)
auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };