# Wisebits Chat - Development & Testing Guide

## Quick Start

### Start Everything
```bash
pnpm start          # Starts Docker (MongoDB) + Backend + Frontend
```

This will start:
- 🐳 MongoDB (Docker): `localhost:27017`
- 🔧 Backend API: `http://localhost:3000`
- 🎨 Frontend: `http://localhost:5173`

---

## Development Commands

### Start Individual Services

```bash
# Start backend only
pnpm dev:backend

# Start frontend only
pnpm dev:frontend

# Start both (frontend + backend)
pnpm dev
```

### Docker Commands

```bash
# Start MongoDB containers
pnpm docker:up

# Stop MongoDB containers
pnpm docker:down

# Restart MongoDB
pnpm docker:restart
```

---

## Testing Commands

### Backend Unit Tests
```bash
pnpm test:backend
```
Runs Jest tests for backend services, controllers, and guards.

### Frontend Unit Tests
```bash
pnpm test:frontend:unit
```
Runs Vitest tests for frontend components and utilities.

### E2E Tests (Cucumber/BDD)
```bash
pnpm test:e2e:bdd
```
Runs Cucumber tests from Gherkin scenarios in `/bdd` directory.
- Builds frontend
- Starts preview server
- Executes BDD tests
- Generates `cucumber-report.html`

### E2E Tests (Playwright)
```bash
pnpm test:e2e:playwright
```
Runs traditional Playwright E2E tests from `frontend/e2e/*.test.ts`.

### E2E Tests (Default)
```bash
pnpm test:e2e
```
Alias for `test:e2e:bdd` (Cucumber tests).

### All Tests
```bash
pnpm test
```
Runs:
1. Backend unit tests
2. E2E BDD tests

---

## Build Commands

```bash
# Build backend
pnpm build:backend

# Build frontend
pnpm build:frontend

# Build both
pnpm build
```

---

## Available Scripts Summary

| Command | Description |
|---------|-------------|
| `pnpm start` | Start everything (Docker + Backend + Frontend) |
| `pnpm dev` | Start backend + frontend (no Docker) |
| `pnpm dev:backend` | Start backend development server |
| `pnpm dev:frontend` | Start frontend development server |
| `pnpm build` | Build backend and frontend |
| `pnpm test` | Run all tests (backend unit + E2E BDD) |
| `pnpm test:backend` | Run backend unit tests |
| `pnpm test:frontend:unit` | Run frontend unit tests |
| `pnpm test:e2e` | Run E2E BDD tests (Cucumber) |
| `pnpm test:e2e:bdd` | Run E2E BDD tests (Cucumber) |
| `pnpm test:e2e:playwright` | Run E2E Playwright tests |
| `pnpm docker:up` | Start Docker containers |
| `pnpm docker:down` | Stop Docker containers |
| `pnpm docker:restart` | Restart Docker containers |

---

## Project Structure

```
wisebits_chat/
├── backend/          # NestJS API
├── frontend/         # SvelteKit app
├── bdd/              # Gherkin feature files
├── docker-compose.yml
├── package.json      # Root scripts (this file)
└── pnpm-workspace.yaml
```

---

## Prerequisites

- **Node.js**: v20+
- **pnpm**: v9+
- **Docker**: For MongoDB

### Install pnpm
```bash
npm install -g pnpm
```

### Install Playwright browsers (for E2E tests)
```bash
cd frontend
npx playwright install
```

---

## Typical Workflows

### Development Workflow
```bash
# Terminal 1: Start services
pnpm start

# Work on code...

# Terminal 2: Run tests
pnpm test:backend
pnpm test:e2e
```

### Test-Only Workflow
```bash
# Start backend manually
pnpm dev:backend

# In another terminal: Run E2E tests
pnpm test:e2e:bdd
```

### CI/CD Workflow
```bash
# Install dependencies
pnpm install

# Build everything
pnpm build

# Run all tests
pnpm test
```

---

## Troubleshooting

### MongoDB Connection Failed
```bash
# Restart Docker containers
pnpm docker:restart

# Or recreate them
pnpm docker:down
pnpm docker:up
```

### E2E Tests Fail - "Failed to fetch"
Ensure backend is running:
```bash
curl http://localhost:3000
# Should return: {"message":"Hello World!"}
```

### Port Already in Use
Kill processes on ports:
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

---

## Reports

### Cucumber Test Reports
After running `pnpm test:e2e:bdd`:
```bash
open frontend/cucumber-report.html
```

### Playwright Test Reports
After running `pnpm test:e2e:playwright`:
```bash
cd frontend
npx playwright show-report
```
