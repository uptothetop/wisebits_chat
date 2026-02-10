import { test, expect } from '@playwright/test';

test.describe('Authentication - Happy Path', () => {
    test('should register and login successfully', async ({ page }) => {
        const timestamp = Date.now();
        const username = `user_${timestamp}`;
        const email = `${username}@example.com`;
        const password = 'password123';

        // 1. Go to Register page
        await page.goto('/register');
        await expect(page).toHaveTitle(/Chat App/);

        // 2. Fill Registration Form
        await page.fill('input#username', username);
        await page.fill('input#email', email);
        await page.fill('input#password', password);
        await page.click('button[type="submit"]');

        // 3. Expect redirection to Home
        await page.waitForTimeout(500); // Wait for backend processing
        await expect(page).toHaveURL('/', { timeout: 10000 });

        // 4. Check for Welcome message
        await expect(page.locator('nav')).toContainText(username);
        await expect(page.locator('nav')).toContainText('Logout');

        // 5. Logout
        await page.click('button:has-text("Logout")');
        await expect(page).toHaveURL('/login');

        // 6. Login
        await page.fill('input#username', username);
        await page.fill('input#password', password);
        await page.click('button[type="submit"]');

        // 7. Check if logged in again
        await page.waitForTimeout(500); // Wait for backend processing
        await expect(page).toHaveURL('/', { timeout: 10000 });
        await expect(page.locator('nav')).toContainText(username);
    });
});

test.describe('Authentication - Unhappy Path', () => {
    test('should show error when registering with existing username', async ({ page }) => {
        const existingUsername = 'testuser';
        const existingEmail = 'test@example.com';
        const password = 'password123';

        // First, register a user if not exists (or assume one exists)
        await page.goto('/register');
        await page.fill('input#username', existingUsername);
        await page.fill('input#email', existingEmail);
        await page.fill('input#password', password);
        await page.click('button[type="submit"]');

        // Wait a bit for registration to complete
        await page.waitForTimeout(500);

        // Logout if redirected to home
        if (page.url().includes('localhost')) {
            await page.goto('/login');
            if (await page.locator('button:has-text("Logout")').isVisible()) {
                await page.click('button:has-text("Logout")');
            }
        }

        // Now try to register again with same username
        await page.goto('/register');
        await page.fill('input#username', existingUsername);
        await page.fill('input#email', 'different@example.com');
        await page.fill('input#password', password);
        await page.click('button[type="submit"]');

        // Should see error (backend might return generic error)
        const errorText = await page.locator('.error-alert, .error, [class*="error"]').textContent();
        expect(errorText).toBeTruthy(); // Just verify error is shown
    });

    test('should show error when logging in with incorrect password', async ({ page }) => {
        // Assume testuser exists from previous test
        await page.goto('/login');
        await page.fill('input#username', 'testuser');
        await page.fill('input#password', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Should see error (backend returns "Unauthorized")
        await expect(page.locator('.error-alert, .error, [class*="error"]')).toContainText(/Unauthorized|Invalid|incorrect|wrong/i);
    });
});
