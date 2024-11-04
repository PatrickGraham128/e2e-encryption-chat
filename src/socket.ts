// src/stores/socket.js
import { get, writable } from 'svelte/store';
import { tokenStore } from './token';
import { connect, io, Socket } from 'socket.io-client';

export const socketStore: any = writable(null);
export const messageStore: any = writable({});

const pemToArrayBuffer = (pem: any) => {
  console.log(pem)
  const cleanPem = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, ''); // Remove all whitespace

  const binaryDerString = window.atob(cleanPem);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
  }
  return binaryDer.buffer;
}

const importPrivateKey = async (pem: any) => {
  const privateKeyBuffer = pemToArrayBuffer(pem);
  console.log(pem)
  return window.crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: { name: "SHA-256" },
    },
    true,
    ["decrypt"]
  );
}

const decryptMessage = async (encryptedBase64: any, privateKeyPem: any) => {
  // Decode the Base64-encoded encrypted message
  const encryptedBuffer = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0)).buffer;

  // Import the private key
  let privateKey: any;
  try{
    privateKey = await importPrivateKey(privateKeyPem);
  } catch (e) {
    alert(e)
  }

  // Decrypt the message
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedBuffer
  );

  // Convert the decrypted buffer back to a string
  const decryptedArray = new Uint8Array(decryptedBuffer);
  const decryptedMessage = new TextDecoder().decode(decryptedArray);
  return decryptedMessage;
}


export const connectSocket = () => {
  const socket: Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > = io("http://127.0.0.1:3000", {auth: {token: sessionStorage.getItem("cookie")}});

  const publicKeys: any = {}
  
  socket.on('connect', () => {
    console.log('Socket.IO connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  socket.on('recvMessage', async (user, message) => {
    console.log("recieved")
    message = await decryptMessage(message, sessionStorage.getItem("privateKey"))
    const newMsg = {content: message, position: "chat-start", color: ""};

    messageStore.update((msgs: any) => {
      console.log("backend " + user)
      if (!msgs[user]) {
        msgs[user] = [];
      }
      msgs[user] = [...msgs[user], newMsg];
      console.log(msgs)
      return msgs;
    })
  });

  socketStore.set(socket);
};

export default socketStore;
