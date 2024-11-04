<script lang="ts">
  import { onMount } from 'svelte';
  import socketStore from '../../socket';
  import { messageStore } from '../../socket';
  import NodeRSA from 'node-rsa';

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

  let publicKey: string;
  const params = new URLSearchParams({ user: user });

  onMount(() => {
    fetch((`http://localhost:3000/publickey?${params.toString()}`), {
    method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json()).then(data => {
      publicKey = new NodeRSA(data.key);
    })
  })

  const sendMessage = (e: any) => {
    e.preventDefault()

    let encryptedMessage = publicKey.encrypt(message, 'base64');
    console.log(encryptedMessage)

    const newMsg = {content: encryptedMessage, position: 'chat-end', color: 'chat-bubble-primary'}
    messageStore.update((msgs: any) => {
      console.log("fontend " + user)
      if (!msgs[user]) {
        msgs[user] = [];
      }
      msgs[user] = [...msgs[user], newMsg];
      console.log(msgs)
      return msgs;
    })
    socket.emit("recvMessage", user, message);
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