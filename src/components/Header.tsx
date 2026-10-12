"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { btn, container } from "@/lib/ui";
import { Mark } from "./Mark";

export function Header({ locale, t }: { locale: Locale; t: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const other: Locale = locale === "ar" ? "en" : "ar";
  const switchHref = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${other}`);
  const links = [
    { href: `/${locale}/events`, label: t.nav.events },
    { href: `/${locale}/news`, label: t.nav.news },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <div className={`${container} flex h-16 items-center gap-6 lg:h-[72px]`}>
        <Link href={`/${locale}`} className="flex items-center gap-2.5 text-ink" aria-label={t.nav.home}>
          <Mark className="h-8 w-8 text-accent" />
          <span className="text-[1.05rem] font-semibold tracking-tight">
            {locale === "ar" ? "صيدا 2027" : "MCCD Saida 2027"}
          </span>
        </Link>

        <nav aria-label={t.nav.menu} className="ms-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className="rounded-full px-3.5 py-2 text-[0.95rem] text-muted transition-colors hover:text-ink aria-[current=page]:text-ink aria-[current=page]:font-medium"
            >
              {l.label}
            </Link>
          ))}
          <Link href={switchHref} lang={other} hrefLang={other} aria-label={t.nav.languageLabel} className="rounded-full px-3.5 py-2 text-[0.95rem] text-muted hover:text-ink">
            {t.nav.language}
          </Link>
          <Link href={`/${locale}/submit`} className={`${btn.primary} ms-2 !px-5 !py-2.5`}>
            {t.nav.submit}
          </Link>
        </nav>

        <button
          type="button"
          className="ms-auto inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? t.nav.close : t.nav.menu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label={t.nav.menu} className="border-t border-line bg-bg lg:hidden">
          <div className={`${container} flex flex-col py-3`}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className="py-3 text-lg text-ink aria-[current=page]:text-accent"
              >
                {l.label}
              </Link>
            ))}
            <Link href={switchHref} lang={other} hrefLang={other} className="py-3 text-lg text-muted">
              {t.nav.language}
            </Link>
            <Link href={`/${locale}/submit`} className={`${btn.primary} my-3`}>
              {t.nav.submit}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
