<script lang="ts">
  import { api } from '$lib/api';
  import { login } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let username = '';
  let email = '';
  let password = '';
  let error = '';

  async function handleSubmit() {
    try {
      await api('POST', '/auth/register', { username, email, password });
      // After registration, auto login or redirect to login?
      // Let's auto login for UX.
      const res = await api('POST', '/auth/login', { username, password });
      login(res.access_token, res.user);
      goto('/');
    } catch (e: any) {
      error = e.message;
    }
  }
</script>

<h1>Register</h1>

<form on:submit|preventDefault={handleSubmit}>
  {#if error}
    <p class="error">{error}</p>
  {/if}

  <label for="username">
    Username
    <input id="username" type="text" bind:value={username} required />
  </label>

  <label for="email">
    Email
    <input id="email" type="email" bind:value={email} required />
  </label>

  <label for="password">
    Password
    <input id="password" type="password" bind:value={password} required />
  </label>

  <button type="submit">Register</button>
  <p>Already have an account? <a href="/login">Login</a></p>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    max-width: 300px;
    margin: 2rem auto;
    gap: 1rem;
  }
  label {
    display: flex;
    flex-direction: column;
  }
  input {
    padding: 0.5rem;
    margin-top: 0.25rem;
  }
  button {
    padding: 0.5rem;
    background: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }
  .error {
    color: red;
  }
</style>
