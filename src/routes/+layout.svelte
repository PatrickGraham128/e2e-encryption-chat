
<script>
  import "tailwindcss/tailwind.css";
  import { onMount } from "svelte";
  import { tokenStore } from "../token"
  import { connectSocket } from "../socket";

  onMount(() => {
    /** connect to socket when token is recieved */
    tokenStore.subscribe((token) => {
      if (token) {
        connectSocket()
      }
    })
})

</script>

<slot />

