export interface LoggingConfig {
  logLevel: 'error' | 'warn' | 'log' | 'debug' | 'verbose';
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
  sanitizeSensitiveData: boolean;
  maxBodyLength: number;
  excludeRoutes: string[];
  includeHeaders: boolean;
}
