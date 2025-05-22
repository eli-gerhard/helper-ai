/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Expose environment variables to the browser
  env: {
    NEXT_PUBLIC_API_URL: '/api/chat',
  },
  
  // Explicitly specify image domains if using external images
  images: {
    domains: ['localhost'],
  },
  
  // Configure output mode for deployment
  output: 'standalone',
};

module.exports = nextConfig;