import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Default Firebase Configuration (can be overridden with environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBWs8H6zzvUbb0sMm71e8i8qNlfmQYBiME",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "werehouse-wms.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "werehouse-wms",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "werehouse-wms.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "203923994893",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:203923994893:web:34f7a840575edc4917d844"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable emulators if configured in dev
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('Connected to Firebase Emulators (Auth 9099, Firestore 8080, Storage 9199)');
  } catch (e) {
    console.warn('Firebase emulator connection note:', e);
  }
}
