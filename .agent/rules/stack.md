# Technology Stack

## Backend Stack

### Framework & Runtime
- **NestJS**: Progressive Node.js framework for building efficient server-side applications
- **TypeScript**: Strongly typed JavaScript for better code quality
- **Node.js**: v20+ runtime environment

### Database
- **MongoDB**: NoSQL document database
- **Mongoose**: ODM (Object Document Mapper) for MongoDB

### Real-Time Communication
- **Socket.io**: WebSocket library for real-time bidirectional communication
- **@nestjs/websockets**: NestJS WebSocket gateway module
- **@nestjs/platform-socket.io**: Socket.io adapter for NestJS

### Authentication
- **JWT (JSON Web Tokens)**: Stateless authentication
- **@nestjs/jwt**: JWT module for NestJS
- **@nestjs/passport**: Authentication middleware
- **bcrypt**: Password hashing

### File Upload
- **Multer**: Middleware for handling multipart/form-data (file uploads)
- **@nestjs/platform-express**: Express adapter with Multer support

### Validation
- **class-validator**: Decorator-based validation
- **class-transformer**: Object transformation

## Frontend Stack

### Framework & Runtime
- **SvelteKit**: Full-stack web framework built on Svelte
- **Svelte**: Reactive UI framework
- **TypeScript**: Type safety for frontend code
- **Vite**: Build tool and dev server

### State Management
- **Svelte Stores**: Built-in reactive state management
  - `writable`: Mutable stores for auth, messages, conversations
  - `derived`: Computed state

### Real-Time Communication
- **socket.io-client**: WebSocket client for real-time updates

### HTTP Client
- **Fetch API**: Native browser API for HTTP requests
- Custom API client wrapper for error handling

### Media Capture
- **MediaRecorder API**: Browser API for video/audio recording
- **MediaDevices API**: Access to camera/microphone

## Development Tools

### Package Manager
- **pnpm**: Fast, disk space efficient package manager
- **pnpm workspaces**: Monorepo management

### Testing

#### Backend Tests
- **Jest**: Testing framework for backend unit tests
- **@nestjs/testing**: NestJS testing utilities

#### Frontend Tests
- **Vitest**: Unit testing framework for frontend
- **Playwright**: Browser automation for E2E tests
- **@cucumber/cucumber**: BDD framework for Gherkin scenarios

### Containerization
- **Docker**: Container runtime
- **Docker Compose**: Multi-container orchestration
- **mongo:latest**: Official MongoDB image
- **mongo-express**: Web-based MongoDB admin interface

## Architecture Patterns

### Backend Patterns
- **Module-based architecture**: Feature modules (auth, chat, users, stories)
- **Dependency Injection**: NestJS built-in DI container
- **Guards**: JWT authentication guards
- **DTOs**: Data Transfer Objects for validation
- **Services**: Business logic layer
- **Controllers**: HTTP endpoint handlers
- **Gateways**: WebSocket event handlers

### Frontend Patterns
- **Component-based architecture**: Reusable Svelte components
- **Store pattern**: Centralized state with Svelte stores
- **Route-based code splitting**: SvelteKit automatic code splitting
- **API abstraction**: Centralized API client

## Environment Variables

### Backend (.env)
```env
MONGO_USER=root
MONGO_PASSWORD=example
JWT_SECRET=supersecretkey
PORT=3000
```

### Docker Compose (.env)
```env
MONGO_USER=root
MONGO_PASSWORD=example
```

## Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| Backend API | 3000 | NestJS REST API + WebSocket |
| Frontend Dev | 5173 | Vite dev server |
| Frontend Preview | 4173 | Production build preview |
| MongoDB | 27017 | Database |
| Mongo Express | 8081 | Database admin UI |

## Browser Requirements

- **Modern browsers**: Chrome, Firefox, Edge, Safari (latest versions)
- **HTTPS or localhost**: Required for camera/microphone access
- **WebSocket support**: All modern browsers support WebSockets
