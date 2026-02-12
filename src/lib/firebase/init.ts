import { auth, getAuthInstance } from './firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
  AuthErrorCodes
} from 'firebase/auth';

// Hardcoded user credentials from the PRD
const HARDCODED_USER = {
  email: 'intern@example.com',
  password: 'letmein',
};

// Max retries for initialization
const MAX_RETRIES = 3;
let retryCount = 0;

/**
 * Initialize the hardcoded user if it doesn't exist
 * This should be called once during app startup
 */
export const initializeFirebase = async () => {
  // Skip initialization if running on server (during build or SSR)
  if (typeof window === 'undefined') {
    return;
  }

  // If max retries reached, don't attempt again
  if (retryCount >= MAX_RETRIES) {
    console.warn(`Firebase initialization failed after ${MAX_RETRIES} attempts.`);
    return;
  }

  try {
    // Try to get the auth instance
    const authInstance = getAuthInstance();
    
    try {
      // Try to sign in with the hardcoded credentials
      await signInWithEmailAndPassword(authInstance, HARDCODED_USER.email, HARDCODED_USER.password);
      retryCount = 0; // Reset retry count on success
    } catch (error: any) {
      // If the user doesn't exist, create it
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/invalid-email') {
        try {
          await createUserWithEmailAndPassword(authInstance, HARDCODED_USER.email, HARDCODED_USER.password);
          retryCount = 0; // Reset retry count on success
        } catch (createError: any) {
          // If the user already exists (e.g., email-already-in-use), that's also fine
          if (createError.code === 'auth/email-already-in-use') {
            retryCount = 0; // Reset retry count on success
          } else if (createError.code?.includes('api-key') || createError.code?.includes('invalid-argument')) {
            // Handle API key issues more gracefully
            console.error('Firebase authentication error (invalid API key):', createError);
            incrementRetryCount();
          } else {
            console.error('Error creating hardcoded user:', createError);
            incrementRetryCount();
          }
        }
      } else if (error.code?.includes('api-key') || error.code?.includes('invalid-argument')) {
        // Handle API key issues more gracefully
        console.error('Firebase authentication error (invalid API key):', error);
        incrementRetryCount();
      } else {
        console.error('Error checking hardcoded user:', error);
        incrementRetryCount();
      }
    }
  } catch (error) {
    // Handle getAuthInstance errors
    console.error('Failed to get Firebase auth instance:', error);
    incrementRetryCount();
  } finally {
    // Sign out to clear the auth state
    try {
      if (auth) {
        await auth.signOut();
      }
    } catch (signOutError) {
      console.warn('Error signing out after initialization:', signOutError);
    }
  }
};

/**
 * Increment retry count and implement exponential backoff
 */
function incrementRetryCount() {
  retryCount++;
  if (retryCount < MAX_RETRIES) {
    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    setTimeout(() => {
      initializeFirebase();
    }, delay);
  }
} 