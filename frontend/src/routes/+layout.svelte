<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { authStore, logout } from "$lib/stores/auth";
	import { goto } from "$app/navigation";
	import "../app.css";
	import "../lib/i18n"; // Initialize i18n
	import { isLoading, locale } from "svelte-i18n";

	let isLocaleLoaded = $state(false);

	$effect(() => {
		if (!$isLoading) {
			isLocaleLoaded = true;
		}
	});

	let { children } = $props();

	const languages = [
		{ code: "en", label: "🇺🇸 EN" },
		{ code: "ru", label: "🇷🇺 RU" },
		{ code: "es", label: "🇪🇸 ES" },
		{ code: "is", label: "🌐 IS" },
		{ code: "eo", label: "💚 EO" },
	];

	// Initialize locale from localStorage on client side
	$effect(() => {
		if (typeof window !== "undefined" && !$locale) {
			const saved = localStorage.getItem("locale");
			if (saved) {
				locale.set(saved);
			}
		}
	});

	function handleLogout() {
		logout();
		goto("/login");
	}

	function switchLanguage(lang: string) {
		locale.set(lang);
		localStorage.setItem("locale", lang);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout">
	<nav>
		<div class="container nav-content">
			<div class="brand">Chat App</div>
			<div class="links">
				{#if isLocaleLoaded}
					<div class="language-select-wrapper">
						<select
							bind:value={$locale}
							onchange={(e: Event) =>
								switchLanguage(
									(e.target as HTMLSelectElement).value,
								)}
							class="lang-select"
						>
							{#each languages as lang}
								<option value={lang.code}>{lang.label}</option>
							{/each}
						</select>
					</div>

					{#if $authStore.isAuthenticated}
						<span class="welcome"
							>Hi, {$authStore.user?.username}</span
						>
						<button class="btn-logout" onclick={handleLogout}
							>Logout</button
						>
					{:else}
						<a href="/login" class="nav-link">Login</a>
						<a href="/register" class="nav-link">Register</a>
					{/if}
				{/if}
			</div>
		</div>
	</nav>

	<main class="container">
		{#if isLocaleLoaded}
			{@render children()}
		{:else}
			<div class="loading">Loading...</div>
		{/if}
	</main>
</div>

<style>
	.layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	nav {
		background: var(--surface-color);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		width: 100%;
	}

	.nav-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 64px;
	}

	.brand {
		font-weight: 700;
		font-size: 1.25rem;
		color: var(--primary);
	}

	.links {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.language-select-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.lang-select {
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		border: 1px solid var(--border-color);
		background-color: transparent;
		font-size: 0.9rem;
		cursor: pointer;
		outline: none;
		transition: all 0.2s;
		color: var(--text-main);
	}

	.lang-select:hover {
		background-color: var(--bg-color);
		border-color: var(--primary);
	}

	.nav-link {
		font-weight: 500;
		color: var(--text-secondary);
		transition: color 0.2s;
	}

	.nav-link:hover {
		color: var(--text-main);
		text-decoration: none;
	}

	.welcome {
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.btn-logout {
		padding: 0.5rem 1rem;
		border: 1px solid var(--border-color);
		background: transparent;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary);
		transition: all 0.2s;
	}

	.btn-logout:hover {
		background: var(--bg-color);
		color: var(--text-main);
	}

	main {
		flex: 1;
		padding-top: 2rem;
		padding-bottom: 2rem;
	}
</style>
