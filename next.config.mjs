/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    // Will only be available on the server side
    geminiApiKey: 'AIzaSyBUQdgYQG4zdJ7vUlZcFjH1oKdTzi6E8yY',
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
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig; 