import { test, expect } from '@playwright/test';

test.describe('Chat - Happy Path', () => {
    test('should start a new conversation and send messages', async ({ page }) => {
        const timestamp = Date.now();
        const userA = `userA_${timestamp}`;
        const userB = `userB_${timestamp}`;
        const password = 'password123';

        // Register UserB first
        await page.goto('/register');
        await page.fill('input#username', userB);
        await page.fill('input#email', `${userB}@example.com`);
        await page.fill('input#password', password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');

        // Logout UserB
        await page.click('button:has-text("Logout")');
        await expect(page).toHaveURL('/login');

        // Register and login as UserA
        await page.goto('/register');
        await page.fill('input#username', userA);
        await page.fill('input#email', `${userA}@example.com`);
        await page.fill('input#password', password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');

        // Start new conversation with UserB
        await page.click('button:has-text("New Chat")');
        await page.fill('input[placeholder*="Search"]', userB);
        await page.waitForTimeout(500); // Wait for search results

        // Click on UserB in search results
        await page.click(`button:has-text("${userB}")`);

        // Wait for conversation to be active
        await expect(page.locator('.chat-header')).toContainText(userB);

        // Send a message
        const message = 'Hello UserB!';
        await page.fill('input[placeholder*="Type a message"]', message);
        await page.click('button:has-text("Send")');

        // Verify message appears
        await expect(page.locator('.message.own .bubble')).toContainText(message);
    });

    test('should receive messages in real-time', async ({ browser }) => {
        const timestamp = Date.now();
        const userA = `userA_rt_${timestamp}`;
        const userB = `userB_rt_${timestamp}`;
        const password = 'password123';

        // Create two browser contexts
        const contextA = await browser.newContext();
        const contextB = await browser.newContext();
        const pageA = await contextA.newPage();
        const pageB = await contextB.newPage();

        // Register UserA
        await pageA.goto('http://localhost:5173/register');
        await pageA.fill('input#username', userA);
        await pageA.fill('input#email', `${userA}@example.com`);
        await pageA.fill('input#password', password);
        await pageA.click('button[type="submit"]');
        await expect(pageA).toHaveURL('http://localhost:5173/');

        // Register UserB
        await pageB.goto('http://localhost:5173/register');
        await pageB.fill('input#username', userB);
        await pageB.fill('input#email', `${userB}@example.com`);
        await pageB.fill('input#password', password);
        await pageB.click('button[type="submit"]');
        await expect(pageB).toHaveURL('http://localhost:5173/');

        // UserA starts conversation with UserB
        await pageA.click('button:has-text("New Chat")');
        await pageA.fill('input[placeholder*="Search"]', userB);
        await pageA.waitForTimeout(500);
        await pageA.click(`button:has-text("${userB}")`);
        await expect(pageA.locator('.chat-header')).toContainText(userB);

        // UserA sends a message
        const message = 'Hello from UserA in real-time!';
        await pageA.fill('input[placeholder*="Type a message"]', message);
        await pageA.click('button:has-text("Send")');

        // Wait for UserB to receive the message
        await pageB.waitForTimeout(1000); // Give time for WebSocket

        // UserB should see conversation appear
        await expect(pageB.locator('.conversation-list')).toContainText(userA);

        // Click on UserA's conversation
        await pageB.click(`button.conversation-item:has-text("${userA}")`);

        // Verify message appears in UserB's chat
        await expect(pageB.locator('.message .bubble')).toContainText(message);

        // Cleanup
        await contextA.close();
        await contextB.close();
    });
});

test.describe('Chat - Unhappy Path', () => {
    test('should not send empty messages', async ({ page }) => {
        const timestamp = Date.now();
        const userA = `userA_empty_${timestamp}`;
        const userB = `userB_empty_${timestamp}`;
        const password = 'password123';

        // Register UserB
        await page.goto('/register');
        await page.fill('input#username', userB);
        await page.fill('input#email', `${userB}@example.com`);
        await page.fill('input#password', password);
        await page.click('button[type="submit"]');
        await page.click('button:has-text("Logout")');

        // Register UserA
        await page.goto('/register');
        await page.fill('input#username', userA);
        await page.fill('input#email', `${userA}@example.com`);
        await page.fill('input#password', password);
        await page.click('button[type="submit"]');

        // Start conversation
        await page.click('button:has-text("New Chat")');
        await page.fill('input[placeholder*="Search"]', userB);
        await page.waitForTimeout(500);
        await page.click(`button:has-text("${userB}")`);

        // Count initial messages (should be 0)
        const initialCount = await page.locator('.message').count();

        // Try to send empty message
        await page.click('button:has-text("Send")');
        await page.waitForTimeout(500);

        // Count should still be the same
        const finalCount = await page.locator('.message').count();
        expect(finalCount).toBe(initialCount);
    });
});
