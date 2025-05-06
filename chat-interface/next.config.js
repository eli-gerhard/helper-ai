/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // API proxying - allows frontend to communicate with FastAPI backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_API_URL || 'http://localhost:8000/api/:path*',
      },
    ];
  },
  
  // Expose environment variables to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.BACKEND_API_URL || 'http://localhost:8000/api/chat',
  },
  
  // Explicitly specify image domains if using external images
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;