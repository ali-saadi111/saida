import type { Metadata } from "next";
import Link from "next/link";
import { CalendarBlank, ListBullets } from "@phosphor-icons/react/dist/ssr";
import { EventRow } from "@/components/EventRow";
import { MonthCalendar } from "@/components/MonthCalendar";
import { PageHeader } from "@/components/PageHeader";
import { AUDIENCES, CATEGORIES, PROGRAMME_START } from "@/lib/config";
import { applyFilters, publicEvents, todayBeirut, toPublic } from "@/lib/events";
import { fill, formatMonth, getDictionary, pick } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { btn, container } from "@/lib/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return { title: t.events.title, description: t.events.lead };
}

type Search = { view?: string; month?: string; category?: string; audience?: string };

const MONTHS = Array.from({ length: 12 }, (_, i) => `2027-${String(i + 1).padStart(2, "0")}`);

export default async function EventsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<Search> }) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = getDictionary(locale);
  const view = sp.view === "calendar" ? "calendar" : "list";
  const month = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : undefined;
  const category = CATEGORIES.some((c) => c.id === sp.category) ? sp.category : undefined;
  const audience = AUDIENCES.some((a) => a.id === sp.audience) ? sp.audience : undefined;

  const all = (await publicEvents()).map(toPublic);
  const today = todayBeirut();
  const calMonth = month ?? (today < PROGRAMME_START ? PROGRAMME_START.slice(0, 7) : today.slice(0, 7));
  const filtered = applyFilters(all, { month: view === "calendar" ? calMonth : month, category, audience });

  const qs = (over: Partial<Search>) => {
    const q = new URLSearchParams();
    const merged = { view, month, category, audience, ...over };
    for (const [k, v] of Object.entries(merged)) if (v && !(k === "view" && v === "list")) q.set(k, v);
    const s = q.toString();
    return `/${locale}/events${s ? `?${s}` : ""}`;
  };
  const hasFilters = !!(month || category || audience);

  return (
    <>
      <PageHeader title={t.events.title} lead={t.events.lead} />
      <div className={container}>
        <form method="get" className="grid gap-4 rounded-[var(--radius-panel)] border border-line bg-surface p-4 sm:p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end" aria-label={t.events.filters}>
          {view === "calendar" && <input type="hidden" name="view" value="calendar" />}
          <label className="grid gap-1.5 text-sm font-medium">
            {t.events.month}
            <select name="month" defaultValue={month ?? ""} className="field">
              <option value="">{t.events.anyMonth}</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{formatMonth(m, locale)}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t.events.category}
            <select name="category" defaultValue={category ?? ""} className="field">
              <option value="">{t.events.anyCategory}</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{pick(c.name, locale)}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t.events.audience}
            <select name="audience" defaultValue={audience ?? ""} className="field">
              <option value="">{t.events.anyAudience}</option>
              {AUDIENCES.map((a) => (
                <option key={a.id} value={a.id}>{pick(a.name, locale)}</option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button type="submit" className={`${btn.primary} !py-2.5`}>{t.events.apply}</button>
            {hasFilters && (
              <Link href={qs({ month: undefined, category: undefined, audience: undefined })} className={`${btn.secondary} !py-2.5`}>
                {t.events.reset}
              </Link>
            )}
          </div>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-muted" aria-live="polite">
            {filtered.length === 1 ? t.events.countOne : fill(t.events.count, { n: filtered.length })}
          </p>
          <div className="inline-flex rounded-full border border-line p-1" role="group">
            <Link href={qs({ view: "list" })} aria-current={view === "list" ? "page" : undefined} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm aria-[current=page]:bg-ink aria-[current=page]:text-bg">
              <ListBullets size={16} aria-hidden="true" /> {t.events.list}
            </Link>
            <Link href={qs({ view: "calendar" })} aria-current={view === "calendar" ? "page" : undefined} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm aria-[current=page]:bg-ink aria-[current=page]:text-bg">
              <CalendarBlank size={16} aria-hidden="true" /> {t.events.calendar}
            </Link>
          </div>
        </div>

        <div className="mt-6">
          {view === "calendar" ? (
            <MonthCalendar month={calMonth} events={filtered} locale={locale} today={today} hrefFor={(m) => qs({ month: m })} />
          ) : filtered.length ? (
            <ul className="divide-y divide-line">
              {filtered.map((e) => (
                <EventRow key={e.id} event={e} locale={locale} />
              ))}
            </ul>
          ) : (
            <div className="rounded-[var(--radius-panel)] border border-dashed border-line p-12 text-center">
              <p className="text-lg font-medium">{t.events.empty}</p>
              <p className="mt-2 text-muted">{t.events.emptyHint}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
