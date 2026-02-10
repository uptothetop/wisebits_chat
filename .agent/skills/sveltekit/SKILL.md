---
name: SvelteKit Frontend Development
description: Patterns and best practices for developing SvelteKit frontend features in Wisebits Chat
---

# SvelteKit Frontend Development Skill

## Overview

This skill provides guidance for developing frontend features using SvelteKit and Svelte in the Wisebits Chat project. SvelteKit is a full-stack web framework that compiles to highly optimized vanilla JavaScript.

## Project Structure

```
frontend/src/
├── routes/                    # SvelteKit file-based routing
│   ├── +page.svelte          # Home/login page (/)
│   ├── chat/
│   │   └── +page.svelte      # Chat page (/chat)
│   └── +layout.svelte        # Root layout
├── lib/
│   ├── components/           # Reusable Svelte components
│   │   ├── StoriesBar.svelte
│   │   ├── MessageList.svelte
│   │   └── ConversationList.svelte
│   ├── stores.ts             # Svelte stores for state
│   ├── api.ts                # API client wrapper
│   └── socket.ts             # WebSocket client
└── app.css                   # Global styles
```

## Creating Components

### Basic Component Structure

**components/Button.svelte:**
```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let variant: 'primary' | 'secondary' = 'primary';
  export let disabled = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('click');
  }
</script>

<button
  class="btn btn-{variant}"
  {disabled}
  on:click={handleClick}
  data-testid="button"
>
  <slot />
</button>

<style>
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
  }

  .btn-primary {
    background-color: #007bff;
    color: white;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
```

### Component with Props and Events

**components/MessageInput.svelte:**
```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let placeholder = 'Type a message...';
  export let maxLength = 1000;

  let message = '';
  const dispatch = createEventDispatcher<{ send: string }>();

  function handleSubmit() {
    const trimmed = message.trim();
    if (trimmed) {
      dispatch('send', trimmed);
      message = '';
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

<div class="message-input">
  <input
    type="text"
    bind:value={message}
    {placeholder}
    maxlength={maxLength}
    on:keydown={handleKeydown}
    data-testid="message-input"
  />
  <button on:click={handleSubmit} disabled={!message.trim()}>
    Send
  </button>
</div>

<style>
  .message-input {
    display: flex;
    gap: 0.5rem;
  }

  input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
```

## Svelte Stores for State Management

### Define Stores

**lib/stores.ts:**
```typescript
import { writable, derived } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';

// Auth store
export interface User {
  id: string;
  username: string;
  email: string;
}

export const authToken: Writable<string | null> = writable(
  localStorage.getItem('token')
);
export const currentUser: Writable<User | null> = writable(null);

// Derived store: is user authenticated?
export const isAuthenticated: Readable<boolean> = derived(
  authToken,
  ($authToken) => !!$authToken
);

// Messages store
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

export const messages: Writable<Message[]> = writable([]);

// Conversations store
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
}

export const conversations: Writable<Conversation[]> = writable([]);

// Helper functions
authToken.subscribe((token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
});
```

### Use Stores in Components

```svelte
<script lang="ts">
  import { authToken, currentUser, isAuthenticated } from '$lib/stores';
  import { onMount } from 'svelte';

  // Subscribe to store (auto-unsubscribes on component destroy)
  $: user = $currentUser;
  $: authenticated = $isAuthenticated;

  // Update store
  function logout() {
    authToken.set(null);
    currentUser.set(null);
  }

  // Use store in lifecycle
  onMount(() => {
    if ($authToken) {
      // Fetch user data
    }
  });
</script>

{#if authenticated}
  <p>Welcome, {user?.username}!</p>
  <button on:click={logout}>Logout</button>
{:else}
  <p>Please log in</p>
{/if}
```

## API Client Integration

### Create API Client

**lib/api.ts:**
```typescript
import { authToken } from './stores';
import { get } from 'svelte/store';

const API_BASE = 'http://localhost:3000';

interface ApiError {
  message: string;
  statusCode: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = get(authToken);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: { username: string; email: string; password: string }) =>
      request<{ access_token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  conversations: {
    getAll: () => request<any[]>('/conversations'),
    create: (userId: string) =>
      request<any>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
  },
  messages: {
    getByConversation: (conversationId: string) =>
      request<any[]>(`/messages/${conversationId}`),
    send: (conversationId: string, content: string) =>
      request<any>('/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId, content }),
      }),
  },
};
```

### Use API in Components

```svelte
<script lang="ts">
  import { api } from '$lib/api';
  import { authToken, currentUser } from '$lib/stores';
  import { onMount } from 'svelte';

  let loading = false;
  let error = '';

  async function handleLogin(email: string, password: string) {
    loading = true;
    error = '';

    try {
      const result = await api.auth.login({ email, password });
      authToken.set(result.access_token);
      // Fetch user data...
    } catch (err) {
      error = err instanceof Error ? err.message : 'Login failed';
    } finally {
      loading = false;
    }
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p class="error">{error}</p>
{/if}
```

## SvelteKit Routing

### File-Based Routing

- `routes/+page.svelte` → `/`
- `routes/chat/+page.svelte` → `/chat`
- `routes/profile/[id]/+page.svelte` → `/profile/:id`

### Page Component

**routes/chat/+page.svelte:**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { isAuthenticated } from '$lib/stores';

  // Protect route
  $: if (!$isAuthenticated && typeof window !== 'undefined') {
    goto('/');
  }

  onMount(() => {
    // Fetch data on mount
  });
</script>

<svelte:head>
  <title>Chat - Wisebits</title>
</svelte:head>

<div class="chat-page">
  <h1>Chat</h1>
  <!-- Chat UI -->
</div>
```

### Navigation

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';

  function navigateToChat() {
    goto('/chat');
  }
</script>

<button on:click={navigateToChat}>Go to Chat</button>

<!-- Or use anchor -->
<a href="/chat">Chat</a>
```

## Camera/Media Capture

### MediaRecorder API Example

**components/CameraRecorder.svelte:**
```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let mediaRecorder: MediaRecorder | null = null;
  let recording = false;
  let videoElement: HTMLVideoElement;
  const dispatch = createEventDispatcher<{ recorded: Blob }>();

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      videoElement.srcObject = stream;
      videoElement.play();

      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        dispatch('recorded', blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      recording = true;

      // Auto-stop after 15 seconds
      setTimeout(() => {
        if (recording) stopRecording();
      }, 15000);
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }

  function stopRecording() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      recording = false;
    }
  }
</script>

<div class="camera-recorder">
  <video bind:this={videoElement} autoplay muted></video>
  
  {#if !recording}
    <button on:click={startRecording}>⏺ Record</button>
  {:else}
    <button on:click={stopRecording}>⏹ Stop</button>
  {/if}
</div>

<style>
  video {
    width: 100%;
    max-width: 480px;
    border-radius: 8px;
  }
</style>
```

## Lifecycle Hooks

```svelte
<script lang="ts">
  import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte';

  let timer: number;

  onMount(() => {
    console.log('Component mounted');
    timer = setInterval(() => {
      console.log('Tick');
    }, 1000);

    // Return cleanup function
    return () => {
      console.log('Cleanup from onMount');
    };
  });

  onDestroy(() => {
    console.log('Component destroyed');
    if (timer) clearInterval(timer);
  });

  beforeUpdate(() => {
    console.log('Before update');
  });

  afterUpdate(() => {
    console.log('After update');
  });
</script>
```

## Best Practices

1. **Use TypeScript**: Always type your props and events
2. **Component size**: Keep components small and focused
3. **Reactivity**: Use `$:` for reactive statements
4. **Auto-subscribe**: Use `$store` syntax for stores
5. **Event dispatching**: Use `createEventDispatcher` for component events
6. **Data attributes**: Add `data-testid` for testing
7. **Accessibility**: Use semantic HTML and ARIA attributes
8. **Style scoping**: Component styles are scoped by default
9. **Async loading**: Show loading states for async operations
10. **Error handling**: Always handle and display errors gracefully
