import express from "express"
import type {Request, Response} from "express"
import { Database } from "sqlite"
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 } from 'uuid';
import cors from 'cors';
import { Server } from "socket.io";
import http from "http";
import { sha256 } from "js-sha256";

const app = express();
const server = http.createServer(app);
const PORT = 3000;

/** create websocket server */
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>(server, {cors: {
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}});

const users: any = []
const publicKeys: any = {}

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  /** authenticate token */
  const row = await db.get("SELECT * FROM USERS WHERE token = ?", [token])
  if (!row) next(new Error("Authentication failed: invalid token"))
  
  users.push({ username: row.username, id: socket.id })

  console.log(socket.id)

  next()
})

io.on("connection", (socket) => {
  console.log("A user has connected to the socket")
  console.log(users)
  const user = users.find((u: any) => u.id === socket.id).username

  socket.on("recvMessage", (targetUser: string, msg: string) => {
    const socketId = users.find((u: any) => u.username === targetUser).id
    console.log("sending to " + socketId)
    socket.to(socketId).emit("recvMessage", user, msg);
  })

  socket.on("disconnect", () => {
    console.log("disconnected")
    users.filter((user: any) => user.id !== socket.id)
  })
})

let db: Database;

try {
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });
  console.log("Database opened successfully");
} catch (error) {
  console.error("Failed to open database:", error);
}

let corsOptions = {
  origin : ['http://localhost:5173'],
}

app.use(cors(corsOptions))
app.use(express.json())

app.post('/auth/register', async (req: Request, res: Response) => {
  const username = req.body.username;
  const email = req.body.email;  
  const password = req.body.password;

  /** use prepared statements, this will protect against SQLi attacks */
  let row = await db.get("SELECT * FROM USERS WHERE email = ?", [email]);
  if (row) res.status(409).send("Email already in use")

  row = await db.get("SELECT * FROM USERS WHERE username = ?", [username]);
  if (row) res.status(409).send("Username already in use")

  const token = v4();
  db.run("INSERT INTO USERS (username, email, password, token) VALUES (?,?,?,?)", 
    username, email, password, token);
  return res.send({token: token});
})

app.post('/auth/login', async (req: Request, res: Response) => {
  const email = req.body.email;  
  const password = req.body.password;

  const row = await db.get("SELECT * FROM USERS WHERE email = ?", [email])
  if (!row) {
    return res.status(404).send("Email does not match registered account");
  } else if (row["password"] !== password) {
    return res.status(403).send("Invalid username or password");
  }

  const token = v4();
  db.run("UPDATE USERS SET token = ? WHERE email = ?", 
    token, email);
  return res.send({token: token, user: row["username"]});
})

app.get('/users', async (req: Request, res: Response) => {
  let rows = await db.all("SELECT (username) FROM USERS")
  rows = rows.map((r) => r.username)
  res.send(JSON.stringify({users: rows}))
})

app.put('/publickey', async (req: Request, res: Response) => {
  const publicKey = req.body.key;
  const user = req.body.user;
  publicKeys[user] = publicKey;
  return res.status(200).send("success");
})

app.get('/publickey', async (req: Request, res: Response) => {
  const user = req.query.user as string;
  res.status(200).send(JSON.stringify({key: publicKeys[user]}))
})

server.listen(PORT, () => {
  console.log("Server listening on PORT", PORT);
});