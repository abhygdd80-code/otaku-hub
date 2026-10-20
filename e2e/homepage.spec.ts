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

  test('keeps the mobile header usable at narrow widths', async ({ page }) => {
    for (const width of [310, 320, 360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');

      const menuButton = page.getByRole('button', {
        name: 'Open navigation menu',
      });

      await expect(
        page.getByRole('button', { name: /Search items/i })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Shopping cart/i })
      ).toBeVisible();
      await expect(menuButton).toBeVisible();

      const menuButtonBox = await menuButton.boundingBox();
      expect(menuButtonBox).not.toBeNull();
      expect(menuButtonBox!.x + menuButtonBox!.width).toBeLessThanOrEqual(
        width
      );

      await menuButton.focus();
      await page.keyboard.press('Enter');
      const menu = page.getByRole('dialog', { name: 'Navigation menu' });
      await expect(menu).toBeVisible();
      await expect(menu.getByRole('link', { name: 'Wishlist' })).toBeVisible();
      await expect(menu.getByRole('link', { name: 'Sign in' })).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(menu).not.toBeVisible();
      await expect(menuButton).toBeFocused();
    }
  });
});
