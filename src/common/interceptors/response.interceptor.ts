import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // Simply wrap the response as-is without any modification
        const message = data?.message || this.getDefaultMessage(response.statusCode);

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data: data, // Keep everything as-is
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      200: 'Success',
      201: 'Resource created successfully',
      204: 'Resource deleted successfully',
    };
    return messages[statusCode] || 'Operation successful';
  }
}
