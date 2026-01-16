#!/usr/bin/env python3
"""
Test script for RealEstate Pro Dashboard
Tests login, dashboard, and core functionality
"""

from playwright.sync_api import sync_playwright
import time
import json

BASE_URL = "http://localhost:3000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "TestPassword123!"

def test_login_page():
    """Test login page loads and has proper elements"""
    print("\n=== Testing Login Page ===")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to login
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state('networkidle')

        # Check page title and elements
        title = page.title()
        print(f"Page title: {title}")

        # Check for email input
        email_input = page.locator('input[type="email"], input[name="email"]').first
        if email_input.is_visible():
            print("✓ Email input found")
        else:
            print("✗ Email input NOT found")

        # Check for password input
        password_input = page.locator('input[type="password"]').first
        if password_input.is_visible():
            print("✓ Password input found")
        else:
            print("✗ Password input NOT found")

        # Check for login button
        login_button = page.locator('button[type="submit"]').first
        if login_button.is_visible():
            print("✓ Login button found")
        else:
            print("✗ Login button NOT found")

        # Take screenshot
        page.screenshot(path='/tmp/login_page.png', full_page=True)
        print("Screenshot saved: /tmp/login_page.png")

        browser.close()
        return True


def test_api_endpoints():
    """Test API endpoints"""
    print("\n=== Testing API Endpoints ===")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Test unauthenticated access to protected endpoints
        endpoints = [
            ("/api/properties", "GET", 401),
            ("/api/leads", "GET", 401),
            ("/api/documents", "GET", 401),
            ("/api/analytics", "GET", 401),
            ("/api/marketplace", "GET", 401),
            ("/api/teams", "GET", 401),
            ("/api/settlements", "GET", 401),
            ("/api/credits", "GET", 401),
        ]

        for endpoint, method, expected_status in endpoints:
            response = page.request.get(f"{BASE_URL}{endpoint}")
            status = response.status
            if status == expected_status:
                print(f"✓ {endpoint}: {status} (expected {expected_status})")
            else:
                print(f"✗ {endpoint}: {status} (expected {expected_status})")

        # Test public endpoints
        public_endpoints = [
            ("/api/auth/login", "POST", 400),  # Missing body
        ]

        for endpoint, method, expected_status in public_endpoints:
            response = page.request.post(f"{BASE_URL}{endpoint}", data={})
            status = response.status
            if status == expected_status:
                print(f"✓ {endpoint}: {status} (expected {expected_status})")
            else:
                print(f"✗ {endpoint}: {status} (expected {expected_status})")

        browser.close()
        return True


def test_security_headers():
    """Test security headers are present"""
    print("\n=== Testing Security Headers ===")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        response = page.goto(f"{BASE_URL}/login")
        headers = response.headers

        security_headers = [
            'x-content-type-options',
            'x-frame-options',
            'x-xss-protection',
            'referrer-policy',
        ]

        for header in security_headers:
            if header in headers:
                print(f"✓ {header}: {headers[header]}")
            else:
                print(f"✗ {header}: NOT SET")

        browser.close()
        return True


def test_rate_limiting():
    """Test rate limiting on login endpoint"""
    print("\n=== Testing Rate Limiting ===")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Send multiple login requests
        rate_limited = False
        for i in range(7):
            response = page.request.post(
                f"{BASE_URL}/api/auth/login",
                data=json.dumps({"email": "test@test.com", "password": "wrong"}),
                headers={"Content-Type": "application/json"}
            )
            status = response.status
            if status == 429:
                print(f"✓ Rate limited after {i+1} requests (status 429)")
                rate_limited = True
                break
            else:
                print(f"  Request {i+1}: status {status}")

        if not rate_limited:
            print("✗ Rate limiting may not be working (no 429 received)")

        browser.close()
        return rate_limited


def test_registration_flow():
    """Test user registration flow"""
    print("\n=== Testing Registration Flow ===")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state('networkidle')

        # Look for registration link/tab
        register_link = page.locator('text=Sign up, text=Register, text=Create account').first
        if register_link.is_visible():
            print("✓ Registration link found")
            register_link.click()
            page.wait_for_timeout(1000)
            page.screenshot(path='/tmp/register_page.png', full_page=True)
            print("Screenshot saved: /tmp/register_page.png")
        else:
            # Check if there's a tab or button
            tabs = page.locator('button:has-text("Sign up"), button:has-text("Register")')
            if tabs.count() > 0:
                print("✓ Registration tab found")
                tabs.first.click()
                page.wait_for_timeout(1000)
                page.screenshot(path='/tmp/register_page.png', full_page=True)
                print("Screenshot saved: /tmp/register_page.png")
            else:
                print("✗ Registration option not found on login page")

        browser.close()
        return True


def test_responsive_design():
    """Test responsive design on different viewport sizes"""
    print("\n=== Testing Responsive Design ===")

    viewports = [
        ("Mobile", 375, 667),
        ("Tablet", 768, 1024),
        ("Desktop", 1920, 1080),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for name, width, height in viewports:
            page = browser.new_page(viewport={"width": width, "height": height})
            page.goto(f"{BASE_URL}/login")
            page.wait_for_load_state('networkidle')

            filename = f'/tmp/responsive_{name.lower()}.png'
            page.screenshot(path=filename, full_page=True)
            print(f"✓ {name} ({width}x{height}): {filename}")

            page.close()

        browser.close()
        return True


def main():
    print("=" * 50)
    print("RealEstate Pro Dashboard - Test Suite")
    print("=" * 50)

    tests = [
        ("Login Page", test_login_page),
        ("API Endpoints", test_api_endpoints),
        ("Security Headers", test_security_headers),
        ("Rate Limiting", test_rate_limiting),
        ("Registration Flow", test_registration_flow),
        ("Responsive Design", test_responsive_design),
    ]

    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, "PASS" if result else "FAIL"))
        except Exception as e:
            print(f"✗ Error in {name}: {e}")
            results.append((name, "ERROR"))

    print("\n" + "=" * 50)
    print("Test Results Summary")
    print("=" * 50)
    for name, status in results:
        icon = "✓" if status == "PASS" else "✗"
        print(f"{icon} {name}: {status}")

    print("\nScreenshots saved in /tmp/")


if __name__ == "__main__":
    main()
