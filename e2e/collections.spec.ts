import { test, expect } from '@playwright/test';

test.describe('Collections', () => {
  test('shows all collection categories', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'COLLECTIONS'
    );
    // Collection cards should be visible
    const cards = page.locator('a[href^="/collections/"]');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('navigates to all products grid', async ({ page }) => {
    await page.goto('/collections/all');
    // Product cards should appear with prices
    const price = page.getByText(/\$\d+\.\d{2}/).first();
    await expect(price).toBeVisible();
    // Add-to-cart buttons exist on cards
    await expect(
      page.getByRole('button', { name: 'Add to cart' }).first()
    ).toBeVisible();
  });

  test('collection category link leads to filtered view', async ({ page }) => {
    await page.goto('/collections');
    // Category card + nav/footer links both point at /collections/hoodies
    const hoodieLink = page.getByRole('link', { name: /Hoodies/i }).first();
    await hoodieLink.click();
    await expect(page).toHaveURL(/\/collections\/hoodies/);
  });
});
