/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Drop the `x-powered-by: Next.js` header — no need to advertise the stack.
  poweredByHeader: false,

  // Tree-shake heavy barrel imports so only the icons / motion primitives
  // actually used get bundled instead of the whole package.
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'motion',
      '@react-three/drei',
      'three-stdlib',
    ],
  },

  // `/` only ever bounced to `/landing` via a client-side effect, which
  // shipped a JS bundle just to navigate. A permanent server redirect is
  // free, instant, and SEO-correct.
  async redirects() {
    return [
      { source: '/', destination: '/landing', permanent: true },
    ]
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
    // Cache optimized images aggressively — source art is content-hashed
    // by path, so a long TTL is safe.
    minimumCacheTTL: 31536000,
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
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
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
      // Long-lived caching for the heavy, never-changing media in /public.
      {
        source: '/(.*).(mp4|webm|webp|woff2|sog|glb|hdr)',
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
