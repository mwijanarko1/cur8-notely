'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signIn, signOut, registerUser, signInWithGoogle as firebaseSignInWithGoogle } from '@/lib/firebase/auth';
import { startTokenExpiryTimer, stopTokenExpiryTimer, setupActivityListeners, resetExpiryTimer, getSessionExpiryTime } from '@/lib/firebase/tokenManager';
import { createWelcomeNote } from '@/lib/firebase/notes';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sessionExpiresAt: Date | null;
  resetSessionTimer: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);

  // Effect to handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);

      // Start or stop the token expiry timer based on auth state
      if (user) {
        startTokenExpiryTimer(user);
      } else {
        stopTokenExpiryTimer();
      }
    });

    // Setup activity listeners
    setupActivityListeners();

    // Update session expiry time every minute
    const expiryTimer = setInterval(() => {
      setSessionExpiresAt(getSessionExpiryTime());
    }, 60000);

    // Initial session expiry time
    setSessionExpiresAt(getSessionExpiryTime());

    // Clean up subscription and timers on unmount
    return () => {
      unsubscribe();
      stopTokenExpiryTimer();
      clearInterval(expiryTimer);
    };
  }, []);

  // Reset session timer
  const resetSessionTimer = () => {
    resetExpiryTimer();
    setSessionExpiresAt(getSessionExpiryTime());
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { user } = await signIn(email, password);
      setUser(user);
      resetSessionTimer();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      stopTokenExpiryTimer();
      setSessionExpiresAt(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string) => {
    try {
      const { user } = await registerUser(email, password);
      setUser(user);
      resetSessionTimer();
      
      // Create a welcome note for the new user
      try {
        await createWelcomeNote(user);
      } catch (noteError) {
        console.error('Error creating welcome note:', noteError);
        // Don't fail registration if welcome note creation fails
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Google sign-in function
  const signInWithGoogle = async () => {
    try {
      const { user } = await firebaseSignInWithGoogle();
      setUser(user);
      resetSessionTimer();
      
      // Check if this is a new user and create welcome note
      // Firebase doesn't provide a direct way to check if this is a new account
      // so we'll rely on metadata (creationTime vs lastSignInTime)
      const creationTime = new Date(user.metadata.creationTime || '');
      const lastSignInTime = new Date(user.metadata.lastSignInTime || '');
      
      // If creation time and last sign in time are within 5 seconds, likely a new user
      if (Math.abs(creationTime.getTime() - lastSignInTime.getTime()) < 5000) {
        try {
          await createWelcomeNote(user);
        } catch (noteError) {
          console.error('Error creating welcome note:', noteError);
          // Don't fail sign-in if welcome note creation fails
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Value to provide to consumers
  const value = {
    user,
    loading,
    login,
    logout,
    register,
    signInWithGoogle,
    sessionExpiresAt,
    resetSessionTimer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 