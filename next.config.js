// @ts-ignore
await import("./src/env.ts");

/** @type {import("next").NextConfig} */
const config = {
  // Enable React Strict Mode for better development practices
  reactStrictMode: true,
  
  // Configure image optimization
  images: {
    domains: [
      'localhost',
      'auth-app', // Add your production domain
      'vercel.app', // For Vercel deployment
 
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Enable SWC minification for faster builds (enabled by default in Next.js 14)
  swcMinify: true,
  
  // Configure compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep error and warn logs in production
    } : false,
  },
  
  // Experimental features (use with caution)
  experimental: {
    optimizeCss: false, // Set to true if you want CSS optimization
    scrollRestoration: true,
  },
  
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache static assets
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  
  // Webpack configuration (if needed)
  webpack: (config, { isServer }) => {
    // Handle specific webpack issues
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Output configuration (remove 'export' if you have server-side features)
  // output: 'standalone', // Uncomment for optimized Docker deployments
};

export default config;