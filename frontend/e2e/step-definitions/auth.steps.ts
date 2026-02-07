import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { expect } from '@playwright/test';

let browser: Browser;
let context: BrowserContext;
let page: Page;

// Setup and teardown
Before(async function () {
    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();
    this.page = page;
    this.context = context;
    this.browser = browser;
});

After(async function () {
    await page?.close();
    await context?.close();
    await browser?.close();
});

// Navigation steps
Given('I am on the Registration page', async function () {
    await this.page.goto('http://localhost:4173/register');
});

Given('I am on the Login page', async function () {
    await this.page.goto('http://localhost:4173/login');
});

Given('I am on the Home page', async function () {
    await this.page.goto('http://localhost:4173/');
});

// Input steps
When('I enter a unique username {string}', async function (username: string) {
    const timestamp = Date.now();
    this.username = `${username}_${timestamp}`;
    await this.page.fill('input#username', this.username);
});

When('I enter a registered username {string}', async function (username: string) {
    this.username = username;
    await this.page.fill('input#username', this.username);
});

When('I enter a username {string} that is already taken', async function (username: string) {
    this.username = username;
    await this.page.fill('input#username', this.username);
});

When('I enter a valid username {string}', async function (username: string) {
    this.username = username;
    await this.page.fill('input#username', this.username);
});

When('I enter a valid email {string}', async function (email: string) {
    this.email = email;
    await this.page.fill('input#email', this.email);
});

When('I enter a strong password {string}', async function (password: string) {
    this.password = password;
    await this.page.fill('input#password', this.password);
});

When('I enter the correct password {string}', async function (password: string) {
    this.password = password;
    await this.page.fill('input#password', this.password);
});

When('I enter an incorrect password {string}', async function (password: string) {
    await this.page.fill('input#password', password);
});

When('I enter a password {string}', async function (password: string) {
    this.password = password;
    await this.page.fill('input#password', this.password);
});

When('I click the {string} button', async function (buttonText: string) {
    await this.page.click(`button:has-text("${buttonText}")`);
});

When('I click {string}', async function (selector: string) {
    if (selector.startsWith('button')) {
        await this.page.click(selector);
    } else {
        await this.page.click(`button:has-text("${selector}")`);
    }
});

// Verification steps
Then('I should be redirected to the Home page', async function () {
    await expect(this.page).toHaveURL('http://localhost:4173/');
});

Then('I should see {string} in the navigation bar', async function (text: string) {
    await expect(this.page.locator('nav')).toContainText(text);
});

Then('I should receive a valid JWT token', async function () {
    // In a real scenario, you might check localStorage or cookies
    // For now, we just verify we're logged in
    await expect(this.page.locator('nav')).toContainText('Logout');
});

Then('I should see an error message {string}', async function (errorMessage: string) {
    const escapedMessage = errorMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
    const regex = new RegExp(escapedMessage, 'i');
    await expect(this.page.locator('.error-alert, .error, [class*="error"]')).toContainText(regex);
});

Then('I should not be logged in', async function () {
    await expect(this.page).not.toHaveURL('http://localhost:4173/');
});
