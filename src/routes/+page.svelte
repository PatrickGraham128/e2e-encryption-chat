<script lang="ts">
  import { sha256 } from "js-sha256";
  import { goto } from "$app/navigation"
  import { tokenStore } from "../token";
  import socketStore from "../socket";

  let email: string;
  let password: string;

  const login = (email: string, password: string) => {
    /** Hash on frontend to prevent transit of plain text */
    password = sha256(password);

    fetch("http://localhost:3000/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password}),
      headers: {"Content-Type": "application/json"}
    }).then( res => {
      if (!res.ok) {
        alert("HTTP status " + res.status);
      }
      return res.json()
    }).then( data => {
      /** set user's cookie */
      sessionStorage.setItem("cookie", data.token)
      sessionStorage.setItem("user", data.user)
      tokenStore.set(true)

      goto("/chats")
  })}
</script>

<div class="artboard phone-1 board bg-base-200" style="margin-left: auto; margin-right: auto; display: flex; flex-direction: column; gap: 15px;">
  <input bind:value={email} type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
  <input bind:value={password} type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
  <button on:click={() => {login (email, password)}} class="btn btn-neutral" aria-label="login">Login</button>
  <button on:click={() => {goto("/register")}} class="btn btn-neutral" aria-label="login">Register</button>
</div>

<style>
  .board {
    margin-left: auto;
    margin-right: auto; 
    display: flex; 
    flex-direction: column;
    gap: 15px;
    border-radius: 30px;
    padding: 15px;
    padding-top: 30px;
    margin-top: 40px;
  }
</style>