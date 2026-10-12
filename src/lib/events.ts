import "server-only";
import { read } from "./db";
import type { EventRecord } from "./types";

export function todayBeirut() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Beirut" }).format(new Date());
}

export async function publicEvents() {
  const db = await read();
  return db.events
    .filter((e) => e.status === "confirmed" && e.consentPublish)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
}

export async function upcomingEvents(limit: number) {
  const today = todayBeirut();
  return (await publicEvents()).filter((e) => e.date >= today).slice(0, limit);
}

export async function eventBySlug(slug: string): Promise<EventRecord | undefined> {
  return (await publicEvents()).find((e) => e.slug === slug);
}

export interface EventFilters {
  month?: string; // YYYY-MM
  category?: string;
  audience?: string;
  past?: boolean;
}

export function applyFilters<T extends Pick<EventRecord, "date" | "category" | "audience">>(events: T[], f: EventFilters) {
  const today = todayBeirut();
  return events.filter(
    (e) =>
      (!f.month || e.date.startsWith(f.month)) &&
      (!f.category || e.category === f.category) &&
      (!f.audience || e.audience === f.audience) &&
      (f.past || f.month || e.date >= today),
  );
}

/** Drop private organizer contact before anything leaves the server for a public page. */
export function toPublic(e: EventRecord) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contactEmail, contactPhone, consentContact, expectedAttendance, ...rest } = e;
  return rest;
}
export type PublicEvent = ReturnType<typeof toPublic>;
