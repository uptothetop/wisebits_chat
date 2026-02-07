import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should register and login successfully', async ({ page }) => {
        const timestamp = Date.now();
        const username = `user_${timestamp}`;
        const email = `${username}@example.com`;
        const password = 'password123';

        // 1. Go to Register page
        await page.goto('/register');
        await expect(page).toHaveTitle(/Chat App/); // Assuming title or H1

        // 2. Fill Registration Form
        await page.fill('input#username', username);
        await page.fill('input#email', email);
        await page.fill('input#password', password);
        await page.click('button[type="submit"]');

        // 3. Expect redirection to Home
        // Wait for URL to be root
        await expect(page).toHaveURL('/');

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
        await expect(page).toHaveURL('/');
        await expect(page.locator('nav')).toContainText(username);
    });
});
