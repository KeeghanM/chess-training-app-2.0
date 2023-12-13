import { withSentryConfig } from "@sentry/nextjs";

// Next.js configuration
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  org: "chesstraining",
  project: "chesstrainingapp",
  // Suppresses source map uploading logs during build
  silent: true,
  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  // Enables automatic instrumentation of Vercel Cron Monitors.
  automaticVercelMonitors: true,
};

// Wrap your config with Sentry's configuration
const config = withSentryConfig(nextConfig, sentryWebpackPluginOptions);

export default config;
