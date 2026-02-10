import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('./locales/en.json'));
register('ru', () => import('./locales/ru.json'));
register('es', () => import('./locales/es.json'));
register('is', () => import('./locales/is.json'));
register('eo', () => import('./locales/eo.json'));

// Get initial locale from localStorage or browser
const savedLocale = typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : null;
const browserLocale = getLocaleFromNavigator();
// Normalize locale (e.g., "en-US" -> "en")
const normalizedBrowserLocale = browserLocale?.split('-')[0];

init({
    fallbackLocale: 'en',
    initialLocale: savedLocale || normalizedBrowserLocale || 'en',
});
