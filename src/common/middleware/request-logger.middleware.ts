import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { defaultLoggingConfig } from '../config/logging.config';
import { LoggingConfig } from '../interfaces';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestLogger');
  private readonly config: LoggingConfig = defaultLoggingConfig;

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip, headers } = req;

    // Skip logging for excluded routes
    if (
      this.config.excludeRoutes.some((route) => originalUrl.includes(route))
    ) {
      return next();
    }

    const userAgent = headers['user-agent'] || 'Unknown';
    const contentLength = headers['content-length'] || '0';
    const startTime = Date.now();

    // Generate a unique request ID for tracking
    const requestId = this.generateRequestId();
    req['requestId'] = requestId;

    if (this.config.logRequests) {
      // Log the incoming request
      this.logger.log(
        `[${requestId}] Incoming Request: ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent} - Content-Length: ${contentLength}`,
      );

      // Log request headers if enabled
      if (this.config.includeHeaders) {
        const sanitizedHeaders = this.sanitizeHeaders(headers);
        this.logger.debug(
          `[${requestId}] Request Headers: ${JSON.stringify(sanitizedHeaders)}`,
        );
      }

      // Log request body for POST/PUT/PATCH requests (excluding sensitive data)
      if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
        const sanitizedBody = this.config.sanitizeSensitiveData
          ? this.sanitizeRequestBody(req.body)
          : req.body;
        const bodyString = JSON.stringify(sanitizedBody);
        const truncatedBody =
          bodyString.length > this.config.maxBodyLength
            ? bodyString.substring(0, this.config.maxBodyLength) +
              '...[truncated]'
            : bodyString;

        this.logger.debug(`[${requestId}] Request Body: ${truncatedBody}`);
      }

      // Log query parameters
      if (Object.keys(req.query).length > 0) {
        this.logger.debug(
          `[${requestId}] Query Parameters: ${JSON.stringify(req.query)}`,
        );
      }
    }

    // Log response when it finishes
    res.on('finish', () => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const { statusCode } = res;
      const responseSize = res.get('content-length') || '0';

      // Log the response
      this.logger.log(
        `[${requestId}] Response: ${method} ${originalUrl} - Status: ${statusCode} - ${responseTime}ms - Size: ${responseSize}`,
      );

      // Log error responses with more detail
      if (statusCode >= 400 && this.config.logErrors) {
        this.logger.warn(
          `[${requestId}] Error Response: ${statusCode} - ${method} ${originalUrl} - ${responseTime}ms`,
        );
      }
    });

    next();
  }

  private generateRequestId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaderFields = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'authentication',
    ];

    const sanitized = { ...headers };
    for (const field of sensitiveHeaderFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    return sanitized;
  }

  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'auth',
      'pin',
      'otp',
      'cvv',
      'ssn',
      'cardNumber',
      'accountNumber',
    ];

    const sanitized = { ...body };

    const sanitizeObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item));
      }

      if (obj && typeof obj === 'object') {
        const sanitizedObj = { ...obj };
        for (const key in sanitizedObj) {
          if (
            sensitiveFields.some((field) =>
              key.toLowerCase().includes(field.toLowerCase()),
            )
          ) {
            sanitizedObj[key] = '***REDACTED***';
          } else if (typeof sanitizedObj[key] === 'object') {
            sanitizedObj[key] = sanitizeObject(sanitizedObj[key]);
          }
        }
        return sanitizedObj;
      }

      return obj;
    };

    return sanitizeObject(sanitized);
  }
}
