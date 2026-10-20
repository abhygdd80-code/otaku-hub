import { test, expect } from '@playwright/test';

// Use a local catalog product handle (shadow-realm-hoodie, price: ₹89)
const PRODUCT_HANDLE = 'shadow-realm-hoodie';

test.describe('Cart drawer', () => {
  test('shows empty state initially', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Shopping cart/i }).click();
    const dialog = page.getByRole('dialog', { name: 'Shopping cart' });
    await expect(dialog).toBeVisible();
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });

  test('adding a product updates the drawer', async ({ page }) => {
    // Add to cart from PDP — the drawer auto-opens on add
    await page.goto(`/product/${PRODUCT_HANDLE}`);
    await page.getByRole('button', { name: /^Add .+ to cart$/ }).click();
    await expect(page.getByText('added to cart')).toBeVisible({
      timeout: 5000,
    });

    const dialog = page.getByRole('dialog', { name: 'Shopping cart' });
    await expect(dialog).toBeVisible();

    // Cart should no longer be empty
    await expect(page.getByText('Your cart is empty')).not.toBeVisible();
    // Subtotal should be visible
    await expect(page.getByText('Subtotal')).toBeVisible();
  });

  test('coupon code validation shows error for invalid code', async ({
    page,
  }) => {
    // Add item to cart first (auto-opens the drawer)
    await page.goto(`/product/${PRODUCT_HANDLE}`);
    await page.getByRole('button', { name: /^Add .+ to cart$/ }).click();
    await expect(page.getByText('added to cart')).toBeVisible({
      timeout: 5000,
    });

    // Drawer is already open
    await expect(
      page.getByRole('dialog', { name: 'Shopping cart' })
    ).toBeVisible();

    // Try invalid coupon
    const couponInput = page.getByLabel('Promo code');
    await couponInput.fill('INVALID');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText('not a valid coupon code')).toBeVisible();
  });

  test('valid coupon code applies discount', async ({ page }) => {
    // Add item to cart (auto-opens the drawer)
    await page.goto(`/product/${PRODUCT_HANDLE}`);
    await page.getByRole('button', { name: /^Add .+ to cart$/ }).click();
    await expect(page.getByText('added to cart')).toBeVisible({
      timeout: 5000,
    });

    // Drawer is already open
    await expect(
      page.getByRole('dialog', { name: 'Shopping cart' })
    ).toBeVisible();

    // Apply valid coupon
    const couponInput = page.getByLabel('Promo code');
    await couponInput.fill('SAVE10');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText('applied — enjoy')).toBeVisible();
    // Discount line should appear
    await expect(page.getByText('Discount (SAVE10)')).toBeVisible();
  });

  test('shipping progress bar is visible', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_HANDLE}`);
    await page.getByRole('button', { name: /^Add .+ to cart$/ }).click();
    await expect(page.getByText('added to cart')).toBeVisible({
      timeout: 5000,
    });
    // Drawer is already open
    await expect(
      page.getByRole('dialog', { name: 'Shopping cart' })
    ).toBeVisible();
    // Shipping progress bar should render - product price (₹89) is below threshold (₹1000)
    // In demo mode it shows "Demo preview: ₹911 from the free-shipping threshold"
    await expect(
      page.getByText(/from the free-shipping threshold/i)
    ).toBeVisible();
  });

  test('close button closes the drawer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Shopping cart/i }).click();
    await expect(
      page.getByRole('dialog', { name: 'Shopping cart' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Close cart' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Shopping cart' })
    ).not.toBeVisible();
  });
});
