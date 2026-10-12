import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { formatMonth, getDictionary, fill, weekdayNames } from "@/lib/i18n";
import type { PublicEvent } from "@/lib/events";
import type { Locale } from "@/lib/types";

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function MonthCalendar({
  month,
  events,
  locale,
  hrefFor,
  today,
}: {
  month: string;
  events: PublicEvent[];
  locale: Locale;
  hrefFor: (month: string) => string;
  today: string;
}) {
  const t = getDictionary(locale);
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const cells = Array.from({ length: Math.ceil((lead + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - lead + 1;
    return day >= 1 && day <= daysInMonth ? `${month}-${String(day).padStart(2, "0")}` : null;
  });
  const byDate = new Map<string, PublicEvent[]>();
  for (const e of events) byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]);
  const Prev = locale === "ar" ? CaretRight : CaretLeft;
  const Next = locale === "ar" ? CaretLeft : CaretRight;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{formatMonth(month, locale)}</h2>
        <div className="flex gap-2">
          <Link href={hrefFor(shiftMonth(month, -1))} aria-label={t.events.prevMonth} className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-ink/40">
            <Prev size={18} />
          </Link>
          <Link href={hrefFor(shiftMonth(month, 1))} aria-label={t.events.nextMonth} className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-ink/40">
            <Next size={18} />
          </Link>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden overflow-hidden rounded-[var(--radius-panel)] border border-line md:block">
        <div className="grid grid-cols-7 bg-raised text-center text-sm text-muted">
          {weekdayNames(locale).map((w) => (
            <div key={w} className="py-2.5">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            const list = date ? byDate.get(date) ?? [] : [];
            return (
              <div key={i} className={`min-h-28 border-t border-line p-2 [&:not(:nth-child(7n+1))]:border-s ${date ? "bg-surface" : "bg-bg"}`}>
                {date && (
                  <>
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm tabular-nums ${date === today ? "bg-accent text-accent-ink" : "text-muted"}`}>
                      {Number(date.slice(8))}
                    </span>
                    <ul className="mt-1 space-y-1">
                      {list.slice(0, 2).map((e) => (
                        <li key={e.id}>
                          <Link href={`/${locale}/events/${e.slug}`} className="block truncate rounded-md bg-accent-soft px-2 py-1 text-xs text-ink hover:bg-accent hover:text-accent-ink">
                            <span className="tabular-nums" dir="ltr">{e.start}</span> {e.title}
                          </Link>
                        </li>
                      ))}
                      {list.length > 2 && <li className="px-2 text-xs text-muted">{fill(t.events.more, { n: list.length - 2 })}</li>}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: agenda for the month */}
      <ul className="space-y-3 md:hidden">
        {cells.filter((d): d is string => !!d && byDate.has(d)).map((date) => (
          <li key={date} className="rounded-[var(--radius-panel)] border border-line bg-surface p-4">
            <p className="text-sm text-muted">{new Intl.DateTimeFormat(locale === "ar" ? "ar-LB-u-nu-latn" : "en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))}</p>
            <ul className="mt-2 space-y-2">
              {byDate.get(date)!.map((e) => (
                <li key={e.id}>
                  <Link href={`/${locale}/events/${e.slug}`} className="font-medium hover:text-accent">
                    <span className="tabular-nums text-muted" dir="ltr">{e.start}</span> {e.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
        {!events.length && <li className="text-muted">{t.events.empty}</li>}
      </ul>
    </div>
  );
}
