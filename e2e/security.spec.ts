import { expect, test } from '@playwright/test';

const enabled = process.env.SHOPWAVE_E2E === '1';

test.describe('browser security boundaries', () => {
  test('does not expose a token to web storage after login', async ({ page }) => {
    test.skip(!enabled, 'Requires an isolated Spring/MySQL demo environment');
    const email = process.env.SHOPWAVE_E2E_USER_EMAIL;
    const password = process.env.SHOPWAVE_E2E_USER_PASSWORD;
    test.skip(!email || !password, 'Requires disposable e2e user credentials');

    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill(email!);
    await page.getByLabel('Contraseña').fill(password!);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect.poll(() => page.evaluate(() => Object.keys(localStorage).filter((key) => /token|jwt|auth/i.test(key)))).toEqual([]);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
