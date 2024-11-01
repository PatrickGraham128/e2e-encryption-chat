import { Server } from "socket.io"
import { Database } from "sqlite"

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  recvMessage: (msg: String) => void;
}

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>({cors: {
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}});

io.on("connection", (socket) => {
  console.log("Socket running")
  socket.on("recvMessage", (msg: String) => {
    console.log(msg)
  })
})

const buildMsg = (name, content) => {
  return {
    name: name,
    content: content
  }
}

io.listen(3000);
