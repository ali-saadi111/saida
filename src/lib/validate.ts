import { AUDIENCES, CATEGORIES, LANGUAGES, PROGRAMME_END, PROGRAMME_START, VENUES } from "./config";
import { validateSlot } from "./booking";

export type FieldError =
  | "required" | "email" | "phone" | "url" | "tooLong" | "date" | "timeOrder" | "timeRange" | "timeFormat" | "conflict" | "file" | "consent" | "number";

export type EventInput = {
  title: string; summary: string; description: string; category: string; audience: string; language: string;
  date: string; start: string; end: string; venueId: string; venueOther: string;
  organizerName: string; organization: string; contactEmail: string; contactPhone: string;
  expectedAttendance: string; accessibility: string; cost: string; ticketUrl: string; website: string;
  consentPublish: boolean; consentContact: boolean;
};

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export function readEventForm(fd: FormData): EventInput {
  return {
    title: str(fd, "title"), summary: str(fd, "summary"), description: str(fd, "description"),
    category: str(fd, "category"), audience: str(fd, "audience"), language: str(fd, "language"),
    date: str(fd, "date"), start: str(fd, "start"), end: str(fd, "end"), venueId: str(fd, "venueId"), venueOther: str(fd, "venueOther"),
    organizerName: str(fd, "organizerName"), organization: str(fd, "organization"),
    contactEmail: str(fd, "contactEmail"), contactPhone: str(fd, "contactPhone"),
    expectedAttendance: str(fd, "expectedAttendance"), accessibility: str(fd, "accessibility"),
    cost: str(fd, "cost"), ticketUrl: str(fd, "ticketUrl"), website: str(fd, "website"),
    consentPublish: fd.get("consentPublish") === "on", consentContact: fd.get("consentContact") === "on",
  };
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

export function validateEvent(v: EventInput, opts: { requireConsent?: boolean } = { requireConsent: true }) {
  const e: Partial<Record<keyof EventInput, FieldError>> = {};
  const req = (k: keyof EventInput) => {
    if (!String(v[k]).trim()) e[k] = "required";
  };
  (["title", "summary", "description", "category", "audience", "language", "date", "venueId", "organizerName", "contactEmail", "contactPhone"] as const).forEach(req);
  const max = { title: 120, summary: 200, description: 4000, organization: 120, organizerName: 120, accessibility: 600, cost: 60, venueOther: 200 } as const;
  for (const [k, n] of Object.entries(max)) if (!e[k as keyof EventInput] && String(v[k as keyof EventInput]).length > n) e[k as keyof EventInput] = "tooLong";

  if (v.category && !CATEGORIES.some((c) => c.id === v.category)) e.category = "required";
  if (v.audience && !AUDIENCES.some((a) => a.id === v.audience)) e.audience = "required";
  if (v.language && !LANGUAGES.some((l) => l.id === v.language)) e.language = "required";
  if (v.venueId && !VENUES.some((x) => x.id === v.venueId)) e.venueId = "required";
  if (v.venueId === "other" && !v.venueOther) e.venueOther = "required";
  if (v.contactEmail && !isEmail(v.contactEmail)) e.contactEmail = "email";
  if (v.contactPhone && v.contactPhone.replace(/\D/g, "").length < 7) e.contactPhone = "phone";
  if (v.ticketUrl && !isUrl(v.ticketUrl)) e.ticketUrl = "url";
  if (v.website && !isUrl(v.website)) e.website = "url";
  if (v.expectedAttendance && !/^\d{1,6}$/.test(v.expectedAttendance)) e.expectedAttendance = "number";

  if (v.date && (v.date < PROGRAMME_START || v.date > PROGRAMME_END || !/^\d{4}-\d{2}-\d{2}$/.test(v.date))) e.date = "date";
  const slot = validateSlot({ date: v.date || PROGRAMME_START, start: v.start, end: v.end, venueId: v.venueId });
  if (slot === "time-format") e.start = "timeFormat";
  else if (slot === "time-order") e.end = "timeOrder";
  else if (slot === "time-range") e.start = "timeRange";

  if (opts.requireConsent && !v.consentPublish) e.consentPublish = "consent";
  if (opts.requireConsent && !v.consentContact) e.consentContact = "consent";
  return e;
}
