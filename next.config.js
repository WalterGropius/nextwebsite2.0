/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack configuration for Spark and bundle analyzer
  webpack: (config, { isServer }) => {
    // Fix for @sparkjsdev/spark WASM URL resolution
    // See: https://github.com/sparkjsdev/spark-react-r3f
    config.module.parser = {
      ...config.module.parser,
      javascript: {
        ...config.module.parser?.javascript,
        url: false, // disable parsing of `new URL()` syntax
      },
    }

    // Bundle analyzer (conditionally enabled)
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')()
      config.plugins.push(new BundleAnalyzerPlugin())
    }

    return config
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for performance
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
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

    ]
  },

  // Transpile packages that need it
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@sparkjsdev/spark'],

  // Output standalone for better performance
  output: 'standalone',
}

module.exports = nextConfig
