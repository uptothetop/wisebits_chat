---
name: WebSocket Real-Time Communication
description: Patterns for implementing real-time messaging with Socket.io in Wisebits Chat
---

# WebSocket Real-Time Communication Skill

## Overview

This skill covers implementing real-time bidirectional communication using Socket.io in both the NestJS backend (gateway) and SvelteKit frontend (client).

## Backend: NestJS WebSocket Gateway

### Gateway Structure

**chat/chat.gateway.ts:**
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // Extract user from token
    try {
      const token = client.handshake.auth.token;
      const user = await this.validateToken(token);
      client.data.user = user;
      
      // Join user to their personal room
      client.join(`user:${user.id}`);
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const user = client.data.user;
    
    // Save message to database
    const message = await this.chatService.createMessage({
      conversationId: data.conversationId,
      senderId: user.id,
      content: data.content,
    });

    // Get conversation participants
    const conversation = await this.chatService.getConversation(
      data.conversationId,
    );

    // Emit to all participants
    conversation.participants.forEach((participantId) => {
      this.server.to(`user:${participantId}`).emit('newMessage', message);
    });

    return { success: true, message };
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation:${data.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation:${data.conversationId}`);
    return { success: true };
  }

  // Helper method to emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Helper method to emit to conversation
  emitToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conversation:${conversationId}`).emit(event, data);
  }
}
```

### WebSocket JWT Guard

**auth/guards/ws-jwt.guard.ts:**
```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const token = client.handshake.auth.token;

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      return true;
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  }
}
```

### Register Gateway in Module

**chat/chat.module.ts:**
```typescript
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // For JWT validation
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway],
})
export class ChatModule {}
```

## Frontend: Socket.io Client

### WebSocket Client Setup

**lib/socket.ts:**
```typescript
import { io, Socket } from 'socket.io-client';
import { authToken } from './stores';
import { get } from 'svelte/store';

const SOCKET_URL = 'http://localhost:3000';

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = get(authToken);
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Re-attach all listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket!.on(event, callback);
      });
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any, callback?: (response: any) => void) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, connecting...');
      this.connect();
    }
    
    if (callback) {
      this.socket!.emit(event, data, callback);
    } else {
      this.socket!.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  offAll(event: string) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socket = new SocketClient();
```

### Using Socket in Components

**routes/chat/+page.svelte:**
```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { socket } from '$lib/socket';
  import { messages } from '$lib/stores';

  let currentConversationId: string;

  function handleNewMessage(message: any) {
    messages.update((msgs) => [...msgs, message]);
  }

  function sendMessage(content: string) {
    socket.emit('sendMessage', {
      conversationId: currentConversationId,
      content,
    }, (response) => {
      if (response.success) {
        console.log('Message sent successfully');
      }
    });
  }

  onMount(() => {
    // Connect socket
    socket.connect();

    // Listen for new messages
    socket.on('newMessage', handleNewMessage);

    // Join conversation
    if (currentConversationId) {
      socket.emit('joinConversation', {
        conversationId: currentConversationId,
      });
    }
  });

  onDestroy(() => {
    // Clean up listeners
    socket.off('newMessage', handleNewMessage);

    // Leave conversation
    if (currentConversationId) {
      socket.emit('leaveConversation', {
        conversationId: currentConversationId,
      });
    }

    // Disconnect socket (optional - keep connected for real-time updates)
    // socket.disconnect();
  });
</script>

<div class="chat">
  <div class="messages">
    {#each $messages as message}
      <div class="message">{message.content}</div>
    {/each}
  </div>

  <input
    type="text"
    on:keydown={(e) => {
      if (e.key === 'Enter') {
        sendMessage(e.currentTarget.value);
        e.currentTarget.value = '';
      }
    }}
  />
</div>
```

### Reactive Store Integration

**lib/stores.ts (enhanced):**
```typescript
import { writable } from 'svelte/store';
import { socket } from './socket';

export const messages = writable<Message[]>([]);

// Auto-sync messages from socket
socket.on('newMessage', (message) => {
  messages.update((msgs) => [...msgs, message]);
});

socket.on('messageDeleted', (messageId) => {
  messages.update((msgs) => msgs.filter((m) => m.id !== messageId));
});
```

## Real-Time Patterns

### Broadcasting to All Users

```typescript
// Backend
this.server.emit('userJoined', { username: 'Alice' });
```

### Emitting to Specific Room

```typescript
// Backend
this.server.to('conversation:123').emit('newMessage', message);
```

### Emitting to All Except Sender

```typescript
// Backend
@SubscribeMessage('typing')
handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
  client.to(`conversation:${data.conversationId}`).emit('userTyping', {
    userId: client.data.user.id,
  });
}
```

### Request-Response Pattern

```typescript
// Frontend
socket.emit('getOnlineUsers', {}, (response) => {
  console.log('Online users:', response.users);
});

// Backend
@SubscribeMessage('getOnlineUsers')
handleGetOnlineUsers() {
  return { users: this.getOnlineUsersList() };
}
```

## Connection Management

### Reconnection Handling (Frontend)

```typescript
socket.on('connect', () => {
  console.log('Connected to server');
  // Re-join rooms
  if (currentConversationId) {
    socket.emit('joinConversation', { conversationId: currentConversationId });
  }
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Server forcefully disconnected, try to reconnect
    socket.connect();
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
});
```

### Heartbeat/Ping-Pong

```typescript
// Backend (automatic in Socket.io, but can customize)
@WebSocketGateway({
  pingInterval: 10000,  // 10 seconds
  pingTimeout: 5000,    // 5 seconds
})
```

## Best Practices

1. **Authentication**: Always validate JWT tokens in WebSocket connections
2. **Rooms**: Use rooms for targeted message broadcasting
3. **Error Handling**: Handle connection errors gracefully
4. **Reconnection**: Implement automatic reconnection with exponential backoff
5. **Memory Leaks**: Always remove event listeners on component destroy
6. **Type Safety**: Define TypeScript interfaces for events
7. **Testing**: Mock Socket.io in tests
8. **Logging**: Log connection/disconnection events
9. **Rate Limiting**: Prevent message spam with throttling
10. **Acknowledgments**: Use callbacks for critical operations
