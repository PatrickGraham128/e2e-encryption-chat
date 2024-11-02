<script lang="ts">
  import { sha256 } from "js-sha256";
  import { goto } from "$app/navigation"

  let username: string;
  let email: string;
  let password: string;

  const register = (username: string, email: string, password: string) => {
    /** Hash on frontend to prevent transit of plain text */
    password = sha256(password);

    fetch("http://localhost:3000/auth/register", {
      method: "POST",
      body: JSON.stringify({ username: username, email: email, password: password}),
      headers: {"Content-Type": "application/json"}
    }).then( res => {
      if (!res.ok) {
        alert("HTTP status " + res.status);
      }
      return res.json()
    }).then( data => {
      /** set user's cookie */
      sessionStorage.setItem("cookie", data.token)
      goto("/chat")
  })}
</script>

<div class="artboard phone-1 secondary" style="margin-left: auto; margin-right: auto; display: flex; flex-direction: column; gap: 15px;">
  <input bind:value={username} type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
  <input bind:value={email} type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
  <input bind:value={password} type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
  <button on:click={() => {register(username, email, password)}} class="btn btn-neutral" aria-label="login">Register</button>
</div>

<style>
</style>