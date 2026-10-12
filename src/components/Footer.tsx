import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { container } from "@/lib/ui";
import { Mark } from "./Mark";

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const p = `/${locale}`;
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className={`${container} grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]`}>
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Mark className="h-8 w-8 text-accent" />
            <span className="font-semibold">{locale === "ar" ? "صيدا 2027" : "MCCD Saida 2027"}</span>
          </div>
          <p className="mt-4 text-muted">{t.footer.tagline}</p>
          <p className="mt-1 text-sm text-muted">{t.footer.note}</p>
        </div>
        <nav aria-label={t.footer.explore}>
          <h2 className="text-sm font-semibold">{t.footer.explore}</h2>
          <ul className="mt-4 space-y-2.5 text-muted">
            <li><Link className="hover:text-ink" href={`${p}/events`}>{t.nav.events}</Link></li>
            <li><Link className="hover:text-ink" href={`${p}/news`}>{t.nav.news}</Link></li>
            <li><Link className="hover:text-ink" href={`${p}/about`}>{t.nav.about}</Link></li>
          </ul>
        </nav>
        <nav aria-label={t.footer.organizers}>
          <h2 className="text-sm font-semibold">{t.footer.organizers}</h2>
          <ul className="mt-4 space-y-2.5 text-muted">
            <li><Link className="hover:text-ink" href={`${p}/submit`}>{t.nav.submit}</Link></li>
            <li><Link className="hover:text-ink" href={`${p}/contact`}>{t.nav.contact}</Link></li>
            <li><Link className="hover:text-ink" href={`${p}/privacy`}>{t.footer.privacy}</Link></li>
            <li><Link className="hover:text-ink" href={`${p}/about#credits`}>{t.footer.credits}</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
