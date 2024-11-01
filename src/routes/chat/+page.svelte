<script lang="ts">
  import "../app.css";
  import { io, Socket } from "socket.io-client";

  let message = $state('hi');
  let messages: any = $state([]);
  let container: HTMLDivElement;

  interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
  }

  interface ClientToServerEvents {
    recvMessage: (msg: String) => void;
  }

  const socket: Socket<
    ServerToClientEvents,
    ClientToServerEvents
    > = io("http://127.0.0.1:3000");

  const sendMessage = (e: any) => {
    e.preventDefault()
    messages.push({content: message, position: 'chat-end', color: 'chat-bubble-primary'})
    console.log(messages)
    socket.emit("recvMessage", message);
    message = '';
  }
</script>

<div bind:this={container} class="artboard phone-1" style="margin-left: auto; margin-right: auto; display: flex; justify-content: space-between; flex-direction: column;">
  <div>
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
</style>