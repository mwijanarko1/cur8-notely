import { checkRateLimit } from './rateLimiter';

// Add a helper test to make sure Jest is working
test('should pass', () => {
  expect(true).toBe(true);
});

// Mock Date.now() to control time
const originalDateNow = Date.now;
let mockTime = 1625097600000; // Mock timestamp (July 1, 2021)

beforeAll(() => {
  // Mock Date.now to return our controlled time
  Date.now = jest.fn(() => mockTime);
});

afterAll(() => {
  // Restore original Date.now implementation
  Date.now = originalDateNow;
});

// Clear the in-memory stores between tests
jest.isolateModules(() => {
  jest.resetModules();
});

describe('Rate Limiter', () => {
  // Generate a unique IP for each test to avoid cross-test contamination
  const getTestIp = () => `127.0.0.${Math.floor(Math.random() * 255)}`;
  
  beforeEach(() => {
    // Reset mock time
    mockTime = 1625097600000;
  });
  
  test('allows requests within rate limit', () => {
    const testIp = getTestIp();
    const requestsPerMinute = 5;
    const requestsPerDay = 20;
    
    // Make 4 requests (should all be allowed)
    for (let i = 0; i < 4; i++) {
      const result = checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
      expect(result.success).toBe(true);
      // The remaining count includes the current request
      expect(result.remaining).toBe(Math.max(0, requestsPerMinute - (i + 1)));
    }
    
    // Fifth request should still be allowed
    const result = checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });
  
  test('blocks requests over minute limit', () => {
    const testIp = getTestIp();
    const requestsPerMinute = 5;
    const requestsPerDay = 20;
    
    // Make 5 requests (all allowed)
    for (let i = 0; i < requestsPerMinute; i++) {
      const result = checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
      expect(result.success).toBe(true);
    }
    
    // Sixth request should be blocked
    const result = checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });
  
  test('blocks requests over day limit', () => {
    const testIp = getTestIp();
    const requestsPerMinute = 100; // High value to test day limit
    const requestsPerDay = 20;
    
    // Make 20 requests (all allowed)
    for (let i = 0; i < requestsPerDay; i++) {
      const result = checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
      expect(result.success).toBe(true);
    }
    
    // 21st request should be blocked
    const result = checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });
  
  test('resets limits after minute window expires', () => {
    const testIp = getTestIp();
    const requestsPerMinute = 5;
    const requestsPerDay = 20;
    
    // Make 5 requests (uses up all minute allowance)
    for (let i = 0; i < requestsPerMinute; i++) {
      checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
    }
    
    // Verify we're rate limited
    let result = checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
    expect(result.success).toBe(false);
    
    // Advance time past 1 minute
    mockTime += 61000; // 61 seconds later
    
    // Should be allowed again after reset
    result = checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
    expect(result.success).toBe(true);
    // After 1 request, we should have 4 remaining
    expect(result.remaining).toBe(requestsPerMinute - 1);
  });
  
  test('resets limits after day window expires', () => {
    const testIp = getTestIp();
    const requestsPerMinute = 100; // High value to test day limit
    const requestsPerDay = 20;
    
    // Make 20 requests (uses up all day allowance)
    for (let i = 0; i < requestsPerDay; i++) {
      checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
    }
    
    // Verify we're rate limited
    let result = checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
    expect(result.success).toBe(false);
    
    // Advance time past 1 day
    mockTime += 86400100; // Just over 24 hours later
    
    // Should be allowed again after reset
    result = checkRateLimit(testIp, requestsPerMinute, requestsPerDay);
    expect(result.success).toBe(true);
    // After 1 request, we should have 19 remaining
    expect(result.remaining).toBe(requestsPerDay - 1);
  });
}); 