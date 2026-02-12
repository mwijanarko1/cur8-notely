/**
 * Get Gemini API key from environment
 * @returns Gemini API key or empty string
 */
export function getServerRuntimeConfig() {
  return {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  };
}

/**
 * Get public configuration
 * @returns Public configuration
 */
export function getPublicRuntimeConfig() {
  return {
    apiTimeout: 30000, // 30 seconds
  };
}