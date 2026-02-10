# Wisebits Chat - Development & Testing Guide

## Quick Start

### Development Mode (Recommended for Development)
```bash
pnpm start:dev
```

This starts:
- 🐳 MongoDB (Docker): `localhost:27017`
- 📦 Persistent Stories Volume (Docker)
- 🔧 Backend API (local): `http://localhost:3000`
- 🎨 Frontend Dev Server (local): `http://localhost:5173`

### Production Mode (Full Docker Deployment)
```bash
pnpm start
```

This:
1. Builds frontend → `frontend/build`
2. Builds backend → `backend/dist`
3. Copies frontend build to backend
4. Builds Docker images
5. Starts all services in Docker

Backend serves frontend at: `http://localhost:3000`

---

## Features

### 📸 Stories with Camera Recording
- Upload photos/videos from device
- **NEW:** Record videos directly from camera
- Auto-deletion after 24 hours
- Persistent storage in Docker volume

---

## Development Commands

### Start Services

```bash
# Development mode: MongoDB in Docker, backend + frontend locally
pnpm start:dev

#Production mode: Everything in Docker
pnpm start

# Start backend only (local)
pnpm dev:backend

# Start frontend only (local)
pnpm dev:frontend

# Start both locally (requires MongoDB running)
pnpm dev
```

### Docker Commands

```bash
# Start all Docker services
pnpm docker:up

# Stop all Docker containers
pnpm docker:down

# Restart Docker containers
pnpm docker:restart

# Rebuild Docker images
pnpm docker:build
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

# Build both (production-ready)
pnpm build
```

---

## Docker Architecture

### Services
- **mongo**: MongoDB database
- **mongo-express**: Web UI for MongoDB (`http://localhost:8081`)
- **backend**: NestJS API + Frontend static serving (production only)

### Volumes
- **mongo-data**: Database persistence
- **stories-uploads**: Uploaded stories persistence

### Environment Variables
Create `.env` files in respective directories:

**`backend/.env`:**
```env
MONGO_USER=root
MONGO_PASSWORD=example
JWT_SECRET=supersecretkey
PORT=3000
```

**Root `.env` (optional, for Docker Compose):**
```env
MONGO_USER=root
MONGO_PASSWORD=example
```

---

## Camera Recording Feature

### User Flow
1. Click **"Record"** button in Stories bar
2. Grant camera permissions
3. Click ⏺ to start recording
4. Click ⏹ to stop (or auto-stops after 30s)
5. Video uploads automatically

### Browser Permissions
Camera recording requires:
- **HTTPS** (production) or **localhost** (development)
- User camera/microphone permissions

### Supported Formats
- **Input**: Files (images/videos) or camera recording
- **Output**: WebM video format (camera), original format (upload)

---

## Available Scripts Summary

| Command | Description |
|---------|-------------|
| `pnpm start` | **Production**: Build everything and run in Docker |
| `pnpm start:dev` | **Development**: MongoDB in Docker, backend/frontend locally |
| `pnpm dev` | Run backend + frontend locally (no Docker) |
| `pnpm dev:backend` | Start backend development server |
| `pnpm dev:frontend` | Start frontend development server |
| `pnpm build` | Build production bundle (frontend + backend) |
| `pnpm test` | Run all tests (backend unit + E2E BDD) |
| `pnpm test:backend` | Run backend unit tests |
| `pnpm test:e2e:bdd` | Run E2E BDD tests (Cucumber) |
| `pnpm test:e2e:playwright` | Run E2E Playwright tests |
| `pnpm docker:up` | Start Docker containers |
| `pnpm docker:down` | Stop Docker containers |
| `pnpm docker:build` | Rebuild Docker images |

---

## Project Structure

```
wisebits_chat/
├── backend/                # NestJS API
│   ├── Dockerfile         # Production container
│   ├── src/
│   └── uploads/           # Local dev uploads (Docker volume in prod)
├── frontend/              # SvelteKit app
│   ├── src/
│   │   └── lib/
│   │       └── components/
│   │           └── StoriesBar.svelte  # Camera recording UI
│   └── e2e/               # E2E tests
├── bdd/                   # Gherkin feature files
│   ├── authentication.feature
│   ├── chat.feature
│   └── stories.feature   # Includes camera scenarios
├── docker-compose.yml     # Docker services
├── package.json           # Root scripts
└── pnpm-workspace.yaml    # Monorepo config
```

---

## Prerequisites

- **Node.js**: v20+
- **pnpm**: v9+
- **Docker**: For MongoDB and production deployment

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
# Start development environment
pnpm start:dev

# Work on code...

#Run tests
pnpm test:backend
pnpm test:e2e:bdd
```

### Production Deployment
```bash
# Build and deploy everything
pnpm start

# Access at http://localhost:3000
```

### Test-Only Workflow
```bash
# Start services
pnpm start:dev

# In another terminal: Run tests
pnpm test
```

---

## Troubleshooting

### MongoDB Connection Failed
```bash
# Restart Docker containers
pnpm docker:restart

# Or recreate with fresh volumes
pnpm docker:down
pnpm docker:up
```

### E2E Tests Fail - "Failed to fetch"
Ensure backend is running:
```bash
curl http://localhost:3000
# Should return: "Hello World!"
```

### Camera Not Working
- Ensure localhost or HTTPS is used
- Check browser permissions (camera/microphone)
- Try in a different browser (Chrome/Edge recommended)

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Docker Volume Issues
```bash
# Remove all volumes and restart
docker-compose down -v
pnpm docker:up
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

---

## Feature Coverage

### Authentication
- ✅ Registration with validation
- ✅ Login/logout
- ✅ JWT token authentication
- ✅ XSS protection

### Real-Time Chat
- ✅ One-on-one conversations
- ✅ WebSocket messaging
- ✅ Real-time updates
- ✅ Message history

### Stories
- ✅ Upload images/videos
- ✅ **Camera recording (NEW)**
- ✅ 24-hour auto-expiration
- ✅ Persistent Docker storage
- ✅ Story viewer with auto-advance
