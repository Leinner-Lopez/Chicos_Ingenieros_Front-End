import { TestBed } from '@angular/core/testing';
import { MenuConfigService } from './menu-config.service';

describe('MenuConfigService', () => {
  let service: MenuConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuConfigService);
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('getMenuByRole()', () => {
    describe('ADMIN', () => {
      it('debe retornar 7 items', () => {
        expect(service.getMenuByRole('ADMIN').length).toBe(7);
      });

      it('debe incluir todas las rutas del dashboard de administrador', () => {
        const routes = service.getMenuByRole('ADMIN').map((i) => i.route);
        expect(routes).toContain('/admin/inicio');
        expect(routes).toContain('/admin/users');
        expect(routes).toContain('/admin/lotes');
        expect(routes).toContain('/admin/productos');
        expect(routes).toContain('/admin/categorias');
        expect(routes).toContain('/admin/inventario');
        expect(routes).toContain('/admin/ventas');
      });

      it('el primer item debe ser Inicio con ruta /admin/inicio', () => {
        const first = service.getMenuByRole('ADMIN')[0];
        expect(first.label).toBe('Inicio');
        expect(first.route).toBe('/admin/inicio');
      });
    });

    describe('STORE', () => {
      it('debe retornar 2 items', () => {
        expect(service.getMenuByRole('STORE').length).toBe(2);
      });

      it('debe incluir /store/inicio y /store/lotes', () => {
        const routes = service.getMenuByRole('STORE').map((i) => i.route);
        expect(routes).toContain('/store/inicio');
        expect(routes).toContain('/store/lotes');
      });

      it('no debe incluir rutas de admin', () => {
        const routes = service.getMenuByRole('STORE').map((i) => i.route);
        expect(routes.some((r) => r.startsWith('/admin'))).toBe(false);
      });
    });

    describe('CUSTOMER', () => {
      it('debe retornar 2 items', () => {
        expect(service.getMenuByRole('CUSTOMER').length).toBe(2);
      });

      it('debe incluir /customer/inicio y /customer/productos', () => {
        const routes = service.getMenuByRole('CUSTOMER').map((i) => i.route);
        expect(routes).toContain('/customer/inicio');
        expect(routes).toContain('/customer/productos');
      });

      it('no debe incluir rutas de admin ni store', () => {
        const routes = service.getMenuByRole('CUSTOMER').map((i) => i.route);
        expect(routes.some((r) => r.startsWith('/admin') || r.startsWith('/store'))).toBe(false);
      });
    });

    describe('roles inválidos', () => {
      it('null debe retornar un array vacío', () => {
        expect(service.getMenuByRole(null)).toEqual([]);
      });

      it('un rol desconocido debe retornar un array vacío', () => {
        expect(service.getMenuByRole('UNKNOWN')).toEqual([]);
      });
    });

    describe('estructura de los items', () => {
      it('cada item de ADMIN debe tener label, icon y route', () => {
        service.getMenuByRole('ADMIN').forEach((item) => {
          expect(item.label).toBeTruthy();
          expect(item.icon).toBeTruthy();
          expect(item.route).toBeTruthy();
        });
      });
    });
  });
});
