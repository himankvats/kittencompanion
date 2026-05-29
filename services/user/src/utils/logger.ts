/**
 * Structured JSON logger for the user service. CloudWatch-compatible output.
 * See TDD Section 10.1 for logging specification.
 */

type LogContext = Record<string, unknown>;

const createLogEntry = (level: string, message: string, context?: LogContext, error?: Error): string =>
  JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'user',
    ...(context ? { context } : {}),
    ...(error ? { error: error.message, stack: error.stack } : {}),
  });

export const logger = {
  info: (message: string, context?: LogContext): void => {
    console.log(createLogEntry('INFO', message, context));
  },
  warn: (message: string, context?: LogContext): void => {
    console.warn(createLogEntry('WARN', message, context));
  },
  error: (message: string, error: Error, context?: LogContext): void => {
    console.error(createLogEntry('ERROR', message, context, error));
  },
  debug: (message: string, context?: LogContext): void => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(createLogEntry('DEBUG', message, context));
    }
  },
};

export default logger;
