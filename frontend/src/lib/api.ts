import { get } from 'svelte/store';
import { authStore } from './stores/auth';

const BASE_URL = 'http://localhost:3000';

export async function api(
    method: string,
    path: string,
    data?: any,
    token?: string | null
): Promise<any> {
    const store = get(authStore);
    const jwt = token || store.token;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || res.statusText);
    }

    return res.json();
}
