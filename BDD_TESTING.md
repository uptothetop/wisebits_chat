# Running BDD/Cucumber Tests

This project includes Behavior-Driven Development (BDD) tests using Cucumber and Playwright.

## Test Structure

```
wisebits_chat/
├── bdd/                              # Gherkin feature files
│   ├── authentication.feature
│   ├── chat.feature
│   └── stories.feature
└── frontend/
    └── e2e/
        └── step-definitions/          # Step implementations
            ├── auth.steps.ts
            ├── chat.steps.ts
            └── stories.steps.ts
```

## Prerequisites

1. **Backend running**: Ensure the backend is running on `http://localhost:3000`
   ```bash
   cd backend
   pnpm start:dev
   ```

2. **Frontend built**: Build the frontend for testing 
   ```bash
   cd frontend
   pnpm build
   pnpm preview  # Runs on http://localhost:4173
   ```

## Running Tests

### Option 1: Run BDD Tests with Cucumber

```bash
cd frontend
pnpm test:bdd
```

This will:
- Execute all `.feature` files in the `../bdd` directory
- Use step definitions from `e2e/step-definitions/`
- Generate HTML report: `cucumber-report.html`
- Generate JSON report: `cucumber-report.json`

### Option 2: Run Traditional Playwright E2E Tests festivals

```bash
cd frontend
npx playwright test
```

### Option 3: Run Specific Feature

```bash
cd frontend
npx cucumber-js ../bdd/authentication.feature --require-module ts-node/register --require 'e2e/step-definitions/**/*.ts'
```

## Feature Coverage

### Authentication (`authentication.feature`)
- ✅ Happy Path: Successful registration and login
- ✅ Unhappy Path: Duplicate registration
- ✅ Unhappy Path: Incorrect password
- ✅ Security: XSS protection

### Chat (`chat.feature`)  
- ✅ Happy Path: New conversation
- ✅ Happy Path: Real-time message delivery
- ✅ Unhappy Path: Empty messages
- ✅ Security: Unauthorized conversation access, XSS protection

### Stories (`stories.feature`)
- ✅ Happy Path: Upload story
- ✅ Happy Path: View story
- ✅ Unhappy Path: Unsupported file types
- ✅ Security: Unauthorized story deletion
- ✅ Business Logic: 24-hour expiration

## Reports

After running `pnpm test:bdd`, view the HTML report:

```bash
open cucumber-report.html
```

## Notes

- Step definitions use Playwright for browser automation
- Each scenario runs in an isolated browser context
- Tests expect the app to be running on `http://localhost:4173` (Vite preview)
- Some security and multi-user tests are simulated (e.g., XSS checks, real-time delivery)

## Troubleshooting

**Tests fail with "Failed to fetch":**
- Ensure backend is running on port 3000
- Check MongoDB is accessible

**Browser not launching:**
- Install Playwright browsers: `npx playwright install`

**Step definition not found:**
- Check the Gherkin step text matches the regex in step definition files
- Ensure all dependencies are installed: `pnpm install`
