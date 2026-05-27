import { test, expect } from '@playwright/test';

const LOGIN_URL      = 'http://localhost:8080/api/auth/login';
const PRODUCTS_URL   = 'http://localhost:8080/api/products';
const CATEGORIES_URL = 'http://localhost:8080/api/categories';
const SALES_URL      = 'http://localhost:8080/api/sales';
const DASHBOARD_URL  = '**/api/dashboard/customer/**';
const TYPE_DELAY     = 80;

const CUSTOMER_TOKEN = buildFakeJwt({ sub: 'customer@test.com', role: 'CUSTOMER' });

const mockCategories = [
  { categoryId: 1, name: 'Lácteos', description: 'Productos lácteos' },
];

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
];

test.describe('Cliente - Compra de producto', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login
    await page.route(LOGIN_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: CUSTOMER_TOKEN, userId: 2, userRole: 'CUSTOMER' }),
      }),
    );

    // Mock dashboard customer para que /customer/inicio cargue sin errores
    await page.route(DASHBOARD_URL, (route) => {
      const url = route.request().url();
      const body = url.includes('recent_purchases') ? '[]' : '0';
      route.fulfill({ status: 200, contentType: 'application/json', body });
    });

    // Mock productos
    await page.route(PRODUCTS_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      }),
    );

    // Mock categorías — usadas para los chips de filtro
    await page.route(CATEGORIES_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCategories),
      }),
    );

    // Ir a login y autenticarse como cliente
    await page.goto('/login');
    await page.waitForURL('**/login');
    await page.waitForSelector('form.login__form');

    await page.locator('#email').pressSequentially('customer@test.com', { delay: TYPE_DELAY });
    await page.locator('#Contraseña').pressSequentially('customer123', { delay: TYPE_DELAY });
    await page.getByRole('button', { name: 'Login' }).click();

    // Esperar a que redirija al dashboard del cliente
    await page.waitForURL('**/customer/inicio');
    await page.waitForSelector('nav.navbar');
  });

  test('el cliente puede comprar un producto', async ({ page }) => {
    // ── Paso 1: Navegar a Productos desde el sidebar ──
    await page.locator('nav a.item__link', { hasText: 'Productos' }).click();
    await page.waitForURL('**/customer/productos');
    await page.waitForSelector('.shop-container');

    await expect(page.getByText('Descubre Productos Frescos')).toBeVisible();
    await expect(page.getByText('Leche Entera')).toBeVisible();
    await expect(page.locator('.btn-add-cart')).toBeVisible();

    // ── Paso 2: Preparar mock para la venta ──
    await page.route(SALES_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ saleId: 1, productId: 1, quantity: 3, userId: 2 }),
      }),
    );

    // ── Paso 3: Abrir el modal de compra ──
    await page.locator('.btn-add-cart').first().click();
    await page.waitForSelector('.modal');
    await expect(page.getByText('Registrar Compra')).toBeVisible();

    // ── Paso 4: Ingresar la cantidad ──
    await page.locator('#quantity').pressSequentially('3', { delay: TYPE_DELAY });

    // ── Paso 5: Confirmar la compra ──
    await page.locator('button.submit__button').click();

    // ── Paso 6: Verificar éxito ──
    await expect(page.getByText('Compra Registrada')).toBeVisible();
    await expect(page.getByText('La compra ha sido registrada exitosamente.')).toBeVisible();
  });
});

function buildFakeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ ...payload, exp })}.fakesig`;
}
