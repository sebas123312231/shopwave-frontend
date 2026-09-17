import { expect, test } from '@playwright/test';

const enabled = process.env.SHOPWAVE_E2E === '1';

test.describe('critical commerce flow', () => {
  test('user can reach a mock checkout from a real catalog', async ({ page }) => {
    test.skip(!enabled, 'Requires an isolated Spring/MySQL demo environment');
    const email = process.env.SHOPWAVE_E2E_USER_EMAIL;
    const password = process.env.SHOPWAVE_E2E_USER_PASSWORD;
    test.skip(!email || !password, 'Requires disposable e2e user credentials');

    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill(email!);
    await page.getByLabel('Contraseña').fill(password!);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: /Encuentra algo/i })).toBeVisible();
    const firstCard = page.locator('article').first();
    await expect(firstCard).toBeVisible();
    await firstCard.getByRole('link').click();
    await page.getByRole('button', { name: /Agregar al carrito/i }).click();
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'Carrito' })).toBeVisible();
    await page.getByRole('link', { name: /Continuar al checkout/i }).click();
    await expect(page.getByRole('heading', { name: /A dónde enviamos/i })).toBeVisible();
    await expect(page.getByText(/Pago simulado/i)).toBeVisible();
  });
});
