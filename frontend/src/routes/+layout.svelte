<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { authStore, logout } from "$lib/stores/auth";
	import { goto } from "$app/navigation";
	import "../app.css";

	let { children } = $props();

	function handleLogout() {
		logout();
		goto("/login");
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
				{#if $authStore.isAuthenticated}
					<span class="welcome">Hi, {$authStore.user?.username}</span>
					<button class="btn-logout" onclick={handleLogout}
						>Logout</button
					>
				{:else}
					<a href="/login" class="nav-link">Login</a>
					<a href="/register" class="nav-link">Register</a>
				{/if}
			</div>
		</div>
	</nav>

	<main class="container">
		{@render children()}
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
