import { writable, get } from 'svelte/store';
import { api } from '$lib/api';
import { socketStore } from './socket';

export const conversations = writable<any[]>([]);
export const messages = writable<any[]>([]);
export const activeConversation = writable<any | null>(null);

export async function loadConversations() {
    const res = await api('GET', '/chat/conversations');
    conversations.set(res);
}

export async function selectConversation(conv: any) {
    activeConversation.set(conv);
    const res = await api('GET', `/chat/conversations/${conv._id}/messages`);
    messages.set(res);
}

export async function sendMessage(content: string) {
    const conv = get(activeConversation);
    const socket = get(socketStore);

    if (!conv || !socket) return;

    // Optimistic update?
    // Or just emit and wait for receiveMessage?
    // Backend emits back to sender. Let's wait.
    // We emit 'sendMessage' with { recipientId, content }

    const recipient = conv.participants.find((p: any) => p._id !== get(activeConversation)._id);
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
