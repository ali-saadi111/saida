import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Database } from "./types";
import { seedDatabase } from "./seed";

/**
 * Small JSON-file store. Every write goes through one in-process queue, so a
 * read-check-write (e.g. "is this slot free? then book it") is atomic for a
 * single Node server. For multi-instance or serverless hosting, swap this
 * module for a database with a unique constraint or transaction; the rest of
 * the app only uses read() and transact().
 */
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Database> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as Database;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    const db = seedDatabase();
    await save(db);
    return db;
  }
}

async function save(db: Database) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, DB_FILE);
}

export async function read(): Promise<Database> {
  await queue.catch(() => undefined);
  return load();
}

/** Run fn with exclusive access; whatever fn leaves in db is saved. */
export function transact<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = queue.catch(() => undefined).then(async () => {
    const db = await load();
    const result = await fn(db);
    await save(db);
    return result;
  });
  queue = run;
  return run;
}

export function newId() {
  return crypto.randomUUID();
}

/** Short human-readable booking reference, e.g. SDA-7K3QX. */
export function newRef() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(5);
  return "SDA-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function slugify(input: string) {
  const base = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "event";
}

export function uniqueSlug(base: string, taken: Set<string>) {
  let slug = slugify(base);
  let n = 2;
  const root = slug;
  while (taken.has(slug)) slug = `${root}-${n++}`;
  return slug;
}
