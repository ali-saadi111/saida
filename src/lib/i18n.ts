import type { Locale, Localized } from "./types";
import { en } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";

export const LOCALES: Locale[] = ["ar", "en"];
export const DEFAULT_LOCALE: Locale = "ar";

export function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return locale === "ar" ? ar : en;
}

export function dir(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function pick(value: Localized, locale: Locale) {
  return value[locale] || value.en;
}

/** Replace {name} placeholders. */
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

const intlLocale = (l: Locale) => (l === "ar" ? "ar-LB-u-nu-latn" : "en-GB");

// Dates are stored as Beirut-local YYYY-MM-DD; format at UTC noon so no timezone can shift the day.
function asDate(ymd: string) {
  return new Date(`${ymd}T12:00:00Z`);
}

export function formatDate(ymd: string, locale: Locale, opts: Intl.DateTimeFormatOptions = { dateStyle: "full" }) {
  return new Intl.DateTimeFormat(intlLocale(locale), { ...opts, timeZone: "UTC" }).format(asDate(ymd));
}

export function formatDateParts(ymd: string, locale: Locale) {
  const d = asDate(ymd);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intlLocale(locale), { ...o, timeZone: "UTC" }).format(d);
  return { day: f({ day: "numeric" }), month: f({ month: "short" }), weekday: f({ weekday: "short" }), year: f({ year: "numeric" }) };
}

export function formatMonth(ym: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), { month: "long", year: "numeric", timeZone: "UTC" }).format(asDate(`${ym}-01`));
}

export function formatIso(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "long", timeZone: "Asia/Beirut" }).format(new Date(iso));
}

export function weekdayNames(locale: Locale) {
  // 2027-01-04 is a Monday
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(intlLocale(locale), { weekday: "short", timeZone: "UTC" }).format(asDate(`2027-01-${String(4 + i).padStart(2, "0")}`)),
  );
}
