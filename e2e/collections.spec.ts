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
    // Product cards should appear with prices (INR format: ₹1,234)
    const price = page.getByText(/₹\d{1,3}(,\d{3})*/).first();
    await expect(price).toBeVisible();
    // Add-to-cart buttons exist on cards
    await expect(
      page.getByRole('button', { name: 'Add to cart' }).first()
    ).toBeVisible();
  });

  test('product card detail link navigates without hijacking card actions', async ({
    page,
  }) => {
    await page.goto('/collections/all');

    const card = page.getByRole('listitem').first();
    const detailLink = card.getByRole('link', { name: /product details/i });
    await expect(detailLink).toHaveAttribute('href', /\/product\/.+/);

    await card.getByRole('button', { name: 'Add to cart' }).first().click();
    await expect(page.getByText('added to cart')).toBeVisible({
      timeout: 5000,
    });
    await expect(page).toHaveURL(/\/collections\/all/);
  });

  test('product detail link is keyboard reachable', async ({ page }) => {
    await page.goto('/collections/all');

    const card = page.getByRole('listitem').first();
    const detailLink = card.getByRole('link', { name: /product details/i });
    await detailLink.focus();
    await expect(detailLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/product\/.+/);
  });

  test('card quick actions remain independently interactive', async ({
    page,
  }) => {
    await page.goto('/collections/all');

    const card = page.getByRole('listitem').first();
    await card.getByRole('button', { name: 'Quick view product' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close dialog' }).click();

    const wishlist = card.getByRole('button', {
      name: /Add .+ to wishlist/,
    });
    await wishlist.click();
    await expect(wishlist).toHaveAttribute('aria-pressed', 'true');

    const compare = card.getByRole('button', { name: /Add .+ to compare/ });
    await compare.click();
    await expect(compare).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/\/collections\/all/);
  });

  test('collection category link leads to filtered view', async ({ page }) => {
    await page.goto('/collections');
    // Category card + nav/footer links both point at /collections/hoodies
    const hoodieLink = page.getByRole('link', { name: /Hoodies/i }).first();
    await hoodieLink.click();
    await expect(page).toHaveURL(/\/collections\/hoodies/);
  });
});
