import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, getAuthInstance } from './firebase';

// Hardcoded user as required in the PRD
const HARDCODED_USER = {
  email: 'intern@example.com', // Using email format for Firebase
  password: 'letmein',
};

// Create a Google auth provider
const googleProvider = new GoogleAuthProvider();

/**
 * Register a new user with email and password
 */
export const registerUser = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await createUserWithEmailAndPassword(getAuthInstance(), email, password);
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Sign in a user with email and password
 * Includes special handling for the hardcoded user from the PRD
 */
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  const authInstance = getAuthInstance();
  
  try {
    // Handle hardcoded user case
    if (email === 'intern' && password === 'letmein') {
      // Use the actual Firebase account for the hardcoded user
      try {
        return await signInWithEmailAndPassword(authInstance, HARDCODED_USER.email, HARDCODED_USER.password);
      } catch (error) {
        console.error('Error signing in with hardcoded user:', error);
        // If hardcoded user sign-in fails, try to create it
        try {
          return await createUserWithEmailAndPassword(authInstance, HARDCODED_USER.email, HARDCODED_USER.password);
        } catch (createError: any) {
          // If it fails because user already exists, try signing in again
          if (createError.code === 'auth/email-already-in-use') {
            return await signInWithEmailAndPassword(authInstance, HARDCODED_USER.email, HARDCODED_USER.password);
          }
          throw createError;
        }
      }
    }
    
    // Regular sign in
    return await signInWithEmailAndPassword(authInstance, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign in with Google using a popup
 * This must be called directly from a user interaction (like a button click)
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    // Check if Firebase is properly configured first
    const authInstance = getAuthInstance();
    
    // Configure the Google provider with your production domain
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      // The hostname should match what's set in your Firebase console
      // This is needed for OAuth redirects to work properly
      auth_domain: window.location.hostname === 'localhost' 
        ? (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-app.firebaseapp.com')
        : window.location.hostname
    });
    
    // Log auth attempt
    console.log('Attempting Google sign-in, host:', window.location.hostname);
    
    // Proceed with popup authentication
    return await signInWithPopup(authInstance, googleProvider);
  } catch (error: any) {
    // Check for popup blocked error
    if (error.message?.includes('popup') || error.name === 'PopupBlockedError') {
      console.error('Google sign-in popup was blocked:', error);
      throw new Error(
        'The login popup was blocked by your browser. Please allow popups for this site or try again.'
      );
    }
    
    // Handle API key errors more gracefully
    if (error.code?.includes('api-key') || 
        error.code?.includes('invalid-argument') || 
        error.code?.includes('invalid-api-key')) {
      console.error('Google sign-in failed due to invalid Firebase configuration:', error);
      throw new Error(
        'Authentication service is currently unavailable. Please try again later or use email/password login.'
      );
    }
    
    // Handle other authentication errors
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(getAuthInstance());
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): Promise<User | null> => {
  try {
    const authInstance = getAuthInstance();
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  } catch (error) {
    console.warn('Auth not initialized in getCurrentUser');
    return Promise.resolve(null);
  }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  
  try {
    // Try to use the getAuthInstance which guarantees a non-null Auth
    const authInstance = getAuthInstance();
    return onAuthStateChanged(authInstance, callback);
  } catch (error) {
    // Fall back to handling null case if getAuthInstance throws
    console.warn('Auth not initialized, using fallback for onAuthChange');
    callback(null);
    return () => {};
  }
}; 