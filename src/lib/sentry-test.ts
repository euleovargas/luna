import * as Sentry from "@sentry/nextjs";

export const testSentryError = () => {
  try {
    throw new Error("Test Sentry Error");
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const testSentryMessage = (message: string) => {
  Sentry.captureMessage(message, "info");
};
