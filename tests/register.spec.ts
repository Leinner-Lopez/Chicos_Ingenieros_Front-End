import { test, expect, Page } from '@playwright/test';

const REGISTER_URL = 'http://localhost:8080/api/auth/register';
const TYPE_DELAY = 80;

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.locator('#register').click();
    await page.waitForURL('**/register');
    await page.waitForSelector('form.form__form');
  });

  test.describe('UI inicial', () => {
    test('debe mostrar el formulario de registro completo', async ({ page }) => {
      await expect(page.getByPlaceholder('Andres')).toBeVisible();
      await expect(page.getByPlaceholder('Torres')).toBeVisible();
      await expect(page.getByLabel('Número de Documento')).toBeVisible();
      await expect(page.getByPlaceholder('email@gmail.com')).toBeVisible();
      await expect(page.getByPlaceholder('0123456789')).toBeVisible();
      await expect(page.locator('#Contraseña')).toBeVisible();
      await expect(page.locator('#CContraseña')).toBeVisible();
    });

    test('el botón Registrarse debe estar deshabilitado con el formulario vacío', async ({
      page,
    }) => {
      await expect(page.getByRole('button', { name: 'Registrarse' })).toBeDisabled();
    });

    test('debe mostrar el enlace de login', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Inicia sesión' })).toBeVisible();
    });
  });

  test.describe('Validaciones', () => {
    test('debe mostrar error en Nombre cuando está vacío y tocado', async ({ page }) => {
      await page.getByPlaceholder('Andres').click();
      await page.getByPlaceholder('Torres').click();
      await expect(page.getByText('El campo es requerido').first()).toBeVisible();
    });

    test('debe mostrar error de email inválido', async ({ page }) => {
      await page
        .getByPlaceholder('email@gmail.com')
        .pressSequentially('noesunemail', { delay: TYPE_DELAY });
      await page.getByPlaceholder('0123456789').click();
      await expect(page.getByText('Correo electrónico inválido')).toBeVisible();
    });

    test('debe mostrar error cuando las contraseñas no coinciden', async ({ page }) => {
      await page.locator('#Contraseña').pressSequentially('password123', { delay: TYPE_DELAY });
      await page.locator('#CContraseña').pressSequentially('otracosa', { delay: TYPE_DELAY });
      await page.locator('#CContraseña').blur();
      await expect(page.getByText('Las contraseñas no coinciden.')).toBeVisible();
    });

    test('el botón se habilita solo cuando el formulario es válido', async ({ page }) => {
      await fillValidForm(page);
      await expect(page.getByRole('button', { name: 'Registrarse' })).toBeEnabled();
    });
  });

  test.describe('Flujo de registro', () => {
    test('registro exitoso muestra modal y redirige a /login', async ({ page }) => {
      await page.route(REGISTER_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Registro exitoso' }),
        }),
      );

      await fillValidForm(page);
      await page.getByRole('button', { name: 'Registrarse' }).click();

      await expect(page.getByText('Registro exitoso')).toBeVisible();
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('email o documento duplicado muestra modal de error', async ({ page }) => {
      await page.route(REGISTER_URL, (route) => route.fulfill({ status: 409, body: '' }));

      await fillValidForm(page);
      await page.getByRole('button', { name: 'Registrarse' }).click();

      await expect(page.getByText('Error de registro')).toBeVisible();
      await expect(
        page.getByText('El email o el número de documento ya estan registrados.'),
      ).toBeVisible();
    });
  });

  test.describe('Navegación', () => {
    test('el enlace Inicia sesión navega a /login', async ({ page }) => {
      await page.getByRole('link', { name: 'Inicia sesión' }).click();
      await expect(page).toHaveURL(/\/login/);
    });
  });
});

async function fillValidForm(page: Page) {
  await page.getByPlaceholder('Andres').pressSequentially('Juan', { delay: TYPE_DELAY });
  await page.getByPlaceholder('Torres').pressSequentially('Pérez', { delay: TYPE_DELAY });
  await page.getByLabel('Número de Documento').pressSequentially('12345678', { delay: TYPE_DELAY });
  await page
    .getByPlaceholder('email@gmail.com')
    .pressSequentially('juan@test.com', { delay: TYPE_DELAY });
  await page.getByPlaceholder('0123456789').pressSequentially('3001234567', { delay: TYPE_DELAY });
  await page.locator('#Contraseña').pressSequentially('password123', { delay: TYPE_DELAY });
  await page.locator('#CContraseña').pressSequentially('password123', { delay: TYPE_DELAY });
}
