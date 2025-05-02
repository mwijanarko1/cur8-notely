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

// Check if using real config or fallback
const isUsingRealConfig = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Log configuration status (without exposing actual keys)
console.log('Firebase config status:', {
  usingRealConfig: isUsingRealConfig,
  apiKeyProvided: !!firebaseConfig.apiKey,
  authDomainProvided: !!firebaseConfig.authDomain,
  projectIdProvided: !!firebaseConfig.projectId,
  apiKeyLength: firebaseConfig.apiKey ? firebaseConfig.apiKey.length : 0,
  environment: process.env.NODE_ENV,
  isVercel: !!process.env.VERCEL
});

// Check if we're in a production or development environment
const isVercel = !!process.env.VERCEL;
const isProduction = process.env.NODE_ENV === 'production';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Log the deployment environment
if (isBrowser) {
  console.log('Environment:', {
    isVercel,
    isProduction,
    hostname: window.location.hostname,
    environment: process.env.NODE_ENV
  });
}

// Override the auth domain for Vercel deployments
if (isVercel && isBrowser && window.location.hostname !== 'localhost') {
  // In Vercel production, use the deployment URL as auth domain
  firebaseConfig.authDomain = window.location.hostname;
  console.log('Set authDomain to:', window.location.hostname);
}

// Variables to hold our Firebase instances
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

// Function to check if auth is initialized
export function getAuthInstance(): Auth {
  if (!auth) {
    // If we're not in a browser, throw a more helpful error
    if (!isBrowser) {
      throw new Error('Firebase auth cannot be used on the server side');
    }
    // If we're in the browser but auth is still null, try to initialize it first
    initializeFirebase();
    // Check again after initialization attempt
    if (!auth) {
      throw new Error('Firebase auth initialization failed');
    }
  }
  return auth;
}

// Function to check if Firestore is initialized
export function getFirestoreInstance(): Firestore {
  if (!db) {
    // If we're not in a browser, throw a more helpful error
    if (!isBrowser) {
      throw new Error('Firebase Firestore cannot be used on the server side');
    }
    // If we're in the browser but db is still null, try to initialize it first
    initializeFirebase();
    // Check again after initialization attempt
    if (!db) {
      throw new Error('Firebase Firestore initialization failed');
    }
  }
  return db;
}

// Initialize Firebase - can be called multiple times, will only initialize once
export function initializeFirebase() {
  // Skip if not in browser
  if (!isBrowser) {
    console.log('Skipping Firebase initialization in non-browser environment');
    return;
  }

  // Skip if already initialized
  if (firebaseApp && auth && db) {
    console.log('Firebase already initialized');
    return;
  }

  // Initialize Firebase only if it hasn't been initialized already
  try {
    console.log('Initializing Firebase...');
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize Firebase services
    auth = getAuth(firebaseApp);
    
    // Set session persistence to browser session only
    // This ensures the session is cleared when the browser is closed
    if (auth) {
      setPersistence(auth, browserSessionPersistence)
        .catch(error => {
          console.warn('Error setting auth persistence:', error);
          // Continue even if persistence setting fails
        });
    }
    
    db = getFirestore(firebaseApp);
    
    // Initialize analytics conditionally
    if (firebaseConfig.measurementId) {
      isSupported().then(yes => {
        if (yes && firebaseApp) {
          try {
            analytics = getAnalytics(firebaseApp);
          } catch (analyticsError) {
            console.warn('Analytics initialization failed:', analyticsError);
          }
        }
      }).catch(error => {
        console.warn('Analytics support check failed:', error);
      });
    }
    
    console.log("Firebase initialized successfully in browser environment");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    
    // In development, log warning message
    if (process.env.NODE_ENV !== 'production') {
      console.warn("Using demo Firebase config - some features may not work properly");
      console.warn("Provide valid Firebase credentials in your environment variables");
    }
  }
}

// Initialize Firebase immediately in browser environments
if (isBrowser) {
  initializeFirebase();
}

// Token expiration duration in milliseconds (15 minutes)
export const TOKEN_EXPIRATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export { firebaseApp, auth, db, analytics };

/**
 * Check if Firebase is properly configured with valid API keys
 * This can be used to disable features that would fail with demo keys
 */
export function isFirebaseProperlyConfigured(): boolean {
  const hasRealApiKey = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                       !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('demo-key');
  
  const hasRealAuthDomain = !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 
                           !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.includes('demo-app');
  
  return hasRealApiKey && hasRealAuthDomain;
} 