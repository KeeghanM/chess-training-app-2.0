import { withSentryConfig } from '@sentry/nextjs'

// Next.js configuration
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  headers: async () => [
    {
      source: '/dashboard',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store',
        },
      ],
    },
    {
      source: '/training/:slug',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store',
        },
      ],
    },
  ],
}

// Sentry configuration options
const sentryWebpackPluginOptions = {
  org: 'chesstraining',
  project: 'chesstrainingapp',
  // Suppresses source map uploading logs during build
  silent: true,
  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
  // Hides source maps from generated client bundles
  hideSourceMaps: false,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  // Enables automatic instrumentation of Vercel Cron Monitors.
  automaticVercelMonitors: true,
}

// Wrap your config with Sentry's configuration
const config = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
export default config
