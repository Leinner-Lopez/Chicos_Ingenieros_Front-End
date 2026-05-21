import { ErrorHandler, inject, Injectable } from '@angular/core';
import { LoggerService } from '../Services/logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`Error global de Angular: ${message}`);
    console.error(error);
  }
}
