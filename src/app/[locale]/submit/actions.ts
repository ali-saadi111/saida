"use server";

import { promises as fs } from "fs";
import path from "path";
import { redirect } from "next/navigation";
import { conflictsFor } from "@/lib/booking";
import { categoryById, siteUrl, venueById } from "@/lib/config";
import { newId, newRef, transact, uniqueSlug, UPLOAD_DIR } from "@/lib/db";
import { isLocale, formatDate } from "@/lib/i18n";
import { sendMail, teamInbox } from "@/lib/mail";
import type { EventRecord, Locale } from "@/lib/types";
import { saveUpload } from "@/lib/uploads";
import { readEventForm, validateEvent, type EventInput, type FieldError } from "@/lib/validate";

export interface SubmitState {
  errors?: Partial<Record<keyof EventInput | "file", FieldError>>;
  values?: EventInput;
  nonce?: number;
}

export async function submitEvent(_: SubmitState, fd: FormData): Promise<SubmitState> {
  const locale: Locale = isLocale(String(fd.get("locale"))) ? (String(fd.get("locale")) as Locale) : "en";
  const v = readEventForm(fd);
  const errors: SubmitState["errors"] = validateEvent(v);

  // Honeypot: real people never fill this hidden field.
  if (String(fd.get("company_website") ?? "")) return { values: v, nonce: Date.now() };

  const file = fd.get("file");
  let attachment: string | undefined;
  if (!Object.keys(errors).length && file instanceof File && file.size > 0) {
    const saved = await saveUpload(file);
    if ("error" in saved) errors.file = "file";
    else attachment = saved.name;
  }
  if (Object.keys(errors).length) return { errors, values: v, nonce: Date.now() };

  const result = await transact((db) => {
    if (conflictsFor(db.events, { date: v.date, start: v.start, end: v.end, venueId: v.venueId }).length) return null;
    const now = new Date().toISOString();
    const record: EventRecord = {
      id: newId(),
      ref: newRef(),
      slug: uniqueSlug(`${v.title}-${v.date}`, new Set(db.events.map((e) => e.slug))),
      status: "confirmed",
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
      attachment,
      consentPublish: v.consentPublish,
      consentContact: v.consentContact,
      createdAt: now,
      updatedAt: now,
    };
    db.events.push(record);
    return record;
  });

  if (!result) {
    if (attachment) await fs.rm(path.join(UPLOAD_DIR, attachment), { force: true });
    return { errors: { start: "conflict" }, values: v, nonce: Date.now() };
  }

  const venue = result.venueId === "other" ? result.venueOther : venueById(result.venueId)?.name[locale];
  const link = `${siteUrl()}/${locale}/events/${result.slug}`;
  const when = `${formatDate(result.date, locale)}, ${result.start} - ${result.end}`;
  await sendMail({
    to: result.contactEmail,
    subject: locale === "ar" ? `تأكيد حجز فعاليتكم ${result.ref}` : `Your MCCD Saida 2027 booking ${result.ref} is confirmed`,
    text:
      locale === "ar"
        ? `مرحباً ${result.organizerName}،\n\nتم تأكيد حجز فعاليتكم «${result.title}».\n\nالموعد: ${when}\nالمكان: ${venue}\nرقم الحجز: ${result.ref}\n\nتظهر فعاليتكم الآن في التقويم العام:\n${link}\n\nيبقى الحجز في الأماكن المدرجة رهن موافقة إدارة المكان. لأي تعديل، راسلونا مع ذكر رقم الحجز.\n\nفريق صيدا 2027`
        : `Hello ${result.organizerName},\n\nYour event "${result.title}" is confirmed.\n\nWhen: ${when}\nWhere: ${venue}\nBooking reference: ${result.ref}\n\nIt now appears in the public calendar:\n${link}\n\nBookings at listed venues remain subject to venue approval. For any change, reply with your booking reference.\n\nMCCD Saida 2027 team`,
  });
  const team = teamInbox();
  if (team) {
    await sendMail({
      to: team,
      replyTo: result.contactEmail,
      subject: `New booking ${result.ref}: ${result.title}`,
      text: `${result.title}\n${when}\n${venue}\nCategory: ${categoryById(result.category)?.name.en}\nOrganizer: ${result.organizerName}${result.organization ? ` (${result.organization})` : ""}\n${result.contactEmail} / ${result.contactPhone}\n\n${link}`,
    });
  }

  redirect(`/${locale}/submit/confirmed?ref=${result.ref}`);
}
