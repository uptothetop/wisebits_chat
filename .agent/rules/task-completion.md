# Task Completion Quality Checklist

## Overview

This document outlines the mandatory quality gates that MUST be fulfilled before considering any task complete. These rules ensure the system works correctly, passes all tests, and maintains high code quality.

## Mandatory Quality Gates

### 0. System Functionality Verification

**Verify the system actually works by starting all services:**

```bash
# Step 1: Start Docker services
docker-compose up -d

# Step 2: Verify Docker containers are running
docker-compose ps

# Step 3: Start backend
cd backend
pnpm start:dev

# Step 4: Start frontend (in another terminal)
cd frontend
pnpm dev

# Step 5: Run health check
./scripts/health-check.sh
```

**Required outcomes:**
- ✅ MongoDB container is running
- ✅ Backend starts without errors on port 3000
- ✅ Frontend starts without errors on port 5173
- ✅ Health check shows all core services as healthy
- ✅ Can access frontend at http://localhost:5173
- ✅ Can access backend at http://localhost:3000

**If any service fails to start:**
- Review error logs
- Check environment variables
- Verify dependencies are installed
- Fix issues before proceeding

---

### 1. Security Testing

**Run security tests and verify they pass:**

```bash
# Run all security-related BDD tests
cd frontend
pnpm test:bdd -- --tags "@security"

# Run backend unit tests with security focus
cd backend
pnpm test -- --testNamePattern="security|auth|authorization"
```

**Security test coverage must include:**
- ✅ XSS protection in user input (messages, usernames, etc.)
- ✅ Authentication (JWT token validation)
- ✅ Authorization (resource ownership verification)
- ✅ SQL/NoSQL injection prevention
- ✅ Unauthorized access attempts return 403 Forbidden
- ✅ File upload validation (type and size limits)

**If security tests fail:**
- Review the security skill: `.agent/skills/security/SKILL.md`
- Fix vulnerabilities immediately
- Re-run tests until all pass

---

### 2. Testing Coverage

**Run ALL tests and ensure they pass:**

#### Backend Unit Tests
```bash
cd backend
pnpm test

# Check coverage (should be > 70%)
pnpm test:cov
```

**Required:**
- ✅ All backend unit tests pass
- ✅ Code coverage > 70%
- ✅ No failing tests
- ✅ No skipped critical tests

#### Frontend Unit Tests
```bash
cd frontend
pnpm test:unit
```

**Required:**
- ✅ All frontend unit tests pass
- ✅ Component tests cover critical flows

#### E2E BDD Tests
```bash
# Use the comprehensive test script
./scripts/test-all.sh

# Or run manually:
pnpm test:e2e:bdd
```

**Required:**
- ✅ All BDD scenarios pass (authentication, chat, stories, security)
- ✅ Real-time messaging works in tests
- ✅ No flaky tests (run twice to verify)

#### Review and Update Tests

**Before completing a task:**

1. **Review existing BDD scenarios** in `/bdd/` directory:
   - Is the new feature covered?
   - Are edge cases tested?
   - Do scenarios need updating?

2. **Add new BDD scenarios** if needed:
   ```gherkin
   Scenario: [New feature description]
     Given [initial state]
     When [action performed]
     Then [expected outcome]
   ```

3. **Update unit tests** for changed code:
   - Add tests for new functions/methods
   - Update tests for modified behavior
   - Ensure mocks are up to date

4. **Run all tests** to verify:
   ```bash
   ./scripts/test-all.sh
   ```

**All tests MUST pass before task completion.**

---

### 3. Code Quality - Linting

**Run linters and fix all errors:**

#### Backend Linting
```bash
cd backend
pnpm lint

# Auto-fix issues where possible
pnpm lint:fix
```

**Required:**
- ✅ No ESLint errors
- ✅ No TypeScript compilation errors
- ✅ Code follows NestJS style guide

#### Frontend Linting
```bash
cd frontend
pnpm lint

# Check TypeScript types
pnpm check
```

**Required:**
- ✅ No ESLint errors
- ✅ No Svelte linting errors
- ✅ No TypeScript type errors

#### Common Linting Issues and Fixes

**Unused variables:**
```typescript
// ❌ Error: 'user' is defined but never used
const user = getCurrentUser();

// ✅ Fix: Remove or prefix with underscore if intentionally unused
const _user = getCurrentUser(); // Or remove if truly not needed
```

**Missing return types:**
```typescript
// ❌ Error: Missing return type
async function getUser(id: string) {
  return await userService.findById(id);
}

// ✅ Fix: Add explicit return type
async function getUser(id: string): Promise<User> {
  return await userService.findById(id);
}
```

**Import order:**
```typescript
// ❌ Error: Imports not sorted
import { Component } from './component';
import { Injectable } from '@nestjs/common';

// ✅ Fix: External imports first, then local
import { Injectable } from '@nestjs/common';
import { Component } from './component';
```

---

## Complete Quality Verification Script

**Run this comprehensive script before task completion:**

```bash
#!/bin/bash
# quality-check.sh

echo "🔍 Running Quality Checks..."

# 0. Health Check
echo "\n0️⃣ Checking system health..."
./scripts/health-check.sh || exit 1

# 1. Security Tests
echo "\n1️⃣ Running security tests..."
cd frontend
pnpm test:bdd -- --tags "@security" || exit 1
cd ..

# 2. All Tests
echo "\n2️⃣ Running all tests..."
./scripts/test-all.sh || exit 1

# 3. Linting
echo "\n3️⃣ Running linters..."
cd backend
pnpm lint || exit 1
cd ../frontend
pnpm lint || exit 1
pnpm check || exit 1
cd ..

echo "\n✅ All quality checks passed!"
```

**Save this to `scripts/quality-check.sh` and make executable:**
```bash
chmod +x scripts/quality-check.sh
```

---

## Task Completion Workflow

Follow this workflow when completing ANY task:

1. **✅ Implement the feature/fix**
   - Write code following project patterns
   - Use appropriate skills (NestJS, SvelteKit, WebSocket, Security)

2. **✅ Write/update tests**
   - Add unit tests for new code
   - Add/update BDD scenarios for user-facing features
   - Include security tests if relevant

3. **✅ Run quality checks**
   ```bash
   ./scripts/quality-check.sh
   ```

4. **✅ Fix any issues**
   - Address failing tests
   - Fix linting errors
   - Resolve security vulnerabilities

5. **✅ Verify system works end-to-end**
   - Start all services
   - Test the feature manually in browser
   - Verify real-time updates work

6. **✅ Document changes**
   - Update README if needed
   - Add comments for complex logic
   - Update BDD feature files

7. **✅ Final verification**
   ```bash
   # Run comprehensive check one more time
   ./scripts/quality-check.sh
   ```

**Only mark task as complete when ALL quality gates pass.**

---

## Common Blockers and Solutions

### Tests Fail
- **Check logs** for specific error messages
- **Review recent changes** that might have broken tests
- **Run tests in isolation** to identify flaky tests
- **Check test data** - might need cleanup between tests

### Linting Errors
- **Run auto-fix first**: `pnpm lint:fix`
- **Read error messages carefully** - they often suggest fixes
- **Check .eslintrc** for project-specific rules
- **Ask for help** if rule seems incorrect

### System Won't Start
- **Check environment variables** - are .env files present?
- **Verify Docker is running** - `docker ps`
- **Check ports** - kill processes on 3000, 5173, 27017
- **Review logs** - backend/frontend console output
- **Run setup script** - `./scripts/setup.sh`

### Security Tests Fail
- **Review security skill** - `.agent/skills/security/SKILL.md`
- **Check input validation** - are DTOs properly configured?
- **Verify guards** - are routes protected?
- **Test manually** - try XSS/injection attacks yourself

---

## Remember

> **Quality is not negotiable.**
> 
> Taking shortcuts on testing, linting, or security creates technical debt and potential vulnerabilities. Always complete all quality gates before marking a task done.

**Every commit should:**
- ✅ Pass all tests
- ✅ Pass all linters
- ✅ Work when run locally
- ✅ Be secure by default
