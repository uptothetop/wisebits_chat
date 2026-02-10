import { writable, get } from 'svelte/store';
import { api } from '$lib/api';
import { socketStore } from './socket';
import type { Conversation, Message, User } from '$lib/types';

export const conversations = writable<Conversation[]>([]);
export const messages = writable<Message[]>([]);
export const activeConversation = writable<Conversation | null>(null);

export const loadConversations = async () => {
    const res = await api<Conversation[]>('GET', '/chat/conversations');
    conversations.set(res);
}

export const selectConversation = async (conv: Conversation) => {
    activeConversation.set(conv);
    const res = await api<Message[]>('GET', `/chat/conversations/${conv._id}/messages`);
    messages.set(res);
}

export const sendMessage = async (content: string) => {
    const conv = get(activeConversation);
    const socket = get(socketStore);

    if (!conv || !socket) return;

    // Optimistic update?
    // Or just emit and wait for receiveMessage?
    // Backend emits back to sender. Let's wait.
    // We emit 'sendMessage' with { recipientId, content }

    const recipient = conv.participants.find((p: User) => p._id !== get(activeConversation)?._id);
    // Wait, participants array has ME and THEM.
    // I need to know MY ID.
    // Store logic needs user info.
    // Ideally, I pass recipientId directly.
    // Let's rely on `socket.emit('sendMessage', { recipientId, content })`.

    // Who is the recipient?
    // `conv.participants` is an array of User objects.
    // I need the "other" user. I can filter by `authStore.user._id`.

    // Let's implement this logic in `+page.svelte` where I have access to `$authStore` easily, or import it here.
}
