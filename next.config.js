/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
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

  // Configurações para otimizar o build
  hideSourceMaps: true, // Esconde os source maps em produção
  disableServerWebpackPlugin: true, // Desabilita o plugin no servidor
  disableClientWebpackPlugin: true, // Desabilita o plugin no cliente
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
