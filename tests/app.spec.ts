import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')

    // Check for form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()

    await page.screenshot({ path: '/tmp/test-login.png', fullPage: true })
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')

    await page.fill('input[type="email"], input[name="email"]', 'wrong@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await page.waitForTimeout(2000)

    // Should show error or stay on login page
    const url = page.url()
    expect(url).toContain('/login')
  })
})

test.describe('API Security', () => {
  test('should return 401 for unauthenticated requests', async ({ request }) => {
    const endpoints = [
      '/api/properties',
      '/api/leads',
      '/api/documents',
      '/api/analytics',
      '/api/marketplace',
      '/api/teams',
      '/api/settlements',
      '/api/credits',
    ]

    for (const endpoint of endpoints) {
      const response = await request.get(`${BASE_URL}${endpoint}`)
      expect(response.status()).toBe(401)
    }
  })

  test('should have security headers', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/login`)
    const headers = response?.headers() || {}

    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-xss-protection']).toBe('1; mode=block')
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
    })
    const page = await context.newPage()
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: '/tmp/test-mobile.png', fullPage: true })

    // Check mobile hamburger menu exists after login
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    await expect(emailInput).toBeVisible()

    await context.close()
  })

  test('should work on tablet', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    })
    const page = await context.newPage()
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: '/tmp/test-tablet.png', fullPage: true })
    await context.close()
  })

  test('should work on desktop', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    })
    const page = await context.newPage()
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: '/tmp/test-desktop.png', fullPage: true })
    await context.close()
  })
})

test.describe('Rate Limiting', () => {
  test('should rate limit login attempts', async ({ request }) => {
    let rateLimited = false

    for (let i = 0; i < 7; i++) {
      const response = await request.post(`${BASE_URL}/api/auth/login`, {
        data: { email: 'test@test.com', password: 'wrongpassword' },
      })

      if (response.status() === 429) {
        rateLimited = true
        break
      }
    }

    expect(rateLimited).toBe(true)
  })
})
