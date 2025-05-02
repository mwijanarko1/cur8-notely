import { auth } from './firebase';
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

/**
 * Initialize the hardcoded user if it doesn't exist
 * This should be called once during app startup
 */
export const initializeFirebase = async () => {
  // Skip initialization if running on server (during build or SSR)
  if (typeof window === 'undefined') {
    console.log('Skipping Firebase initialization on server');
    return;
  }

  // Skip if Firebase auth isn't properly initialized
  if (!auth) {
    console.warn('Firebase auth not initialized, skipping user setup');
    return;
  }

  try {
    // Try to sign in with the hardcoded credentials
    await signInWithEmailAndPassword(auth, HARDCODED_USER.email, HARDCODED_USER.password);
    console.log('Hardcoded user already exists');
  } catch (error: any) {
    // If the user doesn't exist, create it
    if (error.code === 'auth/user-not-found' || 
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-email') {
      try {
        await createUserWithEmailAndPassword(auth, HARDCODED_USER.email, HARDCODED_USER.password);
        console.log('Hardcoded user created successfully');
      } catch (createError: any) {
        // If the user already exists (e.g., email-already-in-use), that's also fine
        if (createError.code === 'auth/email-already-in-use') {
          console.log('Hardcoded user already exists (email already in use)');
        } else {
          console.error('Error creating hardcoded user:', createError);
          throw createError;
        }
      }
    } else {
      console.error('Error checking hardcoded user:', error);
      throw error;
    }
  } finally {
    // Sign out to clear the auth state
    try {
      if (auth) {
        await auth.signOut();
      }
    } catch (signOutError) {
      console.error('Error signing out after initialization:', signOutError);
    }
  }
}; 