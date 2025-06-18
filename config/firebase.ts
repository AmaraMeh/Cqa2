import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBtv9tiAg4dGG2MfVj-nS-CzoNEUIR_14Y",
  authDomain: "sample-firebase-ai-apph-48570.firebaseapp.com",
  projectId: "sample-firebase-ai-apph-48570",
  storageBucket: "sample-firebase-ai-apph-48570.firebasestorage.app",
  messagingSenderId: "560740686768",
  appId: "1:560740686768:web:2b61a3a13069cfecef5475"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence for React Native
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export { auth };
export default app;