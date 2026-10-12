import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { UPLOAD_DIR } from "./db";

export const MAX_UPLOAD = 5 * 1024 * 1024;
export const UPLOAD_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

function sniff(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (buf.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  return null;
}

/** Saves an uploaded file under a random name after checking its real type. Returns the stored name or an error. */
export async function saveUpload(file: File): Promise<{ name: string } | { error: "file" }> {
  if (file.size > MAX_UPLOAD) return { error: "file" };
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type) return { error: "file" };
  const name = crypto.randomUUID() + UPLOAD_TYPES[type];
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return { name };
}

export function uploadPath(name: string) {
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/.test(name)) return null;
  return path.join(UPLOAD_DIR, name);
}

export function uploadType(name: string) {
  const ext = path.extname(name);
  return Object.entries(UPLOAD_TYPES).find(([, e]) => e === ext)?.[0] ?? "application/octet-stream";
}
