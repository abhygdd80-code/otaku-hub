import { test, expect } from '@playwright/test';

test.describe('Site-wide smoke tests', () => {
  test('homepage returns 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('collections page returns 200', async ({ page }) => {
    const response = await page.goto('/collections');
    expect(response?.status()).toBe(200);
  });

  test('product page returns 200', async ({ page }) => {
    const response = await page.goto('/product/shadow-realm-hoodie');
    expect(response?.status()).toBe(200);
  });

  test('wishlist page returns 200', async ({ page }) => {
    const response = await page.goto('/wishlist');
    expect(response?.status()).toBe(200);
  });

  test('all products page returns 200', async ({ page }) => {
    const response = await page.goto('/collections/all');
    expect(response?.status()).toBe(200);
  });

  test('announcements bar is visible by default', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('region', { name: 'Announcements' })
    ).toBeVisible();
  });

  test('announcement dismiss button works', async ({ page }) => {
    await page.goto('/');
    const dismiss = page.getByRole('button', { name: /Dismiss announcement/i });
    await expect(dismiss).toBeVisible();
    await dismiss.click();
    await expect(
      page.getByRole('region', { name: 'Announcements' })
    ).not.toBeVisible();
  });

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Filter out expected errors (e.g. Next.js dev warnings)
    const critical = errors.filter(
      e => !e.includes('Download the React DevTools') && !e.includes('hydrat')
    );
    expect(critical).toHaveLength(0);
  });
});
