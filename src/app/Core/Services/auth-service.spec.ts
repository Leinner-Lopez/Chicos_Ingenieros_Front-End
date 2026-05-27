import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth-service';
import { LoginRequest } from '../../Data/Interfaces/LoginRequest';
import { RegisterRequest } from '../../Data/Interfaces/RegisterRequest';
import { API_URL } from '../../tokens/api-url.token';
import { environment } from '../../../environments/environment';

const apiUrl = `${environment.apiUrl}/auth`;

function createMockJwt(payload: object): string {
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.fakesig`;
}

const validToken = createMockJwt({
  sub: 'admin@test.com',
  role: 'ADMIN',
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
});

const expiredToken = createMockJwt({
  sub: 'admin@test.com',
  role: 'ADMIN',
  exp: Math.floor(Date.now() / 1000) - 3600,
  iat: Math.floor(Date.now() / 1000) - 7200,
});

describe('AuthService', () => {
  describe('constructor - inicialización desde sessionStorage', () => {
    afterEach(() => {
      sessionStorage.clear();
      TestBed.inject(HttpTestingController).verify();
    });

    function buildService(initialToken?: string): AuthService {
      if (initialToken) sessionStorage.setItem('token', initialToken);
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthService,
          { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: Router, useValue: { navigate: vi.fn(), url: '/login' } },
          { provide: API_URL, useValue: environment.apiUrl },
        ],
      });
      return TestBed.inject(AuthService);
    }

    it('debe inicializarse sin autenticación cuando sessionStorage está vacío', () => {
      const service = buildService();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getToken()).toBeNull();
    });

    it('debe restaurar la sesión si hay un token válido en sessionStorage', () => {
      const service = buildService(validToken);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.getToken()).toBe(validToken);
    });

    it('debe cerrar sesión si el token guardado está expirado', () => {
      const service = buildService(expiredToken);
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getToken()).toBeNull();
    });
  });

  describe('métodos', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    const navigateCalls: any[][] = [];
    const routerMock = {
      navigate: (cmds: any[]) => navigateCalls.push(cmds),
      url: '/dashboard',
    };

    beforeEach(() => {
      sessionStorage.clear();
      routerMock.url = '/dashboard';

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthService,
          { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: Router, useValue: routerMock },
          { provide: API_URL, useValue: environment.apiUrl },
        ],
      });

      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      // Limpiar después de crear el servicio para descartar el navigate del constructor
      navigateCalls.length = 0;
    });

    afterEach(() => {
      httpMock.verify();
      sessionStorage.clear();
    });

    it('debe ser creado', () => {
      expect(service).toBeTruthy();
    });

    describe('isTokenExpired()', () => {
      it('debe retornar true para token nulo', () => {
        expect(service.isTokenExpired(null)).toBe(true);
      });

      it('debe retornar true para token expirado', () => {
        expect(service.isTokenExpired(expiredToken)).toBe(true);
      });

      it('debe retornar false para token vigente', () => {
        expect(service.isTokenExpired(validToken)).toBe(false);
      });

      it('debe retornar true para token malformado', () => {
        expect(service.isTokenExpired('no.es.untoken')).toBe(true);
      });
    });

    describe('login()', () => {
      it('debe enviar POST al endpoint correcto con las credenciales', () => {
        const credentials: LoginRequest = { username: 'admin@test.com', password: 'pass123' };

        service.login(credentials).subscribe();

        const req = httpMock.expectOne(`${apiUrl}/login`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(credentials);
        req.flush({ token: validToken, userId: 5, userRole: 'ADMIN' });
      });

      it('debe guardar el token en sessionStorage y actualizar todas las señales', () => {
        const credentials: LoginRequest = { username: 'admin@test.com', password: 'pass123' };

        service.login(credentials).subscribe();
        httpMock.expectOne(`${apiUrl}/login`).flush({ token: validToken, userId: 5, userRole: 'ADMIN' });

        expect(sessionStorage.getItem('token')).toBe(validToken);
        expect(service.isAuthenticated()).toBe(true);
        expect(service.getToken()).toBe(validToken);
        expect(service.getUserRole()).toBe('ADMIN');
        expect(service.getUserEmail()).toBe('admin@test.com');
        expect(service.getUserId()).toBe(5);
      });
    });

    describe('register()', () => {
      it('debe enviar POST con los datos del nuevo usuario', () => {
        const userData: RegisterRequest = {
          documentNumber: '1234567890',
          firstName: 'Juan',
          lastName: 'Pérez',
          phoneNumber: '3001234567',
          email: 'juan@test.com',
          password: 'pass123',
        };

        service.register(userData).subscribe((resp) => {
          expect(resp.message).toBe('Registro exitoso');
        });

        const req = httpMock.expectOne(`${apiUrl}/register`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(userData);
        req.flush({ message: 'Registro exitoso' });
      });
    });

    describe('logout()', () => {
      beforeEach(() => {
        service.token.set(validToken);
        service.isAuthenticated.set(true);
        service.userRole.set('ADMIN');
        service.userEmail.set('admin@test.com');
        service.userId.set(1);
        sessionStorage.setItem('token', validToken);
      });

      it('debe limpiar todas las señales', () => {
        service.logout();

        expect(service.getToken()).toBeNull();
        expect(service.isAuthenticated()).toBe(false);
        expect(service.getUserRole()).toBeNull();
        expect(service.getUserEmail()).toBeNull();
        expect(service.getUserId()).toBeNull();
      });

      it('debe eliminar el token de sessionStorage', () => {
        service.logout();
        expect(sessionStorage.getItem('token')).toBeNull();
      });

      it('debe redirigir a /login cuando el usuario no está en esa ruta', () => {
        routerMock.url = '/admin/inicio';
        service.logout();
        expect(navigateCalls).toContainEqual(['/login']);
      });

      it('no debe redirigir si ya está en /login', () => {
        routerMock.url = '/login';
        service.logout();
        expect(navigateCalls.length).toBe(0);
      });
    });

    describe('getHomeRoute()', () => {
      it('debe retornar /admin/inicio para el rol ADMIN', () => {
        service.userRole.set('ADMIN');
        expect(service.getHomeRoute()).toBe('/admin/inicio');
      });

      it('debe retornar /customer/inicio para el rol CUSTOMER', () => {
        service.userRole.set('CUSTOMER');
        expect(service.getHomeRoute()).toBe('/customer/inicio');
      });

      it('debe retornar /store/inicio para el rol STORE', () => {
        service.userRole.set('STORE');
        expect(service.getHomeRoute()).toBe('/store/inicio');
      });

      it('debe retornar /login para un rol desconocido', () => {
        service.userRole.set('UNKNOWN');
        expect(service.getHomeRoute()).toBe('/login');
      });

      it('debe retornar /login cuando el rol es null', () => {
        service.userRole.set(null);
        expect(service.getHomeRoute()).toBe('/login');
      });
    });

    describe('getters', () => {
      it('getToken() debe retornar el valor de la señal token', () => {
        service.token.set('mi-token');
        expect(service.getToken()).toBe('mi-token');
      });

      it('getUserRole() debe retornar el rol actual', () => {
        service.userRole.set('CUSTOMER');
        expect(service.getUserRole()).toBe('CUSTOMER');
      });

      it('getUserEmail() debe retornar el email actual', () => {
        service.userEmail.set('user@test.com');
        expect(service.getUserEmail()).toBe('user@test.com');
      });

      it('getUserId() debe retornar el id del usuario actual', () => {
        service.userId.set(42);
        expect(service.getUserId()).toBe(42);
      });
    });
  });
});
