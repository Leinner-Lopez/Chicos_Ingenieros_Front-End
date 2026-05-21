import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../Services/logger.service';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  logger.info(`HTTP ${req.method} → ${req.url}`);

  return next(req).pipe(
    catchError((error) => {
      logger.error(
        `HTTP ${req.method} ${req.url} falló con status ${error.status}: ${error.message}`,
      );
      return throwError(() => error);
    }),
  );
};
