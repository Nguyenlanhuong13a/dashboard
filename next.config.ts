import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React 19 features
  reactStrictMode: true,
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  
  // Experimental features for Next.js 15+
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
