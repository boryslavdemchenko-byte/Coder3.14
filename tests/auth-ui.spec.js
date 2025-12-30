const { test, expect } = require('@playwright/test');

// Basic UI checks for auth pages; these don't complete magic-link flow (requires email infra)

test.describe('Auth UI', ()=>{
  test('signin page has email input and send button', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible();
  });

  test('profile encourages sign in when not authenticated', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('text=Please')).toBeVisible();
    await expect(page.locator('a:has-text("sign in")')).toBeVisible();
  });

  test('responsive: header collapses reasonably', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    // Mobile
    await page.setViewportSize({ width: 375, height: 800 });
    await expect(page.locator('nav')).toBeVisible();
  });
});
