import { LoggingConfig } from '../interfaces';

export const defaultLoggingConfig: LoggingConfig = {
  logLevel: process.env.NODE_ENV === 'production' ? 'log' : 'debug',
  logRequests: true,
  logResponses: process.env.NODE_ENV !== 'production',
  logErrors: true,
  sanitizeSensitiveData: true,
  maxBodyLength: 1000, // Maximum characters to log for request/response bodies
  excludeRoutes: ['/health', '/metrics'], // Routes to exclude from logging
  includeHeaders: process.env.NODE_ENV !== 'production',
};
