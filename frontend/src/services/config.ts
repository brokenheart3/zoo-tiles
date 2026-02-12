// src/services/config.ts
import { Platform } from 'react-native';

// The port your Node server runs on locally
export const API_PORT = 3000;

// Base URL depending on environment and platform
export const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-server.com' // <-- replace with your live server URL
    : Platform.OS === 'web'
    ? `http://localhost:${API_PORT}`
    : `http://192.168.137.1:${API_PORT}`; // <-- replace with your local IP
