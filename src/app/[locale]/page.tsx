import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { EventRow } from "@/components/EventRow";
import { toPublic, upcomingEvents } from "@/lib/events";
import { publishedNews } from "@/lib/news";
import { formatIso, getDictionary, pick } from "@/lib/i18n";
import { NEWS_KINDS } from "@/lib/config";
import type { Locale } from "@/lib/types";
import { btn, container } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const [events, news] = await Promise.all([upcomingEvents(4), publishedNews()]);
  const [lead, ...rest] = news.slice(0, 3);
  const p = `/${locale}`;

  return (
    <>
      {/* Hero: split, text first, harbour photograph second */}
      <section className={`${container} grid items-center gap-10 pb-16 pt-10 md:pt-16 lg:grid-cols-[1fr_1.15fr] lg:gap-14 lg:pb-20`}>
        <div className="max-w-xl">
          <p className="rise text-sm font-medium text-accent">{t.home.eyebrow}</p>
          <h1 className="rise mt-4 text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl" style={{ "--i": 1 } as React.CSSProperties}>
            {t.home.title}
          </h1>
          <p className="rise mt-6 max-w-[42ch] text-lg leading-relaxed text-muted sm:text-xl" style={{ "--i": 2 } as React.CSSProperties}>
            {t.home.lead}
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ "--i": 3 } as React.CSSProperties}>
            <Link href={`${p}/events`} className={btn.primary}>
              {t.home.ctaEvents}
              <ArrowRight size={18} aria-hidden="true" className="rtl:-scale-x-100" />
            </Link>
            <Link href={`${p}/submit`} className={btn.secondary}>
              {t.home.ctaSubmit}
            </Link>
          </div>
        </div>
        <div className="rise relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] lg:aspect-[5/4]" style={{ "--i": 2 } as React.CSSProperties}>
          <Image
            src="/images/sea-castle-harbour.jpg"
            alt={t.home.heroAlt}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover object-[60%_50%]"
          />
        </div>
      </section>

      {/* Upcoming: date-led list */}
      <section className={`${container} py-16`} aria-labelledby="upcoming">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="upcoming" className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.home.upcomingTitle}</h2>
          <Link href={`${p}/events`} className={btn.quiet}>
            {t.common.allEvents}
            <ArrowRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
          </Link>
        </div>
        {events.length ? (
          <ul className="mt-6 divide-y divide-line">
            {events.map((e) => (
              <EventRow key={e.id} event={toPublic(e)} locale={locale} />
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-[var(--radius-panel)] border border-dashed border-line p-10 text-center">
            <p className="mx-auto max-w-md text-muted">{t.home.upcomingEmpty}</p>
            <Link href={`${p}/submit`} className={`${btn.primary} mt-6`}>{t.home.ctaSubmit}</Link>
          </div>
        )}
      </section>

      {/* Programme intro: offset image pair with text */}
      <section className={`${container} reveal grid gap-12 py-16 md:grid-cols-12 md:items-center`} aria-labelledby="intro">
        <div className="grid grid-cols-5 gap-4 md:col-span-6">
          <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-[var(--radius-panel)]">
            <Image src="/images/khan-al-franj-arch.jpg" alt={t.home.introAltA} fill sizes="(min-width: 768px) 30vw, 60vw" className="object-cover" />
          </div>
          <div className="relative col-span-2 mt-16 aspect-[3/4] overflow-hidden rounded-[var(--radius-panel)]">
            <Image src="/images/khan-al-franj-courtyard.jpg" alt={t.home.introAltB} fill sizes="(min-width: 768px) 20vw, 40vw" className="object-cover" />
          </div>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <h2 id="intro" className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.home.introTitle}</h2>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">{t.home.introBody}</p>
          <p className="mt-4 max-w-[60ch] leading-relaxed text-muted">{t.home.introBody2}</p>
          <Link href={`${p}/about`} className={`${btn.quiet} mt-6`}>
            {t.home.introLink}
            <ArrowRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
          </Link>
        </div>
      </section>

      {/* Organizers: full-width band over the Khan hall */}
      <section className="reveal py-16" aria-labelledby="organizers">
        <div className={container}>
          <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[#0b2a3b] text-[#eef4f6]">
            <Image src="/images/khan-al-franj-hall.jpg" alt="" fill sizes="100vw" className="object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071c27] via-[#0b2a3b]/80 to-[#0b2a3b]/40 ltr:md:bg-gradient-to-r rtl:md:bg-gradient-to-l" />
            <div className="relative grid gap-12 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
              <div className="max-w-md">
                <h2 id="organizers" className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.home.organizersTitle}</h2>
                <p className="mt-4 text-lg leading-relaxed text-[#c9d9e0]">{t.home.organizersBody}</p>
                <Link
                  href={`${p}/submit`}
                  className="mt-8 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#eef4f6] px-6 py-3 font-medium text-[#0b2a3b] transition-transform hover:bg-white active:translate-y-px"
                >
                  {t.home.ctaSubmit}
                  <ArrowRight size={18} aria-hidden="true" className="rtl:-scale-x-100" />
                </Link>
              </div>
              <ol className="space-y-7 self-center">
                {t.home.organizersSteps.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eef4f6]/40 font-medium tabular-nums">{i + 1}</span>
                    <div>
                      <h3 className="text-lg font-medium">{s.title}</h3>
                      <p className="mt-1 text-[#c9d9e0]">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* News: one lead story, two in a side list */}
      {lead && (
        <section className={`${container} reveal py-16`} aria-labelledby="news">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="news" className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.home.newsTitle}</h2>
            <Link href={`${p}/news`} className={btn.quiet}>
              {t.common.allNews}
              <ArrowRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
            </Link>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <Link href={`${p}/news/${lead.slug}`} className="group block rounded-[var(--radius-panel)] bg-surface p-8 shadow-soft sm:p-10">
              <p className="text-sm text-accent">{pick(NEWS_KINDS.find((k) => k.id === lead.kind)!.name, locale)}</p>
              <h3 className="mt-3 text-2xl font-medium leading-snug text-balance group-hover:text-accent sm:text-3xl">{pick(lead.title, locale)}</h3>
              <p className="mt-4 max-w-[55ch] text-muted">{pick(lead.excerpt, locale)}</p>
              <p className="mt-6 text-sm text-muted">{formatIso(lead.publishAt, locale)}</p>
            </Link>
            <ul className="divide-y divide-line">
              {rest.map((n) => (
                <li key={n.id}>
                  <Link href={`${p}/news/${n.slug}`} className="group block py-6 first:pt-0">
                    <p className="text-sm text-muted">{formatIso(n.publishAt, locale)}</p>
                    <h3 className="mt-1.5 text-lg font-medium leading-snug group-hover:text-accent">{pick(n.title, locale)}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Who is behind it: role grid, text only until logos are approved */}
      <section className={`${container} reveal py-16`} aria-labelledby="partners">
        <h2 id="partners" className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.home.partnersTitle}</h2>
        <dl className="mt-10 grid gap-x-10 gap-y-10 border-t border-line pt-10 md:grid-cols-3">
          {t.partners.map((pt) => (
            <div key={pt.role}>
              <dt className="text-sm text-muted">{pt.role}</dt>
              <dd className="mt-2">
                <p className="text-lg font-medium leading-snug">{pt.name}</p>
                <p className="mt-2 text-muted">{pt.body}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
