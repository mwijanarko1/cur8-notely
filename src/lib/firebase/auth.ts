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
import { auth } from './firebase';

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
    return await createUserWithEmailAndPassword(auth, email, password);
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
  try {
    // Handle hardcoded user case
    if (email === 'intern' && password === 'letmein') {
      // Use the actual Firebase account for the hardcoded user
      try {
        return await signInWithEmailAndPassword(auth, HARDCODED_USER.email, HARDCODED_USER.password);
      } catch (error) {
        console.error('Error signing in with hardcoded user:', error);
        // If hardcoded user sign-in fails, try to create it
        try {
          return await createUserWithEmailAndPassword(auth, HARDCODED_USER.email, HARDCODED_USER.password);
        } catch (createError: any) {
          // If it fails because user already exists, try signing in again
          if (createError.code === 'auth/email-already-in-use') {
            return await signInWithEmailAndPassword(auth, HARDCODED_USER.email, HARDCODED_USER.password);
          }
          throw createError;
        }
      }
    }
    
    // Regular sign in
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign in with Google using a popup
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Subscribe to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
}; 