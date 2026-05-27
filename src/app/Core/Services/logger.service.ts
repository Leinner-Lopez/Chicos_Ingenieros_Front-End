import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { createWinstonLogger } from '../../../winston-logger-factory';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private logger: any = null;
  private readonly isServer: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isServer = isPlatformServer(platformId);
    if (this.isServer) {
      this.initWinston();
    }
  }

  private initWinston() {
    try {
      this.logger = createWinstonLogger();
    } catch (e) {
      console.error('[LoggerService] Error iniciando Winston:', e);
    }
  }

  info(message: string) {
    this.isServer && this.logger ? this.logger.info(message) : console.log(`[INFO] ${message}`);
  }

  warn(message: string) {
    this.isServer && this.logger ? this.logger.warn(message) : console.warn(`[WARN] ${message}`);
  }

  error(message: string, error?: unknown) {
    let detail = '';
    if (error instanceof Error) {
      detail = error.message;
    } else if (typeof error === 'object' && error !== null) {
      detail = JSON.stringify(error);
    } else {
      detail = String((error as string | number) ?? '');
    }
    const full = detail ? `${message} | ${detail}` : message;
    this.isServer && this.logger ? this.logger.error(full) : console.error(`[ERROR] ${full}`);
  }
}
