import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:8080/api/auth/login';
const USERS_URL = 'http://localhost:8080/api/users';
const USERS_COUNT_URL = 'http://localhost:8080/api/users/count';
const DASHBOARD_URL = '**/api/dashboard/admin/**';
const TYPE_DELAY = 80;

const ADMIN_TOKEN = buildFakeJwt({ sub: 'admin@test.com', role: 'ADMIN' });

const existingUsers = [
  { userId: 1, firstName: 'Admin', lastName: 'Principal', email: 'admin@test.com', role: 'ADMIN' },
];

const newCustomer = {
  userId: 2,
  firstName: 'María',
  lastName: 'García',
  email: 'maria@test.com',
  role: 'CUSTOMER',
};

test.describe('Admin - Registro de usuario cliente', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login
    await page.route(LOGIN_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: ADMIN_TOKEN, userId: 1, userRole: 'ADMIN' }),
      }),
    );

    // Mock dashboard admin para que /admin/inicio cargue sin errores
    await page.route(DASHBOARD_URL, (route) => {
      const url = route.request().url();
      const body = url.includes('lots_expire') ? '[]' : '0';
      route.fulfill({ status: 200, contentType: 'application/json', body });
    });

    // Mock inicial de usuarios
    await page.route(USERS_URL, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(existingUsers),
        });
      } else {
        route.continue();
      }
    });

    await page.route(USERS_COUNT_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(existingUsers.length),
      }),
    );

    // Ir a login y autenticarse como admin
    await page.goto('/login');
    await page.waitForURL('**/login');
    await page.waitForSelector('form.login__form');

    await page.locator('#email').pressSequentially('admin@test.com', { delay: TYPE_DELAY });
    await page.locator('#Contraseña').pressSequentially('admin123', { delay: TYPE_DELAY });
    await page.getByRole('button', { name: 'Login' }).click();

    // Esperar a que redirija al dashboard del admin
    await page.waitForURL('**/admin/inicio');
    await page.waitForSelector('nav.navbar');
  });

  test('el admin puede registrar un nuevo usuario como cliente', async ({ page }) => {
    // ── Paso 1: Navegar a Usuarios desde el sidebar ──
    await page.locator('nav a.item__link', { hasText: 'Usuarios' }).click();
    await page.waitForURL('**/admin/users');
    await page.waitForSelector('section.users-view');

    // ── Paso 2: Preparar mocks para el registro ──
    await page.route(USERS_URL, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(newCustomer),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([...existingUsers, newCustomer]),
        });
      }
    });

    await page.route(USERS_COUNT_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(2),
      }),
    );

    // ── Paso 3: Abrir el modal de registro ──
    await page.locator('.view-header button').click();
    await page.waitForSelector('.form');
    await expect(page.getByText('Formulario de Registro')).toBeVisible();

    // ── Paso 4: Llenar el formulario del modal ──
    await page.getByPlaceholder('Andres').pressSequentially('María', { delay: TYPE_DELAY });
    await page.getByPlaceholder('Torres').pressSequentially('García', { delay: TYPE_DELAY });
    await page
      .getByLabel('Número de Documento')
      .pressSequentially('12345678', { delay: TYPE_DELAY });
    await page.locator('#userRole').selectOption('CUSTOMER');
    await page
      .getByPlaceholder('email@gmail.com')
      .pressSequentially('juan@test.com', { delay: TYPE_DELAY });
    await page
      .getByPlaceholder('0123456789')
      .pressSequentially('3001234567', { delay: TYPE_DELAY });
    await page.locator('#Contraseña').pressSequentially('password123', { delay: TYPE_DELAY });
    await page.locator('#CContraseña').pressSequentially('password123', { delay: TYPE_DELAY });

    // ── Paso 5: Verificar que el botón está habilitado y enviar ──
    await expect(page.locator('input.form__button')).toBeEnabled();
    await page.locator('input.form__button').click();

    // ── Paso 6: Verificar éxito y actualización de la lista ──
    await expect(page.getByText('Usuario Registrado')).toBeVisible();
    await expect(page.getByText('María García')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('CUSTOMER')).toBeVisible();
    await expect(page.getByText('2 usuarios registrados')).toBeVisible();
  });
});

function buildFakeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ ...payload, exp })}.fakesig`;
}
