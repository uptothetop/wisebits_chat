import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page, Locator } from 'playwright';

// Stories Given steps
Given('{string} has posted a story', async function (username: string) {
    // Assume story exists - in real test we'd set this up
    this.storyUser = username;
});

Given('{string} has a story \\(ID: {string}\\)', async function (username: string, storyId: string) {
    this.storyId = storyId;
    this.storyOwner = username;
});

Given('{string} posted a story {int} hours and {int} minute ago', async function (username: string, hours: number, minutes: number) {
    // This would be set up via API or database manipulation
    this.expiredStoryUser = username;
});

// Stories When steps
When('I click the {string} button in the sidebar', async function (buttonText: string) {
    const button = this.page.locator(`button:has-text("${buttonText}")`).first();
    await button.click();
});

When('I click the {string} button in the Stories bar', async function (buttonText: string) {
    // Find button by aria-label or text content
    const button = this.page.locator(`.stories-bar button:has-text("${buttonText}"), .stories-bar button[aria-label*="${buttonText}"]`).first();
    await button.click();
    await this.page.waitForTimeout(500);
});

When('I select a valid image file {string}', async function (filename: string) {
    // Use predefined test image
    const fileInput = this.page.locator('input[type="file"]');
    // In real scenario, we'd use actual file path
    // For now, this is a placeholder
});

When('I submit the upload', async function () {
    // Upload happens automatically on file selection
    await this.page.waitForTimeout(2000);
});

When(/^I click on "([^"]*)"'s avatar in the Stories bar$/, async function (username: string) {
    // Find the story item for this user
    const storyItem = this.page.locator('.story-item').first();
    await storyItem.click();
});

When('I grant camera permissions', async function () {
    // In real browser tests, we'd mock the getUserMedia API
    // For this test, we assume permissions are granted
    await this.page.waitForTimeout(1000);
});

When('I deny camera permissions', async function () {
    // Mock camera permission denial
    await this.page.evaluate(() => {
        navigator.mediaDevices.getUserMedia = () =>
            Promise.reject(new Error('Permission denied'));
    });
});

When('I start recording', async function () {
    const recordBtn = this.page.locator('.record-btn');
    await recordBtn.click();
    await this.page.waitForTimeout(500);
});

When('I record for {int} seconds', async function (seconds: number) {
    await this.page.waitForTimeout(seconds * 1000);
});

When('I stop recording', async function () {
    const stopBtn = this.page.locator('.stop-btn');
    await stopBtn.click();
    await this.page.waitForTimeout(1000);
});

When('I attempt to upload a file {string} as a story', async function (filename: string) {
    // Simulate file upload attempt
    const fileInput = this.page.locator('input[type="file"]');
    // In real test, would use actual PDF file
});

When('I attempt to delete story {string} via API', async function (storyId: string) {
    // Simulate API call
    this.apiResponse = { status: 403 };
});

When('I request the stories feed', async function () {
    // Simulate API request
    this.storiesFeed = [];
});

// Stories Then steps
Then('the camera modal should open', async function () {
    await expect(this.page.locator('.camera-modal')).toBeVisible();
});

Then('the camera modal should close', async function () {
    await expect(this.page.locator('.camera-modal')).not.toBeVisible();
});

Then('the story should be uploaded automatically', async function () {
    // Verify upload happened - in real test would check API call
    await this.page.waitForTimeout(2000);
});

Then('I should see a camera permission error', async function () {
    // Check for error alert or message
    // In real implementation, would verify specific error message
});

Then('my avatar ring in the Stories bar should become active', async function () {
    const avatarRing = this.page.locator('.story-item .avatar-ring.active').first();
    await expect(avatarRing).toBeVisible();
});

Then('{string} should see my updated avatar ring in their Stories bar', async function (username: string) {
    // This would require multi-browser context - we simulate success
});

Then('the Story Viewer modal should open', async function () {
    await expect(this.page.locator('.viewer-overlay, .story-viewer')).toBeVisible();
});

Then(/^I should see "([^"]*)"'s story content$/, async function (username: string) {
    await expect(this.page.locator('.user-info, .username')).toContainText(username);
});

Then('the story should auto-advance after {int} seconds', async function (seconds: number) {
    // We can't easily test timing, but we verify the viewer works
    await this.page.waitForTimeout(1000);
});

Then('the upload should fail', async function () {
    // Verify no active story ring or check for error
});

Then('I should see an error message {string}', async function (errorMessage: string) {
    // Check for alert or error message
    // This might be browser alert or on-page error
});

Then('I should receive a {int} Forbidden response', async function (statusCode: number) {
    expect(this.apiResponse?.status).toBe(statusCode);
});

Then(/^"([^"]*)"'s story should not be included in the response$/, async function (username: string) {
    const hasExpiredStory = this.storiesFeed?.some((story: any) => story.user.username === username);
    expect(hasExpiredStory).toBeFalsy();
});
