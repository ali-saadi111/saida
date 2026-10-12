"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkCredentials, currentAdmin, endSession, startSession } from "@/lib/auth";
import { conflictsFor } from "@/lib/booking";
import { NEWS_KINDS } from "@/lib/config";
import { newId, slugify, transact, uniqueSlug } from "@/lib/db";
import type { EventRecord, NewsKindId } from "@/lib/types";
import { beirutOffset } from "@/lib/time";
import { readEventForm, validateEvent, type EventInput, type FieldError } from "@/lib/validate";

async function requireAdmin() {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

export async function login(_: { error?: boolean }, fd: FormData): Promise<{ error?: boolean }> {
  const user = String(fd.get("user") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!checkCredentials(user, password)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: true };
  }
  await startSession(user);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export interface EventEditState {
  errors?: Partial<Record<keyof EventInput, FieldError>>;
  saved?: boolean;
  nonce?: number;
}

export async function saveEvent(_: EventEditState, fd: FormData): Promise<EventEditState> {
  await requireAdmin();
  const id = String(fd.get("id"));
  const v = readEventForm(fd);
  const status = fd.get("status") === "cancelled" ? "cancelled" : "confirmed";
  const errors: EventEditState["errors"] = validateEvent(v, { requireConsent: false });
  if (Object.keys(errors).length) return { errors, nonce: Date.now() };

  const ok = await transact((db) => {
    const e = db.events.find((x) => x.id === id);
    if (!e) return "missing" as const;
    if (status === "confirmed" && conflictsFor(db.events, { date: v.date, start: v.start, end: v.end, venueId: v.venueId }, { ignoreId: id }).length) {
      return "conflict" as const;
    }
    Object.assign(e, {
      title: v.title,
      summary: v.summary,
      description: v.description,
      category: v.category as EventRecord["category"],
      audience: v.audience as EventRecord["audience"],
      language: v.language,
      date: v.date,
      start: v.start,
      end: v.end,
      venueId: v.venueId as EventRecord["venueId"],
      venueOther: v.venueId === "other" ? v.venueOther : undefined,
      organizerName: v.organizerName,
      organization: v.organization || undefined,
      contactEmail: v.contactEmail,
      contactPhone: v.contactPhone,
      expectedAttendance: v.expectedAttendance ? Number(v.expectedAttendance) : undefined,
      accessibility: v.accessibility || undefined,
      cost: v.cost || undefined,
      ticketUrl: v.ticketUrl || undefined,
      website: v.website || undefined,
      consentPublish: v.consentPublish,
      status,
      updatedAt: new Date().toISOString(),
    } satisfies Partial<EventRecord>);
    return "ok" as const;
  });
  if (ok === "missing") redirect("/admin");
  if (ok === "conflict") return { errors: { start: "conflict" }, nonce: Date.now() };
  revalidatePath("/", "layout");
  return { saved: true, nonce: Date.now() };
}

export async function setEventStatus(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const status = fd.get("status") === "cancelled" ? "cancelled" : "confirmed";
  await transact((db) => {
    const e = db.events.find((x) => x.id === id);
    if (!e) return;
    // Reinstating must not create a double booking.
    if (status === "confirmed" && conflictsFor(db.events, e, { ignoreId: id }).length) return;
    e.status = status;
    e.updatedAt = new Date().toISOString();
  });
  revalidatePath("/", "layout");
}

export async function deleteEvent(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  await transact((db) => {
    db.events = db.events.filter((e) => e.id !== id);
  });
  revalidatePath("/", "layout");
  redirect("/admin");
}

export interface NewsEditState {
  errors?: Record<string, "required">;
  nonce?: number;
}

export async function saveNews(_: NewsEditState, fd: FormData): Promise<NewsEditState> {
  const user = await requireAdmin();
  const s = (k: string) => String(fd.get(k) ?? "").trim();
  const id = s("id");
  const fields = { titleEn: s("titleEn"), titleAr: s("titleAr"), excerptEn: s("excerptEn"), excerptAr: s("excerptAr"), bodyEn: s("bodyEn"), bodyAr: s("bodyAr") };
  const errors: Record<string, "required"> = {};
  for (const [k, v] of Object.entries(fields)) if (!v) errors[k] = "required";
  const kind = NEWS_KINDS.some((k) => k.id === s("kind")) ? (s("kind") as NewsKindId) : "announcement";
  // publishAt comes from a datetime-local input in Beirut time
  const local = s("publishAt");
  const publishAt = local ? new Date(`${local}:00${beirutOffset(local.slice(0, 10), local.slice(11, 16))}`) : new Date();
  if (Number.isNaN(publishAt.getTime())) errors.publishAt = "required";
  if (Object.keys(errors).length) return { errors, nonce: Date.now() };

  const now = new Date().toISOString();
  await transact((db) => {
    const data = {
      title: { en: fields.titleEn, ar: fields.titleAr },
      excerpt: { en: fields.excerptEn, ar: fields.excerptAr },
      body: { en: fields.bodyEn, ar: fields.bodyAr },
      kind,
      publishAt: publishAt.toISOString(),
      updatedAt: now,
    };
    const existing = id ? db.news.find((n) => n.id === id) : undefined;
    if (existing) Object.assign(existing, data, { sample: false });
    else
      db.news.push({
        ...data,
        id: newId(),
        slug: uniqueSlug(slugify(fields.titleEn), new Set(db.news.map((n) => n.slug))),
        author: user,
        createdAt: now,
      });
  });
  revalidatePath("/", "layout");
  redirect("/admin/news");
}

export async function deleteNews(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  await transact((db) => {
    db.news = db.news.filter((n) => n.id !== id);
  });
  revalidatePath("/", "layout");
  redirect("/admin/news");
}

export async function deleteSamples() {
  await requireAdmin();
  await transact((db) => {
    db.events = db.events.filter((e) => !e.sample);
    db.news = db.news.filter((n) => !n.sample);
  });
  revalidatePath("/", "layout");
  redirect("/admin");
}
