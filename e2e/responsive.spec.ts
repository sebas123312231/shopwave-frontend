import { expect, test } from '@playwright/test';

test('login surface has no horizontal page overflow on the active viewport', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
});
