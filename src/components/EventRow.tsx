import Link from "next/link";
import { ArrowUpRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import { categoryById, venueById } from "@/lib/config";
import { formatDateParts, getDictionary, pick } from "@/lib/i18n";
import type { PublicEvent } from "@/lib/events";
import type { Locale } from "@/lib/types";

export function venueLabel(e: Pick<PublicEvent, "venueId" | "venueOther">, locale: Locale) {
  if (e.venueId === "other") return e.venueOther || venueById("other")!.name[locale];
  const v = venueById(e.venueId);
  return v ? pick(v.name, locale) : "";
}

/** One event in a date-led list. */
export function EventRow({ event, locale }: { event: PublicEvent; locale: Locale }) {
  const t = getDictionary(locale);
  const d = formatDateParts(event.date, locale);
  const cat = categoryById(event.category);
  return (
    <li>
      <Link
        href={`/${locale}/events/${event.slug}`}
        className="group grid grid-cols-[4.5rem_1fr] items-start gap-5 rounded-[var(--radius-panel)] py-6 transition-colors sm:grid-cols-[5.5rem_1fr_auto] sm:gap-8"
      >
        <div className="flex flex-col items-center rounded-[var(--radius-panel)] border border-line bg-surface py-3 text-center">
          <span className="text-xs text-muted">{d.weekday}</span>
          <span className="text-3xl font-semibold leading-none tabular-nums">{d.day}</span>
          <span className="mt-1 text-sm text-muted">{d.month}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-accent">
            {cat && pick(cat.name, locale)}
            <span className="mx-2 text-line" aria-hidden="true">/</span>
            <span className="tabular-nums text-muted" dir="ltr">{event.start} - {event.end}</span>
          </p>
          <h3 dir="auto" className="mt-1.5 text-xl font-medium leading-snug text-balance group-hover:text-accent">{event.title}</h3>
          <p dir="auto" className="mt-2 line-clamp-2 max-w-[60ch] text-muted">{event.summary}</p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={16} aria-hidden="true" />
            {venueLabel(event, locale)}
            {event.sample && <span className="ms-3 rounded-full bg-raised px-2.5 py-0.5 text-xs">{t.common.sample}</span>}
          </p>
        </div>
        <ArrowUpRight
          size={22}
          aria-hidden="true"
          className="hidden self-center text-muted transition-transform group-hover:-translate-y-0.5 group-hover:text-accent sm:block rtl:-scale-x-100"
        />
      </Link>
    </li>
  );
}
