'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/lib/firebase/init';
import { TOKEN_EXPIRATION } from '@/lib/firebase/firebase';
import { setupActivityListeners } from '@/lib/firebase/tokenManager';

// Maximum number of retries for Firebase initialization
const MAX_RETRIES = 3;

export default function FirebaseInitializer() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  useEffect(() => {
    // Skip initialization if not in browser
    if (!isBrowser) {
      console.log('Skipping Firebase initialization in non-browser environment');
      return;
    }
    
    const initialize = async () => {
      try {
        await initializeFirebase();
        console.log('Firebase initialized successfully');
        
        // Setup activity tracking for token expiration
        setupActivityListeners();
        console.log(`Session will expire after ${TOKEN_EXPIRATION / 1000} seconds of inactivity`);
        
        setInitialized(true);
        setError(null);
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        setError(error instanceof Error ? error : new Error('Failed to initialize Firebase'));
        
        // Retry initialization, but only up to MAX_RETRIES
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          
          // Retry with exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying Firebase initialization in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          
          setTimeout(() => {
            initialize();
          }, delay);
        } else {
          console.warn(`Firebase initialization failed after ${MAX_RETRIES} attempts. Some features may not work properly.`);
        }
      }
    };

    // Start initialization
    if (!initialized && !error) {
      initialize();
    }
  }, [initialized, error, retryCount, isBrowser]);

  // This component doesn't render anything visible
  return null;
} 