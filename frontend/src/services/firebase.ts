// services/firebase.ts (or firebaseConfig.ts - whichever matches your AuthContext import)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";
import { Platform } from "react-native";
import {
  API_KEY_ANDROID,
  APP_ID_ANDROID,
  AUTH_DOMAIN_ANDROID,
  PROJECT_ID_ANDROID,
  STORAGE_BUCKET_ANDROID,
  MESSAGING_SENDER_ID_ANDROID,
  API_KEY_IOS,
  APP_ID_IOS,
  AUTH_DOMAIN_IOS,
  PROJECT_ID_IOS,
  STORAGE_BUCKET_IOS,
  MESSAGING_SENDER_ID_IOS
} from "@env";

// Your existing platform-specific config
const firebaseConfig = {
  apiKey: Platform.OS === "ios" ? API_KEY_IOS : API_KEY_ANDROID,
  authDomain: Platform.OS === "ios" ? AUTH_DOMAIN_IOS : AUTH_DOMAIN_ANDROID,
  projectId: Platform.OS === "ios" ? PROJECT_ID_IOS : PROJECT_ID_ANDROID,
  storageBucket: Platform.OS === "ios" ? STORAGE_BUCKET_IOS : STORAGE_BUCKET_ANDROID,
  messagingSenderId: Platform.OS === "ios" ? MESSAGING_SENDER_ID_IOS : MESSAGING_SENDER_ID_ANDROID,
  appId: Platform.OS === "ios" ? APP_ID_IOS : APP_ID_ANDROID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };