import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPass123';
const TEST_NAME = 'Test User';

test.describe('Profile Management', () => {
  test.describe.configure({ mode: 'serial' });

  let page: any;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should load login page', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('should register new user', async () => {
    // Click Sign Up tab
    await page.click('button:has-text("Sign Up")');
    await page.waitForTimeout(300);

    // Fill form
    await page.fill('input[name="name"]', TEST_NAME);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Either verification step or dashboard
    const isVerify = await page.locator('text=Verify your email').isVisible().catch(() => false);

    if (isVerify) {
      // Get dev code
      const devCode = await page.locator('span.font-mono').first().textContent();
      if (devCode) {
        // Enter code
        const inputs = page.locator('input[inputmode="numeric"]');
        for (let i = 0; i < devCode.length && i < 6; i++) {
          await inputs.nth(i).fill(devCode[i]);
        }
        await page.click('button:has-text("Verify")');
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should navigate to settings', async () => {
    await page.waitForLoadState('networkidle');

    // If still on login, try signing in
    if (page.url().includes('/login')) {
      const signInTab = page.locator('button:has-text("Sign In")');
      if (await signInTab.isVisible()) {
        await signInTab.click();
        await page.waitForTimeout(300);
      }
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }

    // Click Settings in sidebar
    await page.click('button:has-text("Settings")');
    await page.waitForTimeout(500);

    await expect(page.locator('text=Profile').first()).toBeVisible();
  });

  test('should have profile form fields', async () => {
    await expect(page.locator('#profile-name')).toBeVisible();
    await expect(page.locator('#profile-phone')).toBeVisible();
    await expect(page.locator('#profile-license')).toBeVisible();
    await expect(page.locator('#profile-email')).toBeVisible();
    await expect(page.locator('#profile-email')).toBeDisabled();
  });

  test('should update name with real-time save', async () => {
    await page.fill('#profile-name', '');
    await page.fill('#profile-name', 'Updated User Name');
    await page.waitForTimeout(1500);

    // Check for saved indicator
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 });
  });

  test('should update phone number', async () => {
    await page.fill('#profile-phone', '+1 555-987-6543');
    await page.waitForTimeout(1500);

    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 });
  });

  test('should show avatar upload option', async () => {
    await expect(page.locator('text=Upload').first()).toBeVisible();
  });

  test('should have security section', async () => {
    await expect(page.locator('text=Security').first()).toBeVisible();
    await expect(page.locator('button:has-text("Change")').last()).toBeVisible();
  });

  test('should open password change modal', async () => {
    // Find and click the Change button in security section
    const changeBtn = page.locator('button:has-text("Change")').last();
    await changeBtn.click();
    await page.waitForTimeout(500);

    await expect(page.locator('text=Change Password').first()).toBeVisible();
    await expect(page.locator('#current-password')).toBeVisible();
    await expect(page.locator('#new-password')).toBeVisible();
    await expect(page.locator('#confirm-password')).toBeVisible();
  });

  test('should validate password mismatch', async () => {
    await page.fill('#current-password', TEST_PASSWORD);
    await page.fill('#new-password', 'NewPass123');
    await page.fill('#confirm-password', 'DifferentPass');

    await page.click('button[type="submit"]:has-text("Change Password")');
    await page.waitForTimeout(500);

    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should close password modal', async () => {
    await page.click('button:has-text("Cancel")');
    await page.waitForTimeout(300);

    await expect(page.locator('text=Change Password').first()).not.toBeVisible();
  });

  test('should have plan section', async () => {
    await expect(page.locator('text=Current Plan').first()).toBeVisible();
    await expect(page.locator('text=Properties').first()).toBeVisible();
  });

  test('API should require authentication', async () => {
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/users/profile', {
        credentials: 'omit'
      });
      return res.status;
    });
    expect(response).toBe(401);
  });

  test('API should return profile when authenticated', async () => {
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/users/profile');
      return res.status;
    });
    expect(response).toBe(200);
  });

  test('should reject XSS payload in name', async () => {
    await page.fill('#profile-name', '<script>alert("xss")</script>');
    await page.waitForTimeout(1500);

    // Should show validation error
    const hasError = await page.locator('text=invalid characters').isVisible().catch(() => false);
    expect(hasError).toBe(true);
  });

  test('take final screenshot', async () => {
    await page.screenshot({ path: '/tmp/profile_test_final.png', fullPage: true });
  });
});
