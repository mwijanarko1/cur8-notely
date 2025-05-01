import { User } from 'firebase/auth';
import { auth, TOKEN_EXPIRATION } from './firebase';
import { signOut } from './auth';

// Last activity timestamp
let lastActivityTimestamp = Date.now();
let tokenExpiryTimer: NodeJS.Timeout | null = null;

/**
 * Start the token expiry timer for the user
 * Signs out the user after 15 minutes of inactivity
 */
export const startTokenExpiryTimer = (user: User | null) => {
  // Clear any existing timer
  if (tokenExpiryTimer) {
    clearTimeout(tokenExpiryTimer);
    tokenExpiryTimer = null;
  }

  // Only set timer if there's an active user
  if (user) {
    console.log('Starting token expiry timer for 15 minutes');
    updateLastActivity();
    
    // Check token validity every minute
    tokenExpiryTimer = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivityTimestamp;
      
      // Log time remaining (for debugging)
      const timeRemaining = TOKEN_EXPIRATION - timeSinceLastActivity;
      if (timeRemaining > 0) {
        console.log(`Token expires in ${Math.round(timeRemaining / 1000)} seconds`);
      }
      
      // If inactive for TOKEN_EXPIRATION, sign out user
      if (timeSinceLastActivity >= TOKEN_EXPIRATION) {
        console.log('Token expired due to inactivity - signing out user');
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
  if (tokenExpiryTimer) {
    clearInterval(tokenExpiryTimer);
    tokenExpiryTimer = null;
    console.log('Token expiry timer stopped');
  }
};

/**
 * Update the last activity timestamp
 * This should be called whenever the user interacts with the app
 */
export const updateLastActivity = () => {
  lastActivityTimestamp = Date.now();
  console.log('Last activity timestamp updated');
};

/**
 * Setup user activity listeners to track when the user is active
 */
export const setupActivityListeners = () => {
  if (typeof window !== 'undefined') {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(event => {
      window.addEventListener(event, () => updateLastActivity(), { passive: true });
    });
    
    console.log('User activity listeners set up');
  }
};

/**
 * Get the expiry time for the current session
 */
export const getSessionExpiryTime = (): Date | null => {
  if (!lastActivityTimestamp) return null;
  
  const expiryTime = new Date(lastActivityTimestamp + TOKEN_EXPIRATION);
  return expiryTime;
};

/**
 * Check if the user's token is going to expire soon (within 2 minutes)
 */
export const isTokenExpiringSoon = (): boolean => {
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