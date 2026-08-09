import { test, expect } from '@playwright/test';

test.describe('Wishlist', () => {
  test.beforeEach(async ({ page }) => {
    // Clear wishlist from localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('otaku-wishlist');
    });
  });

  test('shows empty state when no items saved', async ({ page }) => {
    await page.goto('/wishlist');
    await expect(page.getByText('Your wishlist is empty')).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Continue Shopping/i })
    ).toBeVisible();
  });

  test('empty state CTA links to collections', async ({ page }) => {
    await page.goto('/wishlist');
    const cta = page.getByRole('link', { name: /Continue Shopping/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/collections/all');
  });

  test('wishlist nav icon links to /wishlist', async ({ page }) => {
    await page.goto('/');
    // Anchor of the nav-icon link (e.g. "Wishlist (empty)") — the nav's
    // "My Wishlist" text link must not be matched here.
    const wishlistLink = page.getByRole('link', { name: /^Wishlist/ });
    await expect(wishlistLink).toBeVisible();
    await wishlistLink.click();
    await expect(page).toHaveURL(/\/wishlist/);
  });

  test('sign-in link is visible in navbar', async ({ page }) => {
    await page.goto('/');
    const signIn = page.getByRole('link', { name: /Sign in/i });
    await expect(signIn).toBeVisible();
  });
});
