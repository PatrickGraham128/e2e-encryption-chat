/** initialises the database */

import { Database } from "sqlite"
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db: Database = await open({
  filename: './database.db',
  driver: sqlite3.Database,
});

try {
  db.run("DROP TABLE IF EXISTS USERS");
  db.run("CREATE TABLE IF NOT EXISTS USERS (username TEXT, email TEXT, password TEXT, token TEXT, pk TEXT)");
  console.log("Database successfully initialised")
} catch (e) {
  console.log(e)
}

db.close()