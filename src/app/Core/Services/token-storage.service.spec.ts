import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  afterEach(() => sessionStorage.clear());

  function buildService(platform = 'browser'): TokenStorageService {
    TestBed.configureTestingModule({
      providers: [
        TokenStorageService,
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });
    return TestBed.inject(TokenStorageService);
  }

  it('debe ser creado', () => {
    expect(buildService()).toBeTruthy();
  });

  describe('entorno browser', () => {
    it('save() debe guardar el token en sessionStorage', () => {
      buildService().save('mi-token');
      expect(sessionStorage.getItem('token')).toBe('mi-token');
    });

    it('get() debe retornar el token guardado', () => {
      sessionStorage.setItem('token', 'mi-token');
      expect(buildService().get()).toBe('mi-token');
    });

    it('get() debe retornar null si no hay token', () => {
      expect(buildService().get()).toBeNull();
    });

    it('clear() debe eliminar el token de sessionStorage', () => {
      sessionStorage.setItem('token', 'mi-token');
      buildService().clear();
      expect(sessionStorage.getItem('token')).toBeNull();
    });
  });

  describe('entorno no-browser (SSR)', () => {
    it('save() no debe escribir en sessionStorage', () => {
      buildService('server').save('mi-token');
      expect(sessionStorage.getItem('token')).toBeNull();
    });

    it('get() debe retornar null', () => {
      expect(buildService('server').get()).toBeNull();
    });

    it('clear() no debe lanzar error aunque no haya sessionStorage', () => {
      expect(() => buildService('server').clear()).not.toThrow();
    });
  });
});
