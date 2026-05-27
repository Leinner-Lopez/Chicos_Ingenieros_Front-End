export function createWinstonLogger(): any {
  const req = new Function('m', 'return require(m)');
  const winston = req('winston');

  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.printf(
        ({ timestamp, level, message }: any) =>
          `${timestamp} [SSR] ${level.toUpperCase()} - ${message}`,
      ),
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });
}
