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
  });
});
