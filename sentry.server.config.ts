import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Enable debug mode for setup troubleshooting
  debug: true,

  // Set environment
  environment: process.env.NODE_ENV,

  // Set release version
  release: '1.0.0',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
});
