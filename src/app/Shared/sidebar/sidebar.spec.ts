import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';
import { AuthService } from '../../Core/Services/auth-service';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let mockAuthService: {
    getUserRole: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  async function setup(role: string) {
    mockAuthService = {
      getUserRole: vi.fn().mockReturnValue(role),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('menú para ADMIN', () => {
    it('debe tener 7 items de menú', async () => {
      await setup('ADMIN');
      expect(component.menuItems().length).toBe(7);
    });

    it('debe incluir la ruta /admin/inicio', async () => {
      await setup('ADMIN');
      expect(component.menuItems().some((i) => i.route === '/admin/inicio')).toBe(true);
    });

    it('debe incluir la ruta /admin/users', async () => {
      await setup('ADMIN');
      expect(component.menuItems().some((i) => i.route === '/admin/users')).toBe(true);
    });

    it('debe incluir la ruta /admin/lotes', async () => {
      await setup('ADMIN');
      expect(component.menuItems().some((i) => i.route === '/admin/lotes')).toBe(true);
    });

    it('debe incluir la ruta /admin/productos', async () => {
      await setup('ADMIN');
      expect(component.menuItems().some((i) => i.route === '/admin/productos')).toBe(true);
    });

    it('debe incluir la ruta /admin/inventario', async () => {
      await setup('ADMIN');
      expect(component.menuItems().some((i) => i.route === '/admin/inventario')).toBe(true);
    });

    it('debe incluir la ruta /admin/ventas', async () => {
      await setup('ADMIN');
      expect(component.menuItems().some((i) => i.route === '/admin/ventas')).toBe(true);
    });

    it('el primer item debe ser Inicio', async () => {
      await setup('ADMIN');
      expect(component.menuItems()[0].label).toBe('Inicio');
      expect(component.menuItems()[0].route).toBe('/admin/inicio');
    });
  });

  describe('menú para STORE', () => {
    it('debe tener 2 items de menú', async () => {
      await setup('STORE');
      expect(component.menuItems().length).toBe(2);
    });

    it('debe incluir la ruta /store/inicio', async () => {
      await setup('STORE');
      expect(component.menuItems().some((i) => i.route === '/store/inicio')).toBe(true);
    });

    it('debe incluir la ruta /store/lotes', async () => {
      await setup('STORE');
      expect(component.menuItems().some((i) => i.route === '/store/lotes')).toBe(true);
    });

    it('no debe incluir rutas de admin', async () => {
      await setup('STORE');
      expect(component.menuItems().some((i) => i.route.startsWith('/admin'))).toBe(false);
    });
  });

  describe('menú para CUSTOMER (y otros roles)', () => {
    it('debe tener 2 items de menú', async () => {
      await setup('CUSTOMER');
      expect(component.menuItems().length).toBe(2);
    });

    it('debe incluir la ruta /customer/inicio', async () => {
      await setup('CUSTOMER');
      expect(component.menuItems().some((i) => i.route === '/customer/inicio')).toBe(true);
    });

    it('debe incluir la ruta /customer/productos', async () => {
      await setup('CUSTOMER');
      expect(component.menuItems().some((i) => i.route === '/customer/productos')).toBe(true);
    });

    it('un rol desconocido debe devolver un menú vacío', async () => {
      await setup('OTRO_ROL');
      expect(component.menuItems().length).toBe(0);
    });

    it('no debe incluir rutas de admin ni store', async () => {
      await setup('CUSTOMER');
      const routes = component.menuItems().map((i) => i.route);
      expect(routes.some((r) => r.startsWith('/admin') || r.startsWith('/store'))).toBe(false);
    });
  });

  describe('logout()', () => {
    it('debe llamar a authService.logout()', async () => {
      await setup('ADMIN');
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });

    it('debe funcionar para cualquier rol', async () => {
      await setup('CUSTOMER');
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });
});
