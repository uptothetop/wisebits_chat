# Testing Strategy

## Overview

The project uses a comprehensive testing strategy with:
- **Unit tests**: Backend (Jest) and Frontend (Vitest)
- **E2E tests**: BDD/Cucumber + Playwright

## Test Structure

```
wisebits_chat/
├── backend/
│   └── src/
│       ├── **/*.spec.ts       # Jest unit tests
│       └── **/*.service.spec.ts
├── frontend/
│   ├── src/**/*.spec.ts       # Vitest unit tests
│   └── e2e/
│       ├── step-definitions/   # Cucumber step implementations
│       │   ├── auth.steps.ts
│       │   ├── chat.steps.ts
│       │   └── stories.steps.ts
│       └── *.test.ts          # Traditional Playwright tests
└── bdd/
    ├── authentication.feature  # Gherkin scenarios
    ├── chat.feature
    └── stories.feature
```

## Backend Unit Tests

### Running Tests
```bash
# Run all backend unit tests
pnpm test:backend

# Run specific test file
cd backend
pnpm test auth.service.spec.ts

# Run with coverage
cd backend
pnpm test:cov
```

### Test Framework
- **Jest**: Testing framework
- **@nestjs/testing**: NestJS testing utilities

### What to Test
- ✅ Service business logic
- ✅ Controller request/response handling
- ✅ Guards (JWT authentication)
- ✅ DTOs validation
- ✅ Error handling

### Example Test Pattern
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## Frontend Unit Tests

### Running Tests
```bash
# Run all frontend unit tests
pnpm test:frontend:unit

# Run in watch mode
cd frontend
pnpm test:unit -- --watch
```

### Test Framework
- **Vitest**: Fast unit testing framework
- **@testing-library/svelte**: Testing utilities for Svelte

### What to Test
- ✅ Component rendering
- ✅ User interactions
- ✅ Store state changes
- ✅ Utility functions
- ✅ API client logic

## E2E BDD Tests (Cucumber)

### Running Tests
```bash
# Run all BDD tests
pnpm test:e2e:bdd

# Run specific feature
cd frontend
npx cucumber-js ../bdd/authentication.feature --require-module ts-node/register --require 'e2e/step-definitions/**/*.ts'
```

### Prerequisites
1. Backend must be running on `http://localhost:3000`
2. Frontend must be built and running on `http://localhost:4173`

### Test Framework
- **Cucumber**: BDD framework using Gherkin syntax
- **Playwright**: Browser automation
- **ts-node**: TypeScript execution for step definitions

### Feature Coverage

#### Authentication (`authentication.feature`)
- ✅ Happy Path: Successful registration and login
- ✅ Unhappy Path: Duplicate registration
- ✅ Unhappy Path: Incorrect password
- ✅ Security: XSS protection

#### Chat (`chat.feature`)
- ✅ Happy Path: New conversation
- ✅ Happy Path: Real-time message delivery
- ✅ Unhappy Path: Empty messages
- ✅ Security: Unauthorized access, XSS protection

#### Stories (`stories.feature`)
- ✅ Happy Path: Upload story
- ✅ Happy Path: View story
- ✅ Happy Path: Camera recording (manual verification)
- ✅ Unhappy Path: Unsupported file types
- ✅ Security: Unauthorized deletion
- ✅ Business Logic: 24-hour expiration

### Gherkin Syntax
```gherkin
Feature: Authentication
  As a user
  I want to register and login
  So that I can access the chat application

  Scenario: Successful registration
    Given I am on the home page
    When I register with username "testuser", email "test@example.com", and password "password123"
    Then I should see the chat interface
```

### Step Definition Pattern
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the home page', async function () {
  await this.page.goto('http://localhost:4173');
});

When('I register with username {string}, email {string}, and password {string}', 
  async function (username: string, email: string, password: string) {
    await this.page.fill('[data-testid="username-input"]', username);
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="register-button"]');
  }
);

Then('I should see the chat interface', async function () {
  await expect(this.page.locator('[data-testid="chat-interface"]')).toBeVisible();
});
```

## E2E Playwright Tests (Traditional)

### Running Tests
```bash
# Run all Playwright tests
pnpm test:e2e:playwright

# Run in UI mode
cd frontend
npx playwright test --ui

# Run specific test file
cd frontend
npx playwright test e2e/chat.test.ts
```

### Test Framework
- **Playwright**: Modern browser automation

## Test Reports

### Cucumber Reports
After running BDD tests, view HTML report:
```bash
open frontend/cucumber-report.html
```

Reports include:
- Feature execution summary
- Scenario pass/fail status
- Step-by-step execution details
- Screenshots on failures

### Playwright Reports
After running Playwright tests:
```bash
cd frontend
npx playwright show-report
```

## Testing Best Practices

### General Guidelines
1. **Run tests before committing**: Catch issues early
2. **Write descriptive test names**: Clearly indicate what is being tested
3. **Keep tests isolated**: Each test should be independent
4. **Use test data wisely**: Don't hardcode sensitive data
5. **Clean up after tests**: Remove test data created during tests

### BDD Guidelines
1. **Write scenarios from user perspective**: Use business language
2. **Keep scenarios focused**: One feature per scenario
3. **Use meaningful scenario names**: Describe the expected behavior
4. **Reuse step definitions**: Build a library of reusable steps
5. **Tag scenarios appropriately**: `@smoke`, `@regression`, `@wip`

### Unit Test Guidelines
1. **Test one thing at a time**: Single responsibility per test
2. **Mock external dependencies**: Database, API calls, etc.
3. **Aim for high coverage**: But focus on critical paths first
4. **Test edge cases**: Not just happy paths
5. **Keep tests fast**: Unit tests should run quickly

## Continuous Integration

### Pre-commit Checks
Recommended pre-commit hook:
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running tests..."
pnpm test:backend || exit 1
echo "All tests passed!"
```

### CI Pipeline (Example)
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:backend
      - run: pnpm docker:up -d
      - run: pnpm test:e2e:bdd
```

## Troubleshooting Tests

### Backend Tests Fail - MongoDB Connection
Mock the MongoDB connection in tests:
```typescript
const mockMongooseModule = {
  forRoot: jest.fn(() => ({})),
};
```

### E2E Tests Fail - "Failed to fetch"
1. Ensure backend is running: `curl http://localhost:3000`
2. Check MongoDB is accessible
3. Verify frontend is built: `cd frontend && pnpm build`
4. Start preview server: `cd frontend && pnpm preview`

### Browser Not Launching (Playwright)
Install browsers:
```bash
cd frontend
npx playwright install
```

### Step Definition Not Found
1. Check Gherkin step text matches the regex in step definition
2. Ensure all dependencies are installed: `pnpm install`
3. Verify TypeScript compilation: `cd frontend && npx tsc --noEmit`

### Flaky Tests
1. Add explicit waits: `await page.waitForSelector(...)`
2. Increase timeout: `{ timeout: 10000 }`
3. Use `waitForLoadState`: `await page.waitForLoadState('networkidle')`
4. Check for race conditions in the application code
