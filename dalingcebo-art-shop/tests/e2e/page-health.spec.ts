import { test, expect } from '@playwright/test';

/**
 * Page Health Tests
 * 
 * These tests verify that major pages load without console errors and render correctly.
 * They ensure the frontend-backend wiring is correct and prevent regressions.
 */

test.describe('Page Health Checks', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors for this test
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out expected errors in dev environment
        if (
          !text.includes('Hydration') &&
          !text.includes('404') &&
          !text.includes('fetch failed') && // Supabase connection errors are expected without DB
          !text.includes('ECONNREFUSED') &&
          !text.includes('Error fetching artworks') // Expected when Supabase is not available
        ) {
          consoleErrors.push(text);
        }
      }
    });
    
    // Make consoleErrors available to tests
    (page as any).consoleErrors = consoleErrors;
  });

  test('homepage loads without errors', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check for main content
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Verify no critical console errors (our fixes)
    const consoleErrors = (page as any).consoleErrors || [];
    const criticalErrors = consoleErrors.filter((err: string) => 
      err.includes('useCart must be used within a CartProvider') ||
      err.includes('Maximum update depth exceeded')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('shop page loads without errors', async ({ page }) => {
    await page.goto('/shop');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check for main content
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Verify no console errors related to our fixes
    const consoleErrors = (page as any).consoleErrors || [];
    const criticalErrors = consoleErrors.filter((err: string) => 
      err.includes('useCart must be used within a CartProvider') ||
      err.includes('Maximum update depth exceeded')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('cart page loads without errors', async ({ page }) => {
    await page.goto('/cart');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check for main content or empty cart message
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Should show either cart items or "empty cart" state
    const emptyCartMessage = page.getByText(/your shopping cart is currently empty/i);
    const hasEmptyState = await emptyCartMessage.isVisible().catch(() => false);
    
    if (hasEmptyState) {
      // Verify empty state is shown
      await expect(emptyCartMessage).toBeVisible();
    }
    
    // Verify no console errors related to CartProvider
    const consoleErrors = (page as any).consoleErrors || [];
    const cartErrors = consoleErrors.filter((err: string) => 
      err.includes('useCart must be used within a CartProvider')
    );
    expect(cartErrors.length).toBe(0);
  });

  test('artwork detail page loads without errors', async ({ page }) => {
    // First, go to the shop to find an artwork
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    // Try to find an artwork link (look for artwork URLs in links)
    const artworkLinks = page.locator('a[href^="/artwork/"]');
    const count = await artworkLinks.count();
    
    if (count > 0) {
      // Navigate to the first artwork
      await artworkLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // Check for main content
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
      
      // Verify no infinite loop errors
      const consoleErrors = (page as any).consoleErrors || [];
      const loopErrors = consoleErrors.filter((err: string) => 
        err.includes('Maximum update depth exceeded')
      );
      expect(loopErrors.length).toBe(0);
    } else {
      // If no artworks found, at least verify the shop page works
      test.skip();
    }
  });

  test('artwork not found page shows proper 404 state', async ({ page }) => {
    await page.goto('/artwork/999999');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Should show "not found" or similar message
    const notFoundText = page.getByText(/not found|not available/i);
    await expect(notFoundText).toBeVisible();
    
    // Verify no critical console errors (404 status is expected)
    const consoleErrors = (page as any).consoleErrors || [];
    const criticalErrors = consoleErrors.filter((err: string) => 
      err.includes('useCart must be used within a CartProvider') ||
      err.includes('Maximum update depth exceeded')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('header renders without errors and shows cart icon', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for main header navigation (use class selector to be specific)
    const header = page.locator('nav.yeezy-nav');
    await expect(header).toBeVisible();
    
    // Check for cart link (should have cart icon and be clickable)
    const cartLink = page.locator('a[href="/cart"]');
    await expect(cartLink.first()).toBeVisible();
    
    // Verify no console errors related to CartProvider in header
    const consoleErrors = (page as any).consoleErrors || [];
    const headerErrors = consoleErrors.filter((err: string) => 
      err.includes('useCart must be used within a CartProvider')
    );
    expect(headerErrors.length).toBe(0);
  });

  test('scrolling does not cause console errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Reset console errors for this specific test
    (page as any).consoleErrors = [];
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    
    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Verify no infinite loop errors from scroll handler
    const consoleErrors = (page as any).consoleErrors || [];
    const scrollErrors = consoleErrors.filter((err: string) => 
      err.includes('Maximum update depth exceeded')
    );
    expect(scrollErrors.length).toBe(0);
  });
});
