import { User } from 'firebase/auth';
import { auth, TOKEN_EXPIRATION } from './firebase';
import { signOut } from './auth';

// Last activity timestamp
let lastActivityTimestamp = Date.now();
let tokenExpiryTimer: NodeJS.Timeout | null = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Start the token expiry timer for the user
 * Signs out the user after 15 minutes of inactivity
 */
export const startTokenExpiryTimer = (user: User | null) => {
  // Skip if not in browser or auth not initialized
  if (!isBrowser || !auth) {
    return;
  }

  // Clear any existing timer
  if (tokenExpiryTimer) {
    clearTimeout(tokenExpiryTimer);
    tokenExpiryTimer = null;
  }

  // Only set timer if there's an active user
  if (user) {
    updateLastActivity();
    
    // Check token validity every minute
    tokenExpiryTimer = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivityTimestamp;
      
      // If inactive for TOKEN_EXPIRATION, sign out user
      if (timeSinceLastActivity >= TOKEN_EXPIRATION) {
        signOut().catch(error => console.error('Error signing out after token expiry:', error));
        stopTokenExpiryTimer();
      }
    }, 60000); // Check every minute
  }
};

/**
 * Stop the token expiry timer
 */
export const stopTokenExpiryTimer = () => {
  if (!isBrowser) {
    return;
  }

  if (tokenExpiryTimer) {
    clearInterval(tokenExpiryTimer);
    tokenExpiryTimer = null;
  }
};

/**
 * Update the last activity timestamp
 * This should be called whenever the user interacts with the app
 */
export const updateLastActivity = () => {
  if (!isBrowser) {
    return;
  }

  lastActivityTimestamp = Date.now();
};

/**
 * Setup user activity listeners to track when the user is active
 */
export const setupActivityListeners = () => {
  if (!isBrowser) {
    return;
  }

  const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  
  events.forEach(event => {
    window.addEventListener(event, () => updateLastActivity(), { passive: true });
  });
};

/**
 * Get the expiry time for the current session
 */
export const getSessionExpiryTime = (): Date | null => {
  if (!isBrowser || !lastActivityTimestamp) {
    return null;
  }
  
  const expiryTime = new Date(lastActivityTimestamp + TOKEN_EXPIRATION);
  return expiryTime;
};

/**
 * Check if the user's token is going to expire soon (within 2 minutes)
 */
export const isTokenExpiringSoon = (): boolean => {
  if (!isBrowser) {
    return false;
  }

  const currentTime = Date.now();
  const timeSinceLastActivity = currentTime - lastActivityTimestamp;
  
  // Token is expiring soon if less than 2 minutes remaining
  return timeSinceLastActivity > (TOKEN_EXPIRATION - 2 * 60 * 1000);
};

/**
 * Reset the expiry timer by updating the activity timestamp
 */
export const resetExpiryTimer = () => {
  updateLastActivity();
}; 