import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { LoggerService } from './logger.service';

const GENERIC_ERROR_MSG = '[ERROR] Ha ocurrido un error inesperado. Revisa los logs del servidor.';

describe('LoggerService (browser)', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoggerService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(LoggerService);
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('info()', () => {
    it('debe ser silencioso en el browser para no exponer URLs en consola', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      service.info('mensaje de prueba');
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('warn()', () => {
    it('debe ser silencioso en el browser para no exponer información interna', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      service.warn('advertencia de prueba');
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('error()', () => {
    it('debe llamar a console.error con mensaje genérico sin exponer detalles internos', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.error('error de prueba');
      expect(spy).toHaveBeenCalledWith(GENERIC_ERROR_MSG);
      spy.mockRestore();
    });

    it('debe usar mensaje genérico incluso cuando se pasa un Error adicional', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.error('fallo al cargar', new Error('timeout'));
      expect(spy).toHaveBeenCalledWith(GENERIC_ERROR_MSG);
      spy.mockRestore();
    });

    it('debe usar mensaje genérico incluso con un valor primitivo como segundo argumento', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.error('código de error', 404);
      expect(spy).toHaveBeenCalledWith(GENERIC_ERROR_MSG);
      spy.mockRestore();
    });

    it('debe usar mensaje genérico incluso con un objeto como segundo argumento', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.error('respuesta inválida', { code: 500, detail: 'Internal Server Error' });
      expect(spy).toHaveBeenCalledWith(GENERIC_ERROR_MSG);
      spy.mockRestore();
    });

    it('debe usar mensaje genérico cuando el segundo argumento es undefined', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.error('sin detalle', undefined);
      expect(spy).toHaveBeenCalledWith(GENERIC_ERROR_MSG);
      spy.mockRestore();
    });
  });
});

describe('LoggerService (server — initWinston falla en entorno de test)', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoggerService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    service = TestBed.inject(LoggerService);
  });

  it('debe ser creado sin lanzar aunque initWinston falle', () => {
    expect(service).toBeTruthy();
  });

  it('info() debe ser silencioso cuando logger es null', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    service.info('fallback info');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('warn() debe ser silencioso cuando logger es null', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    service.warn('fallback warn');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('error() debe llamar a console.error con mensaje genérico cuando logger es null', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    service.error('fallback error');
    expect(spy).toHaveBeenCalledWith(GENERIC_ERROR_MSG);
    spy.mockRestore();
  });
});

describe('LoggerService (server — winston disponible)', () => {
  let service: LoggerService;
  let mockWinstonLogger: { info: ReturnType<typeof vi.fn>; warn: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockWinstonLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        LoggerService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    service = TestBed.inject(LoggerService);
    (service as any).logger = mockWinstonLogger;
  });

  it('info() debe delegar a winston.info', () => {
    service.info('mensaje info server');
    expect(mockWinstonLogger.info).toHaveBeenCalledWith('mensaje info server');
  });

  it('warn() debe delegar a winston.warn', () => {
    service.warn('advertencia server');
    expect(mockWinstonLogger.warn).toHaveBeenCalledWith('advertencia server');
  });

  it('error() debe delegar a winston.error con mensaje completo', () => {
    service.error('fallo crítico', new Error('conexión rechazada'));
    expect(mockWinstonLogger.error).toHaveBeenCalledWith('fallo crítico | conexión rechazada');
  });

  it('error() sin segundo argumento solo pasa el mensaje a winston.error', () => {
    service.error('error simple');
    expect(mockWinstonLogger.error).toHaveBeenCalledWith('error simple');
  });
});
