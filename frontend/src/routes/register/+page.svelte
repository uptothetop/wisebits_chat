<script lang="ts">
  import { api } from "$lib/api";
  import { login } from "$lib/stores/auth";
  import { goto } from "$app/navigation";

  let username = "";
  let email = "";
  let password = "";
  let error = "";

  async function handleSubmit() {
    try {
      await api("POST", "/auth/register", { username, email, password });
      const res = await api("POST", "/auth/login", { username, password });
      login(res.access_token, res.user);
      goto("/");
    } catch (e: any) {
      error = e.message;
    }
  }
</script>

<div class="page-container">
  <div class="card">
    <h1>Create Account</h1>
    <p class="subtitle">Join and start chatting</p>

    <form on:submit|preventDefault={handleSubmit}>
      {#if error}
        <div class="error-alert">{error}</div>
      {/if}

      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          type="text"
          bind:value={username}
          required
          placeholder="Choose a username"
        />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          placeholder="Enter your email"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          placeholder="Create a password"
        />
      </div>

      <button type="submit" class="btn-primary">Sign Up</button>

      <div class="footer">
        <p>Already have an account? <a href="/login">Sign in</a></p>
      </div>
    </form>
  </div>
</div>

<style>
  .page-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 200px);
  }

  .card {
    background: var(--surface-color);
    padding: 2.5rem;
    border-radius: 1rem;
    box-shadow: var(--shadow-md);
    width: 100%;
    max-width: 400px;
    border: 1px solid var(--border-color);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--text-main);
    text-align: center;
  }

  .subtitle {
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 2rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-main);
  }

  input {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
    outline: none;
  }

  input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .btn-primary {
    padding: 0.75rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 0.5rem;
  }

  .btn-primary:hover {
    background: var(--primary-hover);
  }

  .error-alert {
    background: #fef2f2;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    border: 1px solid #fee2e2;
  }

  .footer {
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
</style>
