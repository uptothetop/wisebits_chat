import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('./locales/en.json'));
register('ru', () => import('./locales/ru.json'));
register('es', () => import('./locales/es.json'));
register('is', () => import('./locales/is.json'));
register('eo', () => import('./locales/eo.json'));

init({
    fallbackLocale: 'en',
    initialLocale: getLocaleFromNavigator(),
});
