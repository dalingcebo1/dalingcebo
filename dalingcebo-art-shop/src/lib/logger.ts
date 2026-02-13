/**
 * Structured logging utility for server-side operations
 * Provides consistent, searchable logs without exposing secrets
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  method?: string;
  route?: string;
  artworkId?: string | number;
  orderId?: string;
  status?: number;
  error?: string;
  duration?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Sanitize context to ensure no secrets are logged
 * Filters out common secret-related keys
 */
function sanitizeContext(context: LogContext): LogContext {
  const sanitized = { ...context };
  const secretKeys = [
    'password',
    'secret',
    'token',
    'apikey',
    'api_key',
    'auth',
    'authorization',
    'key',
    'signature',
    'webhook_secret',
  ];
  
  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (secretKeys.some(secretKey => lowerKey.includes(secretKey))) {
      delete sanitized[key];
    }
  });
  
  return sanitized;
}

/**
 * Log a structured message
 */
function log(level: LogLevel, message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();
  const sanitizedContext = context ? sanitizeContext(context) : {};
  
  const logEntry = {
    timestamp,
    level,
    message,
    ...sanitizedContext,
  };
  
  // Use appropriate console method based on level
  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};
