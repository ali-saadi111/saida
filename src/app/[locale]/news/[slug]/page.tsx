import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ShareBar } from "@/components/ShareBar";
import { NEWS_KINDS, siteUrl } from "@/lib/config";
import { fill, formatIso, getDictionary, pick } from "@/lib/i18n";
import { newsBySlug } from "@/lib/news";
import type { Locale } from "@/lib/types";
import { btn, container } from "@/lib/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const n = await newsBySlug(slug);
  if (!n) return {};
  return { title: pick(n.title, locale), description: pick(n.excerpt, locale), openGraph: { type: "article", title: pick(n.title, locale), description: pick(n.excerpt, locale) } };
}

export default async function NewsPost({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const t = getDictionary(locale);
  const n = await newsBySlug(slug);
  if (!n) notFound();
  const Back = locale === "ar" ? ArrowRight : ArrowLeft;
  const title = pick(n.title, locale);
  return (
    <article className={`${container} max-w-3xl pt-8`}>
      <Link href={`/${locale}/news`} className={btn.quiet}>
        <Back size={16} aria-hidden="true" /> {t.nav.news}
      </Link>
      <p className="rise mt-10 text-sm text-accent">{pick(NEWS_KINDS.find((k) => k.id === n.kind)!.name, locale)}</p>
      <h1 className="rise mt-3 text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl" style={{ "--i": 1 } as React.CSSProperties}>{title}</h1>
      <p className="mt-4 text-muted">
        <time dateTime={n.publishAt}>{fill(t.news.published, { date: formatIso(n.publishAt, locale) })}</time>
      </p>
      <div className="mt-10 space-y-5 text-lg leading-relaxed">
        {pick(n.body, locale).split(/\n{2,}/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-12 border-t border-line pt-8">
        <h2 className="text-sm font-semibold">{t.event.share}</h2>
        <div className="mt-3">
          <ShareBar url={`${siteUrl()}/${locale}/news/${n.slug}`} title={title} t={t} />
        </div>
      </div>
    </article>
  );
}
