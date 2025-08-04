import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const { method, url, params, query, body } = request;
    const requestId = request.requestId || 'unknown';

    // Log controller and handler method
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    this.logger.log(
      `[${requestId}] Executing ${controllerName}.${handlerName}() - ${method} ${url}`,
    );

    // Log route parameters if any
    if (params && Object.keys(params).length > 0) {
      this.logger.debug(
        `[${requestId}] Route Parameters: ${JSON.stringify(params)}`,
      );
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap((responseBody) => {
        const endTime = Date.now();
        const processingTime = endTime - startTime;

        this.logger.log(
          `[${requestId}] ${controllerName}.${handlerName}() completed in ${processingTime}ms - Status: ${response.statusCode}`,
        );

        // Log response body for debugging (only in development)
        if (process.env.NODE_ENV === 'development' && responseBody) {
          this.logger.debug(
            `[${requestId}] Response Body: ${JSON.stringify(responseBody, null, 2)}`,
          );
        }
      }),
      catchError((error) => {
        const endTime = Date.now();
        const processingTime = endTime - startTime;

        this.logger.error(
          `[${requestId}] ${controllerName}.${handlerName}() failed after ${processingTime}ms - Error: ${error.message}`,
          error.stack,
        );

        // Log error details
        this.logger.error(
          `[${requestId}] Error Details: ${JSON.stringify(
            {
              name: error.name,
              message: error.message,
              status: error.status || 500,
              timestamp: new Date().toISOString(),
              path: url,
              method: method,
              ...(error.response && { errorResponse: error.response }),
            },
            null,
            2,
          )}`,
        );

        return throwError(() => error);
      }),
    );
  }
}
