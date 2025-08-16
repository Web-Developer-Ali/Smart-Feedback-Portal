/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Static output for standalone deployment
  output: 'standalone',

  // ✅ Image optimization with fallback for external handling
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false, // ✅ Let Next.js optimize unless handled externally
  },

  // ✅ Compression for faster responses
  compress: true,

  // ✅ Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // ✅ Turbo config (now stable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // ✅ Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-Robots-Tag', value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        ],
      },
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot|otf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },

  // ✅ Webpack customization
  webpack: (
    config: import('webpack').Configuration,
    { dev, isServer }: { dev: boolean; isServer: boolean }
  ) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },

  // ✅ Environment variables
  env: {
    SITE_NAME: 'Smart Feedback Portal',
    SITE_DESCRIPTION: 'Professional project management and client feedback platform',
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://smartfeedbackportal.com',
  },

  // ✅ Core settings
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: true,
  trailingSlash: false,

  // ✅ Build settings
  eslint: {
    ignoreDuringBuilds: false, // ✅ Enforce linting
  },
  typescript: {
    ignoreBuildErrors: false, // ✅ Enforce type safety
  },
};

export default nextConfig;