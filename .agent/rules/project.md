# Wisebits Chat - Project Overview

## Description

Wisebits Chat is a real-time web chat application with an optional stories feature. This is a test assignment project demonstrating modern web development practices.

## Core Features

### 1. Authentication (Required)
- User registration with email, password, and username
- Login/logout with JWT token authentication
- Protected routes for authenticated users only
- XSS protection and input validation

### 2. Real-Time Messaging (Required)
- One-on-one conversations only (no group chats)
- List of all user conversations
- Create new conversations with any user
- Send and receive text messages in real-time
- WebSocket-based message delivery (Socket.io)
- Message history persistence

### 3. User Management (Required)
- List all users in the system
- Search users by username
- Start conversations with any user

### 4. Stories (Optional - Implemented)
- Upload photos/videos from device
- Record videos directly from camera (up to 15 seconds)
- Stories feed showing users with active stories
- Auto-deletion after 24 hours
- Persistent storage in Docker volumes

## What's NOT Required

The following features are explicitly **out of scope**:

- ❌ Group chats (only 1-on-1 conversations)
- ❌ File/image attachments in chat messages
- ❌ Message editing or deletion
- ❌ Video filters and effects
- ❌ Backend video processing/conversion
- ❌ Push notifications
- ❌ Production deployment
- ❌ Complex UI/UX design (basic functionality is sufficient)
- ❌ Video size optimization

## Success Criteria

### Must Have
1. ✅ Application runs successfully
2. ✅ User registration and login work
3. ✅ Real-time message exchange works
4. ✅ Messages delivered via WebSocket without page reload
5. ✅ Code is structured and readable
6. ✅ Basic error handling is present

### Nice to Have
1. ✅ Stories feature (recording, viewing, auto-deletion)
2. ✅ Docker Compose for quick startup
3. ✅ Tests (unit and E2E)

## Project Structure

```
wisebits_chat/
├── backend/              # NestJS REST API + WebSocket Gateway
├── frontend/             # SvelteKit application
├── bdd/                  # Gherkin feature files for BDD tests
├── docs/                 # Project documentation
├── docker-compose.yml    # Docker services configuration
└── scripts/              # Automation scripts
```

## Development Approach

- **Monorepo**: Using pnpm workspaces
- **Type Safety**: TypeScript everywhere (backend + frontend)
- **Testing**: Unit tests + E2E tests with BDD approach
- **Containerization**: Docker for MongoDB and production deployment
- **Real-Time**: Socket.io for WebSocket communication
