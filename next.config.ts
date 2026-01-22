import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance and security
  reactStrictMode: true,
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Build configuration - ignore TypeScript errors for deployment
  typescript: {
    ignoreBuildErrors: true,
  },

  // Mark @linera/client as external - it's a WASM module loaded at runtime
  serverExternalPackages: ['@linera/client'],

  // Turbopack configuration
  turbopack: {},

  // Disable source maps for production
  productionBrowserSourceMaps: false,

  // Webpack config for non-Turbopack builds
  webpack: (config, { isServer }) => {
    // Mark @linera/client as external for client-side
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@linera/client': '@linera/client',
      });

      // Optimize chunk splitting for large bundles
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          chunks: 'all',
          maxSize: 500000, // 500KB max chunk size
          cacheGroups: {
            // Vendor chunk for node_modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Security headers + COOP/COEP for SharedArrayBuffer (required by @linera/client WASM)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Required for SharedArrayBuffer (Linera WASM)
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ];
  },
};

export default nextConfig;
