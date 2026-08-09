import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test('search button opens overlay', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Search items/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('search input is focused when overlay opens', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Search items/i }).click();
    const searchInput = page.getByPlaceholder(/search anime/i);
    await expect(searchInput).toBeFocused();
  });

  test('typing a query shows results', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Search items/i }).click();
    const searchInput = page.getByPlaceholder(/search anime/i);
    await searchInput.fill('hoodie');
    // Wait for debounce + results — a matching product link appears
    await expect(page.locator('a[href^="/product/"]').first()).toBeVisible({
      timeout: 3000,
    });
  });

  test('searching for nonsense shows empty state', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Search items/i }).click();
    const searchInput = page.getByPlaceholder(/search anime/i);
    await searchInput.fill('xyzzy123nonexistent');
    await expect(page.getByText(/No results for/i)).toBeVisible({
      timeout: 3000,
    });
  });

  test('Escape key closes search overlay', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Search items/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('trending searches are shown when idle', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Search items/i }).click();
    await expect(
      page.getByRole('heading', { name: /Trending/i })
    ).toBeVisible();
  });
});
