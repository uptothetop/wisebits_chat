import { io, type Socket } from 'socket.io-client';
import { writable, get } from 'svelte/store';
import { authStore } from './auth';

export const socketStore = writable<Socket | null>(null);

export const initSocket = () => {
    const { token, user } = get(authStore);
    if (!token || !user) return;

    const socket = io('http://localhost:3000', {
        auth: { token },
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socketStore.set(socket);
    return socket;
}

export const disconnectSocket = () => {
    const socket = get(socketStore);
    if (socket) {
        socket.disconnect();
        socketStore.set(null);
    }
}
