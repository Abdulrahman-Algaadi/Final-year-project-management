import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../types/common.types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as { message?: string | string[] })?.message ??
          'Internal server error');

    const errorCode =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'errorCode' in exceptionResponse
        ? String((exceptionResponse as { errorCode: string }).errorCode)
        : HttpStatus[status] ?? 'UNKNOWN_ERROR';

    const body: ApiErrorResponse = {
      success: false,
      message: Array.isArray(message) ? message.join(', ') : message,
      errorCode,
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
      details:
        typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as { details?: unknown }).details
          : undefined,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }
}
