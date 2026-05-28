import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  
  // Turbopack configuration
  turbopack: {
    root: __dirname,
  },
  
  // Optimize production builds
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
