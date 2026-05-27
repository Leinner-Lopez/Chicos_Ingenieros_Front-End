import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:8080/api/auth/login';
const PRODUCTS_URL = 'http://localhost:8080/api/products';
const PRODUCTS_COUNT_URL = 'http://localhost:8080/api/products/count';
const CATEGORIES_URL = 'http://localhost:8080/api/categories';
const DASHBOARD_URL = '**/api/dashboard/admin/**';
const TYPE_DELAY = 80;

const ADMIN_TOKEN = buildFakeJwt({ sub: 'admin@test.com', role: 'ADMIN' });

const mockCategories = [{ categoryId: 1, name: 'Lácteos', description: 'Productos lácteos' }];

const existingProducts = [
  {
    productId: 1,
    name: 'Leche Entera',
    description: 'Leche de vaca entera pasteurizada',
    price: 2500,
    totalStock: 20,
    categoryName: 'Lácteos',
    imageUrl: '',
  },
];

const newProduct = {
  productId: 2,
  name: 'Yogur Natural',
  description: 'Yogur sin sabor añadido',
  price: 3200,
  totalStock: 0,
  categoryName: 'Lácteos',
  imageUrl: '',
};

test.describe('Admin - Registro de producto', () => {
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

    // Mock inicial de productos
    await page.route(PRODUCTS_URL, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(existingProducts),
        });
      } else {
        route.continue();
      }
    });

    await page.route(PRODUCTS_COUNT_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(existingProducts.length),
      }),
    );

    // Mock categorías — usado por el dropdown del modal al abrirse
    await page.route(CATEGORIES_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCategories),
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

  test('el admin puede registrar un nuevo producto', async ({ page }) => {
    // ── Paso 1: Navegar a Productos desde el sidebar ──
    await page.locator('nav a.item__link', { hasText: 'Productos' }).click();
    await page.waitForURL('**/admin/productos');
    await page.waitForSelector('section.products-view');

    // ── Paso 2: Preparar mocks para el registro ──
    await page.route(PRODUCTS_URL, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(newProduct),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([...existingProducts, newProduct]),
        });
      }
    });

    await page.route(PRODUCTS_COUNT_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(2),
      }),
    );

    // ── Paso 3: Abrir el modal de registro ──
    await page.locator('.view-header button').click();
    await page.waitForSelector('.modal');
    await expect(page.getByText('Registrar Producto')).toBeVisible();

    // ── Paso 4: Llenar el formulario ──
    await page.locator('#productName').pressSequentially('Yogur Natural', { delay: TYPE_DELAY });
    await page.locator('#productPrice').fill('3200');
    await page.locator('#productMinStock').fill('5');
    await page.locator('#productCategory').selectOption({ value: '1' });
    await page
      .locator('#productDescription')
      .pressSequentially('Yogur sin sabor añadido', { delay: TYPE_DELAY });

    // Adjuntar imagen ficticia para completar el FormData
    await page.locator('#productImage').setInputFiles({
      name: 'producto.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data'),
    });

    // ── Paso 5: Enviar el formulario ──
    await page.locator('button.submit__button').click();

    // ── Paso 6: Verificar éxito y actualización de la lista ──
    await expect(page.getByText('Producto Registrado')).toBeVisible();
    await expect(page.getByText('Yogur Natural')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('2 productos en catálogo')).toBeVisible();
  });
});

function buildFakeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ ...payload, exp })}.fakesig`;
}
