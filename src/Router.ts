import express from "express"
import type {Request, Response} from "express"
import { Database } from "sqlite"
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 } from 'uuid';
import cors from 'cors';

const app = express();
const PORT = 3000;

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
  const row = await db.get("SELECT * FROM USERS WHERE email = ?", [email]);
  if (row) return res.status(409).send("Email already in use")

  const token = v4();
  const expiry = Date.now() + 900000; // expiry time, 15 minutes from now
  db.run("INSERT INTO USERS (username, email, password, token, exp) VALUES (?,?,?,?,?)", 
    username, email, password, token, expiry);
  return res.send({token: token});
})

app.post('/auth/login', async (req: Request, res: Response) => {
  const email = req.body.email;  
  const password = req.body.password;

  const row = await db.get("SELECT * FROM USERS WHERE email = ?", [email])
  console.log(row)
  if (!row) {
    return res.status(404).send("Email does not match registered account");
  } else if (row["password"] !== password) {
    return res.status(403).send("Invalid username or password");
  }

  const token = v4();
  const expiry = Date.now() + 900000;
  db.run("UPDATE USERS SET token = ?, exp = ? WHERE email = ?", 
    token, expiry, email);
  res.send({token: token});
})

app.listen(PORT, () => {
  console.log("Server listening on PORT", PORT);
});