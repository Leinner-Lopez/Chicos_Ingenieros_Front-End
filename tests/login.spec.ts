import { test, expect } from '@playwright/test';

const AUTH_URL = 'http://localhost:8080/api/auth/login';
const TYPE_DELAY = 80;

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForURL('**/login');
    await page.waitForSelector('form.login__form');
  });

  test.describe('UI inicial', () => {
    test('debe mostrar el formulario de login', async ({ page }) => {
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#Contraseña')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });

    test('el botón Login debe estar deshabilitado con campos vacíos', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled();
    });

    test('debe mostrar el enlace de registro', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Regístrate' })).toBeVisible();
    });
  });

  test.describe('Validaciones', () => {
    test('debe mostrar error cuando el email tiene formato inválido', async ({ page }) => {
      await page.locator('#email').pressSequentially('noesun_email', { delay: TYPE_DELAY });
      await page.locator('#Contraseña').click();
      await expect(page.getByText('Debe contener un email valido')).toBeVisible();
    });

    test('debe mostrar error de campo requerido en password al salir del campo vacío', async ({ page }) => {
      await page.locator('#Contraseña').click();
      await page.locator('#email').click();
      await expect(page.getByText('El campo es requerido')).toBeVisible();
    });

    test('el botón Login debe habilitarse con credenciales válidas', async ({ page }) => {
      await page.locator('#email').pressSequentially('admin@test.com', { delay: TYPE_DELAY });
      await page.locator('#Contraseña').pressSequentially('password123', { delay: TYPE_DELAY });
      await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
    });
  });

  test.describe('Flujo de autenticación', () => {
    test('login exitoso como ADMIN redirige a /admin/inicio', async ({ page }) => {
      await page.route(AUTH_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: buildFakeJwt({ sub: 'admin@test.com', role: 'ADMIN' }),
            userId: 1,
            userRole: 'ADMIN',
          }),
        }),
      );

      await page.locator('#email').pressSequentially('admin@test.com', { delay: TYPE_DELAY });
      await page.locator('#Contraseña').pressSequentially('password123', { delay: TYPE_DELAY });
      await page.getByRole('button', { name: 'Login' }).click();

      await expect(page).toHaveURL(/\/admin\/inicio/);
    });

    test('login exitoso como CUSTOMER redirige a /customer/inicio', async ({ page }) => {
      await page.route(AUTH_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: buildFakeJwt({ sub: 'cliente@test.com', role: 'CUSTOMER' }),
            userId: 2,
            userRole: 'CUSTOMER',
          }),
        }),
      );

      await page.locator('#email').pressSequentially('cliente@test.com', { delay: TYPE_DELAY });
      await page.locator('#Contraseña').pressSequentially('password123', { delay: TYPE_DELAY });
      await page.getByRole('button', { name: 'Login' }).click();

      await expect(page).toHaveURL(/\/customer\/inicio/);
    });

    test('credenciales incorrectas muestran el modal de error', async ({ page }) => {
      await page.route(AUTH_URL, (route) =>
        route.fulfill({ status: 401, body: '' }),
      );

      await page.locator('#email').pressSequentially('admin@test.com', { delay: TYPE_DELAY });
      await page.locator('#Contraseña').pressSequentially('wrongpassword', { delay: TYPE_DELAY });
      await page.getByRole('button', { name: 'Login' }).click();

      await expect(page.getByText('Error de autenticación')).toBeVisible();
      await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible();
    });
  });

  test.describe('Navegación', () => {
    test('el enlace Regístrate navega a /register', async ({ page }) => {
      await page.getByRole('link', { name: 'Regístrate' }).click();
      await expect(page).toHaveURL(/\/register/);
    });
  });
});

function buildFakeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ ...payload, exp })}.fakesig`;
}
