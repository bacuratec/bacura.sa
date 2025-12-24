/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Support for Netlify
  ...(process.env.NETLIFY && {
    output: 'standalone',
  }),

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '51.112.209.149',
      },
    ],
    unoptimized: false,
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Webpack configuration for Supabase and other libraries
  webpack: (config, { isServer }) => {
    // Fix for Supabase
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
    // Enable MCP (Model Context Protocol) for dynamic development and debugging
    // MCP is automatically enabled in Next.js 16+ for dev server
    // This ensures MCP tools are available for real-time error detection and fixes
  },


  // Redirects for SPA compatibility
  async redirects() {
    return [];
  },

  // Rewrites for API proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://51.112.209.149:5141/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

