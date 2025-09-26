import db from "./db";

export type Sub = { id:number; email:string; url:string; last_hash:string|null; last_text:string|null };

export const addSub = (email:string, url:string) => {
  const stmt = db.prepare("INSERT INTO subscriptions (email, url) VALUES (?, ?)");
  stmt.run(email, url);
};

export const allSubs = (): Sub[] => db.prepare("SELECT * FROM subscriptions").all() as Sub[];

export const updateHash = (id:number, hash:string) => {
  db.prepare("UPDATE subscriptions SET last_hash = ? WHERE id = ?").run(hash, id);
};

export const updateHashAndText = (id:number, hash:string, text:string) => {
  db.prepare("UPDATE subscriptions SET last_hash = ?, last_text = ? WHERE id = ?")
    .run(hash, text, id);
};

