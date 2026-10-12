import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { read } from "@/lib/db";
import { fill, formatDate, getDictionary } from "@/lib/i18n";
import { venueLabel } from "@/components/EventRow";
import type { Locale } from "@/lib/types";
import { btn, container } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

export default async function Confirmed({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ ref?: string }> }) {
  const { locale } = await params;
  const { ref } = await searchParams;
  const t = getDictionary(locale);
  const e = (await read()).events.find((x) => x.ref === ref);
  if (!e) notFound();

  return (
    <div className={`${container} max-w-3xl py-16 sm:py-24`}>
      <CheckCircle size={56} weight="duotone" className="rise text-ok" aria-hidden="true" />
      <h1 className="rise mt-6 text-4xl font-semibold tracking-tight sm:text-5xl" style={{ "--i": 1 } as React.CSSProperties}>{t.confirmed.title}</h1>
      <p className="rise mt-4 text-lg text-muted" style={{ "--i": 2 } as React.CSSProperties}>{t.confirmed.body}</p>

      <dl className="rise mt-10 grid gap-6 rounded-[var(--radius-panel)] bg-surface p-6 shadow-soft sm:grid-cols-2 sm:p-8" style={{ "--i": 3 } as React.CSSProperties}>
        <div className="sm:col-span-2">
          <dt className="text-sm text-muted">{t.confirmed.ref}</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-wide tabular-nums" dir="ltr">{e.ref}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.event.when}</dt>
          <dd className="mt-1 font-medium">{formatDate(e.date, locale)}<br /><span dir="ltr" className="tabular-nums">{e.start} - {e.end}</span></dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.event.where}</dt>
          <dd className="mt-1 font-medium">{venueLabel(e, locale)}</dd>
        </div>
      </dl>

      <p className="mt-8">{fill(t.confirmed.emailSent, { email: maskEmail(e.contactEmail) })}</p>
      <p className="mt-2 text-muted">{t.confirmed.next}</p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={`/${locale}/events/${e.slug}`} className={btn.primary}>{t.confirmed.view}</Link>
        <Link href={`/${locale}/submit`} className={btn.secondary}>{t.confirmed.another}</Link>
      </div>
    </div>
  );
}
