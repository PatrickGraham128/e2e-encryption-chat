/** events for websocket */

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  recvMessage: (socketId: string, msg: string) => void;
}

interface ClientToServerEvents {
  recvMessage: (targetUser: string, msg: string) => void;
  clientPublicKey: ( user: string, publicKeyPem: any ) => void;
}