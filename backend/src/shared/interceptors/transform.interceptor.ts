import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiResponse } from '../types/common.types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request & { requestId?: string }>();

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiResponse<T>;
        }

        const meta =
          data && typeof data === 'object' && 'meta' in data
            ? (data as { meta: ApiResponse<T>['meta'] }).meta
            : undefined;

        const payload =
          data && typeof data === 'object' && 'data' in data
            ? (data as { data: T }).data
            : data;

        return {
          success: true,
          data: payload as T,
          meta,
          timestamp: new Date().toISOString(),
          requestId: request.requestId,
        };
      }),
    );
  }
}
