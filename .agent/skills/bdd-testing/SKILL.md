---
name: BDD Testing with Cucumber
description: Patterns for writing and running BDD tests using Cucumber and Playwright in Wisebits Chat
---

# BDD Testing with Cucumber Skill

## Overview

This skill covers writing behavior-driven development (BDD) tests using Gherkin syntax (Cucumber) with Playwright for browser automation.

## Test Structure

```
wisebits_chat/
├── bdd/                              # Feature files (Gherkin)
│   ├── authentication.feature
│   ├── chat.feature
│   └── stories.feature
└── frontend/e2e/
    └── step-definitions/              # Step implementations
        ├── auth.steps.ts
        ├── chat.steps.ts
        ├── stories.steps.ts
        └── world.ts                   # Shared context
```

## Writing Gherkin Features

### Feature File Structure

**bdd/authentication.feature:**
```gherkin
Feature: User Authentication
  As a user
  I want to register and login
  So that I can access the chat application

  Background:
    Given I am on the home page

  Scenario: Successful registration
    When I register with username "alice", email "alice@example.com", and password "password123"
    Then I should see the chat interface
    And I should be logged in as "alice"

  Scenario: Duplicate registration
    Given a user with email "bob@example.com" already exists
    When I try to register with email "bob@example.com"
    Then I should see an error "Email already registered"

  Scenario: Successful login
    Given a user with email "charlie@example.com" and password "password123" exists
    When I login with email "charlie@example.com" and password "password123"
    Then I should see the chat interface

  Scenario: Login with incorrect password
    Given a user with email "dave@example.com" and password "correctpass" exists
    When I login with email "dave@example.com" and password "wrongpass"
    Then I should see an error "Invalid credentials"

  @security
  Scenario: XSS protection in registration
    When I register with username "<script>alert('xss')</script>"
    And I view my profile
    Then I should not see JavaScript execution
```

### Gherkin Best Practices

1. **Use Given-When-Then**: 
   - **Given**: Set up initial state
   - **When**: Perform action
   - **Then**: Verify outcome

2. **Write from user perspective**: Use business language, not technical

3. **One scenario per test case**: Keep scenarios focused

4. **Use Background**: For common setup steps

5. **Tag scenarios**: `@smoke`, `@regression`, `@security`, `@wip`

## Writing Step Definitions

### Create World Context

**frontend/e2e/step-definitions/world.ts:**
```typescript
import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';

export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page!: Page;
  testData: Record<string, any> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async cleanup() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(CustomWorld);
```

### Hooks for Setup/Teardown

**frontend/e2e/step-definitions/hooks.ts:**
```typescript
import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { CustomWorld } from './world';

Before(async function (this: CustomWorld) {
  await this.init();
});

After(async function (this: CustomWorld) {
  await this.cleanup();
});

BeforeAll(async function () {
  console.log('Starting test suite');
  // Clean test database, etc.
});

AfterAll(async function () {
  console.log('Test suite completed');
});
```

### Authentication Steps

**frontend/e2e/step-definitions/auth.steps.ts:**
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from './world';

const BASE_URL = 'http://localhost:4173';

Given('I am on the home page', async function (this: CustomWorld) {
  await this.page.goto(BASE_URL);
  await this.page.waitForLoadState('networkidle');
});

When(
  'I register with username {string}, email {string}, and password {string}',
  async function (this: CustomWorld, username: string, email: string, password: string) {
    await this.page.click('[data-testid="register-tab"]');
    await this.page.fill('[data-testid="register-username"]', username);
    await this.page.fill('[data-testid="register-email"]', email);
    await this.page.fill('[data-testid="register-password"]', password);
    await this.page.click('[data-testid="register-submit"]');

    // Store for later verification
    this.testData.username = username;
  }
);

Then('I should see the chat interface', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="chat-interface"]')).toBeVisible({
    timeout: 5000,
  });
});

Then('I should be logged in as {string}', async function (this: CustomWorld, username: string) {
  const displayedUsername = await this.page.locator('[data-testid="current-username"]').textContent();
  expect(displayedUsername).toContain(username);
});

Given('a user with email {string} already exists', async function (this: CustomWorld, email: string) {
  // Create user via API
  await fetch(`http://localhost:3000/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'existinguser',
      email,
      password: 'password123',
    }),
  });
});

When('I try to register with email {string}', async function (this: CustomWorld, email: string) {
  await this.page.click('[data-testid="register-tab"]');
  await this.page.fill('[data-testid="register-username"]', 'newuser');
  await this.page.fill('[data-testid="register-email"]', email);
  await this.page.fill('[data-testid="register-password"]', 'password123');
  await this.page.click('[data-testid="register-submit"]');
});

Then('I should see an error {string}', async function (this: CustomWorld, errorMessage: string) {
  const error = this.page.locator('[data-testid="error-message"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText(errorMessage);
});
```

### Chat Steps

**frontend/e2e/step-definitions/chat.steps.ts:**
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from './world';

Given('I am logged in as {string}', async function (this: CustomWorld, username: string) {
  // Login via API and set token
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email: `${username}@example.com`,
      password: 'password123',
    }),
  });
  const { access_token } = await response.json();
  
  // Set token in localStorage
  await this.page.goto('http://localhost:4173');
  await this.page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, access_token);
  
  await this.page.reload();
  this.testData.currentUser = username;
  this.testData.token = access_token;
});

When('I start a conversation with {string}', async function (this: CustomWorld, username: string) {
  await this.page.click('[data-testid="new-conversation"]');
  await this.page.fill('[data-testid="user-search"]', username);
  await this.page.click(`[data-testid="user-${username}"]`);
});

When('I send a message {string}', async function (this: CustomWorld, message: string) {
  await this.page.fill('[data-testid="message-input"]', message);
  await this.page.click('[data-testid="send-button"]');
});

Then('I should see the message {string} in the conversation', async function (this: CustomWorld, message: string) {
  const messageLocator = this.page.locator(`[data-testid="message"]:has-text("${message}")`);
  await expect(messageLocator).toBeVisible({ timeout: 5000 });
});

Then('{string} should receive the message {string}', async function (this: CustomWorld, username: string, message: string) {
  // Open second browser for the other user
  const context2 = await this.browser!.newContext();
  const page2 = await context2.newPage();
  
  // Login as the other user
  await page2.goto('http://localhost:4173');
  await page2.evaluate((token) => {
    localStorage.setItem('token', token);
  }, this.testData.otherUserToken);
  
  await page2.reload();
  
  // Check for message
  await expect(page2.locator(`text=${message}`)).toBeVisible({ timeout: 10000 });
  
  await page2.close();
  await context2.close();
});
```

### Stories Steps

**frontend/e2e/step-definitions/stories.steps.ts:**
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from './world';
import * as path from 'path';

When('I upload a story with file {string}', async function (this: CustomWorld, filename: string) {
  const filePath = path.resolve(__dirname, '../../test-fixtures', filename);
  
  await this.page.click('[data-testid="upload-story"]');
  await this.page.setInputFiles('[data-testid="file-input"]', filePath);
  await this.page.click('[data-testid="confirm-upload"]');
});

Then('I should see my story in the stories bar', async function (this: CustomWorld) {
  const username = this.testData.currentUser;
  const storyAvatar = this.page.locator(`[data-testid="story-avatar-${username}"]`);
  await expect(storyAvatar).toBeVisible({ timeout: 5000 });
});

When('I click on {string} story', async function (this: CustomWorld, username: string) {
  await this.page.click(`[data-testid="story-avatar-${username}"]`);
});

Then('I should see the story viewer', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="story-viewer"]')).toBeVisible();
});

When('I try to upload a file {string}', async function (this: CustomWorld, filename: string) {
  const filePath = path.resolve(__dirname, '../../test-fixtures', filename);
  
  await this.page.click('[data-testid="upload-story"]');
  await this.page.setInputFiles('[data-testid="file-input"]', filePath);
});

Then('I should see an error about unsupported file type', async function (this: CustomWorld) {
  const error = this.page.locator('[data-testid="file-error"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText('unsupported');
});
```

## Running Tests

### Run All Features

```bash
cd frontend
pnpm test:bdd
```

### Run Specific Feature

```bash
npx cucumber-js ../bdd/authentication.feature \
  --require-module ts-node/register \
  --require 'e2e/step-definitions/**/*.ts'
```

### Run with Tags

```bash
npx cucumber-js ../bdd/*.feature \
  --tags "@smoke" \
  --require-module ts-node/register \
  --require 'e2e/step-definitions/**/*.ts'
```

### Run in Parallel

```bash
npx cucumber-js ../bdd/*.feature \
  --parallel 3 \
  --require-module ts-node/register \
  --require 'e2e/step-definitions/**/*.ts'
```

## Configuration

**cucumber.js:**
```javascript
module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['e2e/step-definitions/**/*.ts'],
    format: ['progress', 'html:cucumber-report.html', 'json:cucumber-report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
```

## Best Practices

1. **Page Object Pattern**: Encapsulate page interactions
2. **Reusable Steps**: Create generic, reusable step definitions
3. **Data-testid**: Always use `data-testid` for selectors
4. **Explicit Waits**: Use `waitForSelector` for dynamic content
5. **Clean State**: Ensure each scenario starts with clean state
6. **API Setup**: Use API calls for test data setup, not UI
7. **Screenshot on Failure**: Capture screenshots for debugging
8. **Parallel Execution**: Run tests in parallel for speed
9. **Type Safety**: Use TypeScript for step definitions
10. **Meaningful Names**: Use descriptive step and scenario names
