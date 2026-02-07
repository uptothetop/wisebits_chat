import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
    _id: string;
    username: string;
    email: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

// Check localStorage if in browser
const storedAuth = browser ? localStorage.getItem('auth') : null;
const startState = storedAuth ? JSON.parse(storedAuth) : initialState;

export const authStore = writable<AuthState>(startState);

authStore.subscribe((value) => {
    if (browser) {
        if (value.isAuthenticated) {
            localStorage.setItem('auth', JSON.stringify(value));
        } else {
            localStorage.removeItem('auth');
        }
    }
});

export const login = (token: string, user: User) => {
    authStore.set({ token, user, isAuthenticated: true });
};

export const logout = () => {
    authStore.set(initialState);
};
