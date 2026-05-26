import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const req = new Function('m', 'return require(m)');
const winston = req('winston');
const path = req('path');
const DailyRotateFile = req('winston-daily-rotate-file');

const logPath = process.env['LOG_PATH'] || './Logs/frontend';

const logger = winston.createLogger({
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

logger.info('SSR server iniciando...');

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let url: string;
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = input.url;
  }
  logger.info(`FETCH → ${url}`);
  try {
    const response = await originalFetch(input, init);
    if (!response.ok) {
      logger.error(`FETCH ${url} respondió con status ${response.status}`);
    }
    return response;
  } catch (error: any) {
    logger.error(`FETCH ${url} falló: ${error.message}`);
    throw error;
  }
};

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// ✅ Log de cada request de navegación que llega al SSR
app.use((req: any, res: any, next: any) => {
  logger.info(`HTTP ${req.method} → ${req.path}`);
  next();
});

app.use((req: any, res: any, next: any) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch((error: any) => {
      logger.error(`Error manejando ${req.path}: ${error.message}`);
      next(error);
    });
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    logger.info(`Node Express server escuchando en puerto ${port}`);
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
