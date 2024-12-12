/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['uploadthing.com', 'utfs.io'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ignore browser extension errors in development
    if (dev && !isServer) {
      config.infrastructureLogging = {
        level: 'error',
      }
    }
    return config
  },
}

const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: "modernodev",
  project: "luna",
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
