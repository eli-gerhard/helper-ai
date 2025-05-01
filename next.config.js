/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Allow API calls to backend in production
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: process.env.API_URL || 'http://localhost:8000/api/:path*',
        },
      ];
    },
    // Expose environment variables to the browser
    env: {
      REACT_APP_API_URL: process.env.API_URL || 'http://localhost:8000/api/chat',
    },
  };
  
  module.exports = nextConfig;