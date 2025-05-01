'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/lib/firebase/init';
import { TOKEN_EXPIRATION } from '@/lib/firebase/firebase';
import { setupActivityListeners } from '@/lib/firebase/tokenManager';

export default function FirebaseInitializer() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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
        
        // Retry initialization after a delay
        setTimeout(() => {
          console.log('Retrying Firebase initialization...');
          initialize();
        }, 3000);
      }
    };

    // Start initialization
    if (!initialized && !error) {
      initialize();
    }
  }, [initialized, error]);

  // This component doesn't render anything visible
  return null;
} 