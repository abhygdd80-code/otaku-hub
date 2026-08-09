import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and displays the hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Anime Apparel/);
    // Hero heading is present and visible
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading.first()).toBeVisible();
  });

  test('shows the footer', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('has working navigation links', async ({ page }) => {
    await page.goto('/');
    // Collections nav link should be present
    const collectionsLink = page.getByRole('link', { name: /Collections/i });
    await expect(collectionsLink.first()).toBeVisible();
  });

  test('search button opens the search overlay', async ({ page }) => {
    await page.goto('/');
    const searchButton = page.getByRole('button', { name: /Search items/i });
    await searchButton.click();
    // Search dialog should appear
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  });

  test('cart button shows empty state and opens cart drawer', async ({
    page,
  }) => {
    await page.goto('/');
    const cartButton = page.getByRole('button', { name: /Shopping cart/i });
    await cartButton.click();
    const dialog = page.getByRole('dialog', { name: 'Shopping cart' });
    await expect(dialog).toBeVisible();
    // Empty cart heading
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });
});
