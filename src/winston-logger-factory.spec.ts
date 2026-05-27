import { createWinstonLogger } from './winston-logger-factory';

describe('createWinstonLogger', () => {
  it('debe exportar una función', () => {
    expect(typeof createWinstonLogger).toBe('function');
  });

  it('debe lanzar cuando winston no está disponible en el entorno de test', () => {
    // new Function usa el scope global; en jsdom/Node require no es global, por eso lanza
    expect(() => createWinstonLogger()).toThrow();
  });

  describe('con require disponible en el scope global', () => {
    afterEach(() => {
      delete (globalThis as any).require;
    });

    it('debe crear un logger con los métodos info, warn y error cuando winston está disponible', () => {
      const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
      const mockWinston = {
        createLogger: vi.fn().mockReturnValue(mockLogger),
        format: {
          combine: vi.fn().mockReturnValue({}),
          timestamp: vi.fn().mockReturnValue({}),
          printf: vi.fn().mockReturnValue({}),
        },
        // Console se instancia con `new`: vi.fn() actúa como constructor por defecto
        transports: { Console: vi.fn() },
      };

      (globalThis as any).require = vi.fn().mockReturnValue(mockWinston);

      const logger = createWinstonLogger();

      expect(mockWinston.createLogger).toHaveBeenCalledOnce();
      expect(mockWinston.format.combine).toHaveBeenCalled();
      expect(mockWinston.format.timestamp).toHaveBeenCalledWith({ format: 'YYYY-MM-DD HH:mm:ss.SSS' });
      expect(logger).toBe(mockLogger);
    });

    it('el printf formatea el mensaje con timestamp, nivel y texto', () => {
      let capturedPrintf: ((info: any) => string) | undefined;
      const mockWinston = {
        createLogger: vi.fn().mockReturnValue({}),
        format: {
          combine: vi.fn().mockReturnValue({}),
          timestamp: vi.fn().mockReturnValue({}),
          printf: vi.fn().mockImplementation((fn: any) => {
            capturedPrintf = fn;
            return {};
          }),
        },
        transports: { Console: vi.fn() },
      };

      (globalThis as any).require = vi.fn().mockReturnValue(mockWinston);
      createWinstonLogger();

      expect(capturedPrintf).toBeDefined();
      const output = capturedPrintf!({ timestamp: '2026-01-01 12:00:00.000', level: 'info', message: 'hola' });
      expect(output).toBe('2026-01-01 12:00:00.000 [SSR] INFO - hola');
    });
  });
});
