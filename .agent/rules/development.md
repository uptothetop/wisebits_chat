# Development Workflow

## Quick Start

### Development Mode (Recommended)
```bash
pnpm start:dev
```

This starts:
- 🐳 MongoDB in Docker (`localhost:27017`)
- 📦 Persistent stories volume (Docker)
- 🔧 Backend API locally (`http://localhost:3000`)
- 🎨 Frontend dev server locally (`http://localhost:5173`)

### Production Mode (Full Docker)
```bash
pnpm start
```

This builds everything and runs all services in Docker. Backend serves frontend at `http://localhost:3000`.

## Available Commands

### Start Services

| Command | Description |
|---------|-------------|
| `pnpm start:dev` | **Development**: MongoDB in Docker, backend/frontend locally |
| `pnpm start` | **Production**: Everything in Docker |
| `pnpm dev` | Run backend + frontend locally (MongoDB must be running) |
| `pnpm dev:backend` | Start backend only (local) |
| `pnpm dev:frontend` | Start frontend only (local) |

### Docker Commands

| Command | Description |
|---------|-------------|
| `pnpm docker:up` | Start all Docker services |
| `pnpm docker:down` | Stop all Docker containers |
| `pnpm docker:restart` | Restart Docker containers |
| `pnpm docker:build` | Rebuild Docker images |

### Build Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build both frontend and backend (production-ready) |
| `pnpm build:backend` | Build backend only → `backend/dist/` |
| `pnpm build:frontend` | Build frontend only → `frontend/build/` |

### Testing Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests (backend unit + E2E BDD) |
| `pnpm test:backend` | Run backend unit tests (Jest) |
| `pnpm test:frontend:unit` | Run frontend unit tests (Vitest) |
| `pnpm test:e2e:bdd` | Run E2E BDD tests (Cucumber) |
| `pnpm test:e2e:playwright` | Run E2E Playwright tests |

## Docker Architecture

### Services

```yaml
services:
  mongo:
    - Port: 27017
    - Data persistence: mongodb_data volume
  
  mongo-express:
    - Port: 8081
    - Web UI for MongoDB management
  
  backend (production only):
    - Port 3000
    - Serves both API and frontend static files
```

### Volumes

- **mongodb_data**: Database persistence across container restarts
- **stories-uploads**: Uploaded stories persistence

## Environment Setup

### Prerequisites

1. **Node.js**: v20 or higher
2. **pnpm**: v9 or higher
   ```bash
   npm install -g pnpm
   ```
3. **Docker**: For MongoDB and production deployment
4. **Playwright browsers** (for E2E tests):
   ```bash
   cd frontend
   npx playwright install
   ```

### Environment Variables

Create `.env` files in respective directories:

**`backend/.env`:**
```env
MONGO_USER=root
MONGO_PASSWORD=example
JWT_SECRET=supersecretkey
PORT=3000
```

**Root `.env`** (optional, for Docker Compose):
```env
MONGO_USER=root
MONGO_PASSWORD=example
```

## Typical Workflows

### Daily Development
```bash
# Start development environment
pnpm start:dev

# Work on code...
# Backend auto-reloads on file changes
# Frontend hot-reloads on file changes

# Run tests
pnpm test:backend
pnpm test:e2e:bdd
```

### Testing Workflow
```bash
# Start services
pnpm start:dev

# In another terminal: Run tests
pnpm test
```

### Production Build & Test
```bash
# Build and deploy everything in Docker
pnpm start

# Access at http://localhost:3000
```

## Troubleshooting

### MongoDB Connection Failed
```bash
# Restart Docker containers
pnpm docker:restart

# Or recreate with fresh volumes
pnpm docker:down
pnpm docker:up
```

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### E2E Tests Fail - "Failed to fetch"
Ensure backend is running:
```bash
curl http://localhost:3000
# Should return: "Hello World!"
```

### Camera Not Working
- Ensure using localhost or HTTPS
- Check browser permissions (camera/microphone)
- Try Chrome/Edge (best compatibility)

### Docker Volume Issues
```bash
# Remove all volumes and restart
docker-compose down -v
pnpm docker:up
```

### Install Dependencies
```bash
# Install all workspace dependencies
pnpm install

# Install backend dependencies only
cd backend && pnpm install

# Install frontend dependencies only
cd frontend && pnpm install
```

## File Structure

```
wisebits_chat/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── chat/          # Chat & WebSocket gateway
│   │   ├── users/         # User management
│   │   ├── stories/       # Stories feature
│   │   └── main.ts        # Application entry point
│   ├── uploads/           # Local dev uploads (Docker volume in prod)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/  # Svelte components
│   │   │   ├── api.ts       # API client
│   │   │   └── stores.ts    # Svelte stores
│   │   └── routes/          # SvelteKit routes
│   ├── e2e/                 # E2E tests
│   └── package.json
├── bdd/                     # Gherkin feature files
├── docker-compose.yml
├── package.json             # Root workspace scripts
└── pnpm-workspace.yaml
```

## Development Best Practices

1. **Always use pnpm**: Never use npm or yarn in this project
2. **Start with dev mode**: Use `pnpm start:dev` for development
3. **Run tests frequently**: Especially before committing
4. **Check linting**: Backend uses ESLint (`pnpm lint` in backend/)
5. **Type checking**: Both backend and frontend use TypeScript
6. **Git workflow**: Commit working code, test before pushing
