import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = undefined;

    // Handle HTTP exceptions (from NestJS)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    }
    // Handle Mongoose validation errors
    else if (exception instanceof MongooseError.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      details = Object.values(exception.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: (err as any).value,
      }));
    }
    // Handle Mongoose cast errors (invalid ObjectId, etc.)
    else if (exception instanceof MongooseError.CastError) {
      status = HttpStatus.BAD_REQUEST;
      message = `Invalid ${exception.path}: ${exception.value}`;
    }
    // Handle MongoDB duplicate key errors
    else if (exception.code === 11000) {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate key error';
      const field = Object.keys(exception.keyValue)[0];
      details = {
        field,
        message: `${field} already exists`,
        value: exception.keyValue[field],
      };
    }
    // Handle connection errors
    else if (
      exception.name === 'MongoNetworkError' ||
      exception.name === 'MongoTimeoutError'
    ) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection error';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
      ...(details && { details }),
    };

    response.status(status).json(errorResponse);
  }
}
