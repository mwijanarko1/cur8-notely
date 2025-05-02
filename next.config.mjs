/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    // Will only be available on the server side
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiTimeout: 30000, // 30 seconds
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    // Enable ESLint checking during builds
    ignoreDuringBuilds: false,
  },
};

export default nextConfig; 