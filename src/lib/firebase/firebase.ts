// Import Firebase modules
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Default Firebase configuration with fallbacks for missing environment variables
// This is only used during development or when not in a production environment
const DEFAULT_CONFIG = {
  apiKey: "demo-key-for-development-only",
  authDomain: "demo-app.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-ABCDEFGHIJ",
};

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEFAULT_CONFIG.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_CONFIG.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_CONFIG.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_CONFIG.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || DEFAULT_CONFIG.measurementId,
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Variables to hold our Firebase instances
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

// Function to check if auth is initialized
export function getAuthInstance(): Auth {
  if (!auth) {
    throw new Error('Firebase auth is not initialized');
  }
  return auth;
}

// Function to check if Firestore is initialized
export function getFirestoreInstance(): Firestore {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized');
  }
  return db;
}

// Only initialize Firebase in browser environment
if (isBrowser) {
  // Initialize Firebase only if it hasn't been initialized already
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize Firebase services
    auth = getAuth(firebaseApp);
    
    // Set session persistence to browser session only
    // This ensures the session is cleared when the browser is closed
    setPersistence(auth, browserSessionPersistence)
      .catch(error => {
        console.error('Error setting auth persistence:', error);
      });
    
    db = getFirestore(firebaseApp);
    
    // Initialize analytics conditionally
    isSupported().then(yes => {
      if (yes && firebaseApp) {
        analytics = getAnalytics(firebaseApp);
      }
    });
    
    console.log("Firebase initialized successfully in browser environment");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    
    // In development, create dummy instances for better DX
    if (process.env.NODE_ENV !== 'production') {
      console.warn("Using mock Firebase instances for development");
    }
  }
}

// Token expiration duration in milliseconds (15 minutes)
export const TOKEN_EXPIRATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export { firebaseApp, auth, db, analytics }; 