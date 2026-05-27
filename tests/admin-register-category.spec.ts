import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:8080/api/auth/login';
const CATEGORIES_URL = 'http://localhost:8080/api/categories';
const CATEGORIES_COUNT_URL = 'http://localhost:8080/api/categories/count';
const DASHBOARD_URL = '**/api/dashboard/admin/**';
const TYPE_DELAY = 80;

const ADMIN_TOKEN = buildFakeJwt({ sub: 'admin@test.com', role: 'ADMIN' });

const existingCategories = [
  { categoryId: 1, name: 'Lácteos', description: 'Productos lácteos y derivados' },
];

const newCategory = {
  categoryId: 2,
  name: 'Bebidas',
  description: 'Refrescos y jugos naturales',
};

test.describe('Admin - Registro de categoría', () => {
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

    // Mock inicial de categorías
    await page.route(CATEGORIES_URL, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(existingCategories),
        });
      } else {
        route.continue();
      }
    });

    await page.route(CATEGORIES_COUNT_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(existingCategories.length),
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

  test('el admin puede registrar una nueva categoría', async ({ page }) => {
    // ── Paso 1: Navegar a Categorías desde el sidebar ──
    await page.locator('nav a.item__link', { hasText: 'Categorías' }).click();
    await page.waitForURL('**/admin/categorias');
    await page.waitForSelector('section.categories-view');

    // ── Paso 2: Preparar mocks para el registro ──
    await page.route(CATEGORIES_URL, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(newCategory),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([...existingCategories, newCategory]),
        });
      }
    });

    await page.route(CATEGORIES_COUNT_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(2),
      }),
    );

    // ── Paso 3: Abrir el modal de registro ──
    await page.locator('.view-header button').click();
    await page.waitForSelector('.modal');
    await expect(page.getByText('Registrar Categoría')).toBeVisible();

    // ── Paso 4: Llenar el formulario ──
    await page.locator('#categoryName').pressSequentially('Bebidas');
    await page.locator('#categoryDescription').pressSequentially('Refrescos y jugos naturales');

    // ── Paso 5: Enviar el formulario ──
    await page.locator('button.submit__button').click();

    // ── Paso 6: Verificar éxito y actualización de la lista ──
    await expect(page.getByText('Categoría Registrada')).toBeVisible();
    await expect(page.getByText('Bebidas')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Refrescos y jugos naturales')).toBeVisible();
    await expect(page.getByText('2 categorías en catálogo')).toBeVisible();
  });
});

function buildFakeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ ...payload, exp })}.fakesig`;
}
