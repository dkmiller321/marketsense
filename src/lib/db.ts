import Database from "better-sqlite3";
import path from "path";
const db = new Database(path.join(process.cwd(), "marketsense.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    url TEXT NOT NULL,
    last_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);
export default db;