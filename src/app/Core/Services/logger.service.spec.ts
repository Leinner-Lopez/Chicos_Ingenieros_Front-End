import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { LoggerService } from './logger.service';

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
    it('debe llamar a console.log con el prefijo [INFO]', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      service.info('mensaje de prueba');
      expect(spy).toHaveBeenCalledWith('[INFO] mensaje de prueba');
      spy.mockRestore();
    });
  });

  describe('warn()', () => {
    it('debe llamar a console.warn con el prefijo [WARN]', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      service.warn('advertencia de prueba');
      expect(spy).toHaveBeenCalledWith('[WARN] advertencia de prueba');
      spy.mockRestore();
    });
  });

  describe('error()', () => {
    it('debe llamar a console.error con el prefijo [ERROR] sin detalle adicional', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.error('error de prueba');
      expect(spy).toHaveBeenCalledWith('[ERROR] error de prueba');
      spy.mockRestore();
    });

    it('debe incluir el mensaje del Error cuando se pasa como segundo argumento', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.error('fallo al cargar', new Error('timeout'));
      expect(spy).toHaveBeenCalledWith('[ERROR] fallo al cargar | timeout');
      spy.mockRestore();
    });

    it('debe convertir a string un valor primitivo pasado como segundo argumento', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.error('código de error', 404);
      expect(spy).toHaveBeenCalledWith('[ERROR] código de error | 404');
      spy.mockRestore();
    });

    it('debe serializar un objeto plano como JSON', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.error('respuesta inválida', { code: 500, detail: 'Internal Server Error' });
      expect(spy).toHaveBeenCalledWith('[ERROR] respuesta inválida | {"code":500,"detail":"Internal Server Error"}');
      spy.mockRestore();
    });

    it('debe mostrar solo el mensaje cuando el segundo argumento es undefined', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.error('sin detalle', undefined);
      expect(spy).toHaveBeenCalledWith('[ERROR] sin detalle');
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
    // El constructor llama a initWinston() que falla en test (require no es global),
    // por lo que logger queda null y los métodos caen al path de console.
    service = TestBed.inject(LoggerService);
  });

  it('debe ser creado sin lanzar aunque initWinston falle', () => {
    expect(service).toBeTruthy();
  });

  it('info() debe usar console.log como fallback cuando logger es null', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    service.info('fallback info');
    expect(spy).toHaveBeenCalledWith('[INFO] fallback info');
    spy.mockRestore();
  });

  it('warn() debe usar console.warn como fallback cuando logger es null', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    service.warn('fallback warn');
    expect(spy).toHaveBeenCalledWith('[WARN] fallback warn');
    spy.mockRestore();
  });

  it('error() debe usar console.error como fallback cuando logger es null', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    service.error('fallback error');
    expect(spy).toHaveBeenCalledWith('[ERROR] fallback error');
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
    // initWinston() falla en test env → logger = null. Lo reemplazamos para simular el happy path.
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
