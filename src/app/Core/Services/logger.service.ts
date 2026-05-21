import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';

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

  private async initWinston() {
    try {
      // Usamos Function() para que Angular no detecte los imports en compilación
      const req = new Function('m', 'return require(m)');

      const winston = req('winston');
      const path = req('path');
      const DailyRotateFile = req('winston-daily-rotate-file');

      const logPath = process.env['LOG_PATH'] || '/app/logs/frontend';

      this.logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
          winston.format.printf(
            ({ timestamp, level, message }: any) =>
              `${timestamp} [SSR] ${level.toUpperCase()} - ${message}`,
          ),
        ),
        transports: [
          new DailyRotateFile({
            filename: path.join(logPath, 'history', 'frontend-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '7d',
            maxSize: '50m',
            auditFile: path.join(logPath, '.audit.json'),
          }),
          new winston.transports.File({
            filename: path.join(logPath, 'frontend.log'),
            level: 'info',
          }),
          new winston.transports.Console(),
        ],
      });
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
    const detail = error instanceof Error ? error.message : String(error ?? '');
    const full = detail ? `${message} | ${detail}` : message;
    this.isServer && this.logger ? this.logger.error(full) : console.error(`[ERROR] ${full}`);
  }
}
