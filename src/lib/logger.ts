interface LogContext {
  error?: Error;
  [key: string]: unknown;
}

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
} as const;

type LogLevelKey = keyof typeof LOG_LEVELS;

const isDevelopment = process.env.NODE_ENV === 'development';
const currentLevel = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

function formatMessage(level: LogLevelKey, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
}

function shouldLog(level: number): boolean {
  return level <= currentLevel;
}

export const logger = {
  error(message: string, context?: LogContext): void {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      const formatted = formatMessage('ERROR', message, context);
      if (!isDevelopment && context?.error) {
        // Example: Sentry, DataDog, etc.
        // Sentry.captureException(context.error);
      }
      // throw new Error(formatted);
      console.error(formatted);
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(formatMessage('WARN', message, context));
      // throw new Error(formatMessage('WARN', message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.warn(formatMessage('INFO', message, context));
      // throw new Error(formatMessage('WARN', message, context));
    }
  },

  debug(message: string, context?: LogContext): void {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.warn(formatMessage('DEBUG', message, context));
      // throw new Error(formatMessage('WARN', message, context));
    }
  },
};
