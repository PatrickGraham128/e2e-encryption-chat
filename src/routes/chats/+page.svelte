<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import socketStore from '../../socket';
  import forge from 'node-forge';

  let users: any;
  let newChatUser: any;
  let socket: any;
  socketStore.subscribe((sock: any) => {socket = sock})

  onMount(() => {
    /** generate public and private keys */
    const myKeyPair = forge.pki.rsa.generateKeyPair(2048);
    const myPublicKeyPem = forge.pki.publicKeyToPem(myKeyPair.publicKey);

    /** need PKCS 8 to use web crypto API*/
    var rsaPrivateKey = forge.pki.privateKeyToAsn1(myKeyPair.privateKey);

    // wrap an RSAPrivateKey ASN.1 object in a PKCS#8 ASN.1 PrivateKeyInfo
    var privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);

    // convert a PKCS#8 ASN.1 PrivateKeyInfo to PEM
    var myPrivateKeyPem = forge.pki.privateKeyInfoToPem(privateKeyInfo);
    sessionStorage.setItem("publicKey", myPublicKeyPem)
    sessionStorage.setItem("privateKey", myPrivateKeyPem)

    fetch("http://localhost:3000/publickey", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: myPublicKeyPem, user: sessionStorage.getItem("user") })
    })

    fetch("http://localhost:3000/users").then(res => {
      if (!res.ok) {
        alert("HTTP status " + res.status);
      }
      return res.json()
    }).then( data => {
      users = data.users
      console.log(users)
    })
  })

  const openChat = (user: string) => {
    goto(`/chat?user=${encodeURIComponent(user)}`)
  }
</script>

<div class="artboard phone-1 bg-base-200 board">
  <div class="container">
    Messages
    {#each users as u}
        <button class="btn user bg-base-300" on:click={() => openChat(u)}>
          <div class="avatar" style="height: 40px; width: 40px">
            <div class="w-24 rounded">
              <!-- svelte-ignore a11y_img_redundant_alt -->
              <img src="pfp.jpg" alt="profile picture" />
            </div>
          </div>
          <span class="username">{u}</span>
        </button>
    {/each}
  </div>
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
    padding-top: 30px;
    font-weight: bold;
    margin-top: 40px;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .user {
    height: 80px;
    justify-content: left;
  }

  .username {
    height: 50px;
    line-height: 50px;
  }

  .new-msg {
    width: 100px;
  }
</style>