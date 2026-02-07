<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { authStore, logout } from "$lib/stores/auth";
	import { goto } from "$app/navigation";
	import { onDestroy } from "svelte";

	let { children } = $props();

	function handleLogout() {
		logout();
		goto("/login");
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<div class="brand">Chat App</div>
	<div class="links">
		{#if $authStore.isAuthenticated}
			<span>Welcome, {$authStore.user?.username}</span>
			<button onclick={handleLogout}>Logout</button>
		{:else}
			<a href="/login">Login</a>
			<a href="/register">Register</a>
		{/if}
	</div>
</nav>

<main>
	{@render children()}
</main>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		padding: 1rem;
		background: #eee;
		align-items: center;
	}
	.links {
		display: flex;
		gap: 1rem;
		align-items: center;
	}
	main {
		padding: 1rem;
	}
	button {
		padding: 0.5rem;
		cursor: pointer;
	}
</style>
