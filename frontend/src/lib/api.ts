import { get } from 'svelte/store';
import { authStore } from './stores/auth';

const BASE_URL = 'http://localhost:3000';

/**
 * Makes an authenticated API request.
 * @param method The HTTP method (GET, POST, etc.)
 * @param path The API endpoint path (e.g., '/auth/login')
 * @param data Optional request body data
 * @param token Optional override token
 * @returns The response data of type T
 * @throws Error with message from server if request fails
 */
export const api = async <T>(
    method: string,
    path: string,
    data?: unknown,
    token?: string | null
): Promise<T> => {
    const store = get(authStore);
    const jwt = token || store.token;

    const headers: HeadersInit = {};
    if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || res.statusText);
    }

    return res.json();
}
