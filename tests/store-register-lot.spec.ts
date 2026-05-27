import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:8080/api/auth/login';
const LOTS_URL = 'http://localhost:8080/api/lots';
const LOTS_COUNT_URL = 'http://localhost:8080/api/lots/count';
const PRODUCTS_URL = 'http://localhost:8080/api/products';
const DASHBOARD_URL = '**/api/dashboard/store/**';
const TYPE_DELAY = 80;

const STORE_TOKEN = buildFakeJwt({ sub: 'store@test.com', role: 'STORE' });

const mockProducts = [
  {
    productId: 1,
    name: 'Leche Entera',
    description: 'Leche de vaca entera pasteurizada',
    price: 2500,
    totalStock: 20,
    categoryName: 'Lácteos',
    imageUrl: '',
  },
  {
    productId: 2,
    name: 'Yogur Natural',
    description: 'Yogur sin sabor añadido',
    price: 3200,
    totalStock: 0,
    categoryName: 'Lácteos',
    imageUrl: '',
  },
];

const existingLots = [
  { lotId: 1, expirationDate: '2026-12-31', stockQuantity: 100, productName: 'Leche Entera' },
];

const newLot = {
  lotId: 2,
  expirationDate: '2027-06-30',
  stockQuantity: 50,
  productName: 'Yogur Natural',
};

test.describe('Almacén - Registro de lote', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login
    await page.route(LOGIN_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: STORE_TOKEN, userId: 3, userRole: 'STORE' }),
      }),
    );

    // Mock dashboard store para que /store/inicio cargue sin errores
    await page.route(DASHBOARD_URL, (route) => {
      const url = route.request().url();
      const body = url.includes('lots_expire') ? '[]' : '0';
      route.fulfill({ status: 200, contentType: 'application/json', body });
    });

    // Mock inicial de lotes
    await page.route(LOTS_URL, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(existingLots),
        });
      } else {
        route.continue();
      }
    });

    await page.route(LOTS_COUNT_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(existingLots.length),
      }),
    );

    // Mock productos — el modal de lotes llama getAllProducts() en su constructor
    await page.route(PRODUCTS_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      }),
    );

    // Ir a login y autenticarse como almacén
    await page.goto('/login');
    await page.waitForURL('**/login');
    await page.waitForSelector('form.login__form');

    await page.locator('#email').pressSequentially('store@test.com', { delay: TYPE_DELAY });
    await page.locator('#Contraseña').pressSequentially('store123', { delay: TYPE_DELAY });
    await page.getByRole('button', { name: 'Login' }).click();

    // Esperar a que redirija al dashboard de almacén
    await page.waitForURL('**/store/inicio');
    await page.waitForSelector('nav.navbar');
  });

  test('el almacén puede registrar un nuevo lote', async ({ page }) => {
    // ── Paso 1: Navegar a Lotes desde el sidebar ──
    await page.locator('nav a.item__link', { hasText: 'Lotes' }).click();
    await page.waitForURL('**/store/lotes');
    await page.waitForSelector('section.lots-view');

    // ── Paso 2: Preparar mocks para el registro ──
    await page.route(LOTS_URL, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(newLot),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([...existingLots, newLot]),
        });
      }
    });

    await page.route(LOTS_COUNT_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(2),
      }),
    );

    // ── Paso 3: Abrir el modal de registro ──
    await page.locator('.view-header button').click();
    await page.waitForSelector('.modal');
    await expect(page.getByText('Registrar Lote')).toBeVisible();

    // ── Paso 4: Llenar el formulario ──
    await page.locator('#productStock').fill('50');
    await page.locator('#status').selectOption('AVAILABLE');
    await page.locator('#expirationDate').fill('2027-06-30');
    await page.locator('#product').selectOption({ value: '2' });

    // ── Paso 5: Enviar el formulario ──
    await page.locator('button.submit__button').click();

    // ── Paso 6: Verificar éxito y actualización de la lista ──
    await expect(page.getByText('Lote Registrado')).toBeVisible();
    await expect(page.getByText('Yogur Natural')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('2 lotes registrados')).toBeVisible();
  });
});

function buildFakeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ ...payload, exp })}.fakesig`;
}
