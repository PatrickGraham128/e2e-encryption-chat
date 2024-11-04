// src/stores/socket.js
import { get, writable } from 'svelte/store';
import { tokenStore } from './token';
import { connect, io, Socket } from 'socket.io-client';

export const socketStore: any = writable(null);
export const messageStore: any = writable({});

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

  socket.on('recvMessage', (user, message) => {
    console.log("recieved")
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
