import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Admin access for the MCCD Saida team. Accounts come from ADMIN_USERS,
 * a comma-separated list of name:password pairs, e.g. "rana:long-pass,omar:other-pass".
 * In development only, a default account (admin / saida2027) is available when ADMIN_USERS is unset.
 */
const COOKIE = "mccd_admin";
const MAX_AGE = 60 * 60 * 8;

function accounts(): Map<string, string> {
  const raw = process.env.ADMIN_USERS ?? (process.env.NODE_ENV === "production" ? "" : "admin:saida2027");
  const map = new Map<string, string>();
  for (const pair of raw.split(",")) {
    const i = pair.indexOf(":");
    if (i > 0) map.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
  return map;
}

export function adminConfigured() {
  return accounts().size > 0;
}

function secret() {
  return process.env.ADMIN_SECRET || [...accounts().entries()].flat().join("|") || "unset";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function checkCredentials(user: string, password: string) {
  const expected = accounts().get(user);
  return !!expected && safeEqual(expected, password);
}

export async function startSession(user: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${Buffer.from(user).toString("base64url")}.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in team member's name, or null. */
export async function currentAdmin(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [userB64, exp, sig] = raw.split(".");
  if (!userB64 || !exp || !sig) return null;
  const payload = `${userB64}.${exp}`;
  if (!safeEqual(sign(payload), sig) || Number(exp) < Date.now() / 1000) return null;
  const user = Buffer.from(userB64, "base64url").toString();
  return accounts().has(user) ? user : null;
}
