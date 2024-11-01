import express from "express"
import type {Request, Response} from "express"
import { Database } from "sqlite"
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 } from 'uuid';

const db: Database = await open({
  filename: './database.db',
  driver: sqlite3.Database,
});
const app = express()

app.post('/auth/register', async (req: Request, res: Response) => {
  const username = req.body.username;
  const email = req.body.email;  
  const password = req.body.password;
  const token = v4();
  const expiry = Date.now() + 900000; // expiry time, 15 minutes from now

  /** use prepared statements, this will protect against SQLi attacks */
  db.get("SELECT 1 FROM USERS WHERE email = ?", email, (err: any, row: any) => {
    if (err) {
      res.status(500);
      res.send("Unexpected server error");
    }
    else if (!row) {
      res.status(409);
      res.send("Account already exists");
    }
  });

  db.run("INSERT INTO USERS (username, email, password) VALUES (?,?,?,?,?)", username, email, password, token, expiry);
  res.send({token: token});
})

app.post('/auth/login', async (req: Request, res: Response) => {

})

app.post('/message', async (req: Request, res: Response) => {
  
})