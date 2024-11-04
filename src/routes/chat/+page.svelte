<script lang="ts">
  import { onMount } from 'svelte';
  import socketStore from '../../socket';
  import { messageStore } from '../../socket';

  let socket: any;
  socketStore.subscribe((sock: any) => {socket = sock})

  let message = $state('');

  /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();
  const user: string = data.username as string;

  let messages: any = $state([]);
  const unsubscribe = messageStore.subscribe((msgs: any) => {
    messages = msgs[user] || []; // Update messages reactively
  });

  let publicKey: any;
  const params = new URLSearchParams({ user: user });

  const importPublicKey = (pem: any) => {
    /** need to clean up key in order to use window.atob */
    console.log(pem)
    pem = pem
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\s+/g, '');
    const binaryDerString = window.atob(pem);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    return window.crypto.subtle.importKey(
      "spki",
      binaryDer.buffer,
      {
        name: "RSA-OAEP",
        hash: { name: "SHA-256" },
      },
      true,
      ["encrypt"]
  );
  }

  onMount(async () => {
    fetch((`http://localhost:3000/publickey?${params.toString()}`), {
    method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json())
    .then(data => importPublicKey(data.key))
    .then(key => {
      publicKey = key
    })
  })

  const sendMessage = async (e: any) => {
    e.preventDefault()

    if (!publicKey) {
      console.error("Public key is not available");
      return;
    }

    // Encrypt the message using the public key
    const encodedMessage = new TextEncoder().encode(message);
    const encryptedMessage = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      encodedMessage
    );

    // Convert ArrayBuffer to Base64 string for transmission
    const buffer = new Uint8Array(encryptedMessage);
    const base64Message = btoa(String.fromCharCode(...buffer));

    const newMsg = {content: message, position: 'chat-end', color: 'chat-bubble-primary'}
    messageStore.update((msgs: any) => {
      console.log("fontend " + user)
      if (!msgs[user]) {
        msgs[user] = [];
      }
      msgs[user] = [...msgs[user], newMsg];
      console.log(msgs)
      return msgs;
    })
    socket.emit("recvMessage", user, base64Message);
    message = '';
  }
</script>

<div class="artboard phone-1 board bg-base-200">
  <b>{user}</b>
  <div class="msg-container">
    {#each messages as m}
      <div class="chat {m.position}">
        <div class="chat-bubble {m.color}">{m.content}</div>
      </div>
    {/each}
  </div>
  <form onsubmit={sendMessage}>
    <input bind:value={message} type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs"/>
  </form>
</div>

<style>
  .board {
    margin-left: auto;
    margin-right: auto;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    border-radius: 30px;
    padding: 15px;
    margin-top: 40px;
    text-align: center;
  }

  .msg-container {
    height: 420px;
    max-height: 420px;
    overflow-y: scroll;
  }
</style>