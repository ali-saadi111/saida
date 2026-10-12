import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarPlus, Clock, MapPin, Ticket, Globe } from "@phosphor-icons/react/dist/ssr";
import { EventRow, venueLabel } from "@/components/EventRow";
import { ShareBar } from "@/components/ShareBar";
import { audienceById, categoryById, languageById, siteUrl, venueById } from "@/lib/config";
import { eventBySlug, toPublic, upcomingEvents } from "@/lib/events";
import { formatDate, getDictionary, pick, fill } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { beirutIso } from "@/lib/time";
import { btn, container } from "@/lib/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const e = await eventBySlug(decodeURIComponent(slug));
  if (!e) return {};
  const image = e.attachment && !e.attachment.endsWith(".pdf") ? `/api/uploads/${e.attachment}` : categoryById(e.category)?.image;
  return {
    title: e.title,
    description: e.summary,
    openGraph: { title: e.title, description: e.summary, type: "article", images: image ? [image] : undefined, url: `/${locale}/events/${e.slug}` },
    twitter: { card: "summary_large_image", title: e.title, description: e.summary },
  };
}

export default async function EventPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const t = getDictionary(locale);
  const record = await eventBySlug(decodeURIComponent(slug));
  if (!record) notFound();
  const e = toPublic(record);
  const cat = categoryById(e.category);
  const venue = venueById(e.venueId);
  const lang = languageById(e.language);
  const aud = audienceById(e.audience);
  const image = e.attachment && !e.attachment.endsWith(".pdf") ? `/api/uploads/${e.attachment}` : cat?.image ?? "/images/sea-castle.jpg";
  const url = `${siteUrl()}/${locale}/events/${e.slug}`;
  const more = (await upcomingEvents(4)).filter((x) => x.id !== e.id).slice(0, 3);
  const Back = locale === "ar" ? ArrowRight : ArrowLeft;
  const hasMap = venue?.lat != null && venue?.lng != null;
  const bbox = hasMap ? [venue.lng! - 0.004, venue.lat! - 0.0025, venue.lng! + 0.004, venue.lat! + 0.0025].join(",") : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.summary,
    startDate: beirutIso(e.date, e.start),
    endDate: beirutIso(e.date, e.end),
    eventStatus: e.status === "cancelled" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: venueLabel(e, locale), address: "Saida, Lebanon" },
    organizer: { "@type": "Organization", name: e.organization || e.organizerName },
    image: `${siteUrl()}${image}`,
    isAccessibleForFree: !e.cost,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className={`${container} pt-8`}>
        <Link href={`/${locale}/events`} className={btn.quiet}>
          <Back size={16} aria-hidden="true" /> {t.nav.events}
        </Link>
      </div>

      <header className={`${container} grid gap-10 pb-10 pt-6 lg:grid-cols-[1.1fr_1fr] lg:items-end`}>
        <div>
          <p className="rise text-sm font-medium text-accent">
            {cat && pick(cat.name, locale)}
            {e.sample && <span className="ms-3 rounded-full bg-raised px-2.5 py-0.5 text-xs text-muted">{t.common.sample}</span>}
          </p>
          <h1 dir="auto" className="rise mt-3 text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl" style={{ "--i": 1 } as React.CSSProperties}>
            {e.title}
          </h1>
          <p dir="auto" className="rise mt-5 max-w-[55ch] text-lg text-muted" style={{ "--i": 2 } as React.CSSProperties}>{e.summary}</p>
        </div>
        <div className="rise relative aspect-[16/10] overflow-hidden rounded-[var(--radius-panel)]" style={{ "--i": 2 } as React.CSSProperties}>
          <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" unoptimized={image.startsWith("/api/")} />
        </div>
      </header>

      {e.status === "cancelled" && (
        <div className={container}>
          <p role="status" className="rounded-[var(--radius-field)] bg-danger-soft px-5 py-4 font-medium text-danger">{t.event.cancelled}</p>
        </div>
      )}

      <div className={`${container} grid gap-12 py-8 lg:grid-cols-[1.1fr_1fr]`}>
        <div>
          <div className="max-w-[65ch] space-y-4 text-lg leading-relaxed">
            {e.description.split(/\n{2,}/).map((para, i) => (
              <p key={i} dir="auto">{para}</p>
            ))}
          </div>

          <div className="mt-10 border-t border-line pt-8">
            <h2 className="text-sm font-semibold">{t.event.share}</h2>
            <div className="mt-3">
              <ShareBar url={url} title={e.title} t={t} />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <dl className="grid gap-6 rounded-[var(--radius-panel)] bg-surface p-6 shadow-soft sm:p-8">
            <div className="flex gap-4">
              <Clock size={22} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <dt className="text-sm text-muted">{t.event.when}</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(e.date, locale)}
                  <br />
                  <span className="tabular-nums" dir="ltr">{e.start} - {e.end}</span>
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin size={22} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <dt className="text-sm text-muted">{t.event.where}</dt>
                <dd className="mt-1 font-medium">{venueLabel(e, locale)}</dd>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 border-t border-line pt-6">
              <div>
                <dt className="text-sm text-muted">{t.event.cost}</dt>
                <dd className="mt-1 font-medium">{e.cost || t.common.free}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{t.event.language}</dt>
                <dd className="mt-1 font-medium">{lang ? pick(lang.name, locale) : e.language}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{t.event.audience}</dt>
                <dd className="mt-1 font-medium">{aud ? pick(aud.name, locale) : ""}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{t.event.organizer}</dt>
                <dd className="mt-1 font-medium">{e.organization || e.organizerName}</dd>
              </div>
            </div>
            <div className="border-t border-line pt-6">
              <dt className="text-sm text-muted">{t.event.accessibility}</dt>
              <dd className="mt-1" dir="auto">{e.accessibility || t.event.accessibilityNone}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3">
            {e.ticketUrl && (
              <a href={e.ticketUrl} target="_blank" rel="noopener noreferrer" className={btn.primary}>
                <Ticket size={18} aria-hidden="true" /> {t.event.tickets}
              </a>
            )}
            <a href={`/api/events/${encodeURIComponent(e.slug)}/ics`} className={btn.secondary}>
              <CalendarPlus size={18} aria-hidden="true" /> {t.event.addCalendar}
            </a>
            {e.website && (
              <a href={e.website} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
                <Globe size={18} aria-hidden="true" /> {t.event.website}
              </a>
            )}
          </div>

          {hasMap ? (
            <div>
              <h2 className="sr-only">{t.event.map}</h2>
              <div className="overflow-hidden rounded-[var(--radius-panel)] border border-line">
                <iframe
                  title={fill(t.event.mapTitle, { venue: venueLabel(e, locale) })}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${venue.lat},${venue.lng}`}
                  className="block aspect-[4/3] w-full"
                  loading="lazy"
                />
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${venue.lat}&mlon=${venue.lng}#map=18/${venue.lat}/${venue.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn.quiet} mt-3 text-sm`}
              >
                {t.event.openMap}
              </a>
            </div>
          ) : (
            <p className="text-muted">{t.event.venuePending}</p>
          )}
        </aside>
      </div>

      {more.length > 0 && (
        <section className={`${container} pt-12`} aria-labelledby="more-events">
          <h2 id="more-events" className="text-2xl font-semibold">{t.event.related}</h2>
          <ul className="mt-4 divide-y divide-line">
            {more.map((m) => (
              <EventRow key={m.id} event={toPublic(m)} locale={locale} />
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
