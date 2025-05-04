// Simple in-memory rate limiter with Redis-like expiry
// Stores request counts per user/IP with rolling window implementation

type RateLimitStore = {
  [key: string]: {
    hits: number;
    resetAt: number;
  };
};

// Separate stores for different time windows
const perMinuteStore: RateLimitStore = {};
const perDayStore: RateLimitStore = {};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  
  // Clean up minute store
  Object.keys(perMinuteStore).forEach(key => {
    if (perMinuteStore[key].resetAt < now) {
      delete perMinuteStore[key];
    }
  });
  
  // Clean up day store
  Object.keys(perDayStore).forEach(key => {
    if (perDayStore[key].resetAt < now) {
      delete perDayStore[key];
    }
  });
}, 60000); // Run cleanup every minute

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

/**
 * Check if a request is within rate limits
 * @param identifier Unique identifier for the client (IP address or user ID)
 * @param requestsPerMinute Maximum requests allowed per minute
 * @param requestsPerDay Maximum requests allowed per day
 * @returns Result object with status and limit information
 */
export function checkRateLimit(
  identifier: string, 
  requestsPerMinute: number = 5,
  requestsPerDay: number = 20
): RateLimitResult {
  const now = Date.now();
  
  // Per-minute rate limiting
  const minuteKey = `${identifier}:minute`;
  const minuteResetTime = now + 60000; // 1 minute from now
  
  if (!perMinuteStore[minuteKey]) {
    perMinuteStore[minuteKey] = {
      hits: 0,
      resetAt: minuteResetTime
    };
  } else if (perMinuteStore[minuteKey].resetAt < now) {
    // Reset if the window has passed
    perMinuteStore[minuteKey] = {
      hits: 0,
      resetAt: minuteResetTime
    };
  }
  
  // Per-day rate limiting
  const dayKey = `${identifier}:day`;
  const dayResetTime = now + 86400000; // 24 hours from now
  
  if (!perDayStore[dayKey]) {
    perDayStore[dayKey] = {
      hits: 0,
      resetAt: dayResetTime
    };
  } else if (perDayStore[dayKey].resetAt < now) {
    // Reset if the window has passed
    perDayStore[dayKey] = {
      hits: 0,
      resetAt: dayResetTime
    };
  }
  
  // Check if we're over limits
  const isOverMinuteLimit = perMinuteStore[minuteKey].hits >= requestsPerMinute;
  const isOverDayLimit = perDayStore[dayKey].hits >= requestsPerDay;
  const isOverLimit = isOverMinuteLimit || isOverDayLimit;
  
  // Calculate remaining before incrementing
  let minuteRemaining = Math.max(0, requestsPerMinute - perMinuteStore[minuteKey].hits);
  let dayRemaining = Math.max(0, requestsPerDay - perDayStore[dayKey].hits);
  
  // Only increment if not over limit
  if (!isOverLimit) {
    perMinuteStore[minuteKey].hits++;
    perDayStore[dayKey].hits++;
    
    // Recalculate remaining after incrementing
    minuteRemaining = Math.max(0, requestsPerMinute - perMinuteStore[minuteKey].hits);
    dayRemaining = Math.max(0, requestsPerDay - perDayStore[dayKey].hits);
  }
  
  // Return the most restrictive remaining limit
  const isMinuteLimitMoreRestrictive = minuteRemaining <= dayRemaining;
  
  return {
    success: !isOverLimit,
    limit: isMinuteLimitMoreRestrictive ? requestsPerMinute : requestsPerDay,
    remaining: Math.min(minuteRemaining, dayRemaining),
    resetAt: new Date(isMinuteLimitMoreRestrictive ? perMinuteStore[minuteKey].resetAt : perDayStore[dayKey].resetAt)
  };
} 