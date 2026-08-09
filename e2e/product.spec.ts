import { test, expect } from '@playwright/test';

const TEST_PRODUCT = 'shadow-realm-hoodie';

test.describe('Product page', () => {
  test('loads and shows product details', async ({ page }) => {
    await page.goto(`/product/${TEST_PRODUCT}`);
    // Breadcrumb should show product name
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    // PDP add-to-cart button should be present. The `.+` distinguishes it
    // from the compact "Add to cart" buttons on recommended-product cards.
    const addBtn = page.getByRole('button', { name: /^Add .+ to cart$/ });
    await expect(addBtn).toBeVisible();
  });

  test('add to cart button triggers toast confirmation', async ({ page }) => {
    await page.goto(`/product/${TEST_PRODUCT}`);
    const addBtn = page.getByRole('button', { name: /^Add .+ to cart$/ });
    await addBtn.click();
    // Toast should confirm the item was added
    await expect(page.getByText('added to cart')).toBeVisible({
      timeout: 5000,
    });
  });

  test('breadcrumb links navigate correctly', async ({ page }) => {
    await page.goto(`/product/${TEST_PRODUCT}`);
    // Scope to the breadcrumb nav — "Home" also appears in the navbar
    const breadcrumb = page.getByLabel('Breadcrumb');
    const homeLink = breadcrumb.getByRole('link', { name: 'Home' });
    await expect(homeLink).toBeVisible();
    const shopLink = breadcrumb.getByRole('link', { name: 'Shop' });
    await expect(shopLink).toBeVisible();
    await shopLink.click();
    await expect(page).toHaveURL(/\/collections\/all/);
  });

  test('reviews section renders with stars', async ({ page }) => {
    await page.goto(`/product/${TEST_PRODUCT}`);
    // Reviews heading should be present (section with review stars)
    const reviewSection = page.locator('section, div').filter({
      hasText: /reviews/i,
    });
    await expect(reviewSection.first()).toBeVisible();
  });
});
